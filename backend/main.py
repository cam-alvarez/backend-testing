from fastapi import FastAPI, HTTPException, Depends, File, Form, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime
import pandas as pd
import io
import logging
import sys
import json
from database import Base, engine, get_db
from models import Project, Tag, Dataset, DatasetRow
import schemas

load_dotenv()

Base.metadata.create_all(bind=engine)

tags_metadata = [
    {
        "name": "Projects",
        "description": "Operations for managing projects. Create, retrieve, and list projects with associated tags and datasets."
    },
    {
        "name": "Datasets",
        "description": "Operations for uploading and managing CSV datasets. Datasets can be attached to projects."
    },
    {
        "name": "Root",
        "description": "Root endpoint and general API information."
    }
]

app = FastAPI(openapi_tags=tags_metadata)

origins = [
    os.getenv("FRONTEND_URL"),"http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_or_create_tag(db: Session, tag_name: str) -> Tag:
    """
    Get existing tag or create new one.
    This prevents duplicate tags in the database.
    """
    tag = db.query(Tag).filter(Tag.name == tag_name.strip()).first()
    if not tag:
        tag = Tag(name=tag_name.strip())
        db.add(tag)
        db.flush()  # Flush to get the ID without committing
    return tag

def create_dataset(db: Session, file: UploadFile) -> Dataset:
    if not file.filename.endswith('.csv'):
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV"
        )
    try:
        # Read the CSV file
        contents = file.file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Create dataset record
        dataset = Dataset(
            name=file.filename,
            filename=file.filename,
            row_count=len(df),
            columns=df.columns.tolist()
        )
        db.add(dataset)
        db.flush()  # Get dataset.id
        
        # Store each row as JSONB
        for idx, row in df.iterrows():
            # Convert row to dict, handle NaN values
            row_dict = {k: (None if pd.isna(v) else v) for k, v in row.to_dict().items()}
            
            dataset_row = DatasetRow(
                dataset_id=dataset.id,
                row_number=idx,
                data=row_dict
            )
            db.add(dataset_row)
        
        db.commit()
        db.refresh(dataset)
        
        return dataset
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV: {str(e)}"
        )


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API health check"""
    return {"message": "Project Management API is running!"}

@app.post("/api/projects", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED, tags=["Projects"])
async def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(get_db)
):
    # Check for existing project
    existing_project = db.query(Project).filter(Project.name == project.name).first()
    if existing_project:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A project with the name '{project.name}' already exists"
        )
    
    # Create new project
    new_project = Project(
        name=project.name,
        description=project.description
    )
    
    # Add tags
    if project.tags:
        for tag_name in project.tags:
            tag = get_or_create_tag(db, tag_name)
            new_project.tags.append(tag)
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return new_project

@app.get("/api/projects/{project_id}", response_model=schemas.ProjectResponse, tags=["Projects"])
async def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    return project

@app.get("/api/projects", response_model=List[schemas.ProjectResponse], tags=["Projects"])
async def list_projects(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects


@app.delete("/api/projects/{project_id}", response_model=schemas.SuccessResponse, tags=["Projects"])
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    
    db.delete(project)
    db.commit()

    return schemas.SuccessResponse(
        message=f"Project '{project.name}' deleted successfully"
    )

@app.patch("/api/projects/{project_id}", response_model=schemas.ProjectResponse, tags=["Projects"])
async def update_project(
    project_id: int,
    project_update: schemas.ProjectUpdate,
    db: Session = Depends(get_db)
):
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    
    if project_update.name is not None:
        existing = db.query(Project).filter(
            Project.name == project_update.name,
            Project.id != project_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Project name '{project_update.name} already taken"
            )
        project.name = project_update.name

    if project_update.description is not None:
        project.description = project_update.description

    if project_update.tags is not None:
        project.tags.clear()
        for tag_name in project_update.tags:
            tag = get_or_create_tag(db, tag_name)
            project.tags.append(tag)

    if project_update.datasets is not None:
        for dataset_id in project_update.datasets:
            dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()

            if not dataset:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Dataset with id {dataset_id} not found"
                    )
            
            if dataset in project.datasets:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Dataset is already linked to project '{project.name}'"
                )
            
            project.dataset.append(dataset) 
    
    db.commit()
    db.refresh(project)
    return project

@app.post("/api/projects/{project_id}/datasets", response_model=schemas.ProjectResponse, tags=["Projects"])

async def upload_datasets_to_project(
    project_id: int,
    files: list[UploadFile],
    db: Session = Depends(get_db)
):
    
    #### SWAGGER UI HAS AN ISSUE WITH SETTING UPLOADS TO OPTIONAL NEED TO TEST THE OPTIONAL VERSION WITH "files: list[UploadFile] | None = None" FROM THE FRONT END EVENTAULLY ####

    #### ADDITIONALLY, I NEED TO TEST THE EXPANDED VERSION OF THIS API WHERE THE DATASET ID CAN BE PASSED HERE OPTIONALLY AS WELL, THAT VERSION IS COMMENTED DOWN BELOW ####

    """Upload dataset(s) and attach it to a specific project"""
    # Get the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    
    if not files:
        return "No files have been uploaded"
    
    if files:
        for file in files:
        # Create and attach dataset
            dataset = create_dataset(db, file)
            project.datasets.append(dataset)
    
    db.commit()
    db.refresh(project)
    
    return project

@app.post("/api/datasets/upload", response_model=list[schemas.DatasetUploadResponse], tags=["Datasets"])
async def upload_datasets(
    files: list[UploadFile],
    db: Session = Depends(get_db)
):
    
    # Validate it's a CSV
    for file in files:
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} must be a CSV"
            )
        
    created_datasets=[]
    for file in files:
        dataset = create_dataset(db, file)
        created_datasets.append(dataset)
    
    return created_datasets

@app.get("/api/dataset/{dataset_id}", response_model=schemas.DatasetResponse, tags=["Datasets"])
async def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {dataset_id} not found"
        )
    return dataset

################ START HERE NEXT TIME PLZZZ ##########################
########### PROJECT_ID SUPPOSED TO BE OPTIONAL BUT THROUGH API THE BODY RESPONSE DEFAULT IS 0 NOT NONE SO AS IS CURRENTLY SET UP IF PROJECT_ID IS NOT REMOVED FROM THE BODY THEN THE NAME UPDATE DOES NOT WORK #####################

@app.patch("/api/dataset/{dataset_id}", response_model=schemas.DatasetUploadResponse, tags=["Datasets"])
async def edit_dataset(
    dataset_id: int,
    dataset_update: schemas.DatasetUpdate, 
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with id {dataset_id} not found"
        )
    
    if dataset_update.name is not None:
        existing = db.query(Dataset).filter(
            Dataset.name == dataset_update.name,
            Dataset.id != dataset_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Dataset name '{dataset_update.name}' already taken"
            )
        dataset.name = dataset_update.name

    if dataset_update.projects:

        for project_id in dataset_update.projects:

            project = db.query(Project).filter(Project.id == project_id).first()


            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project with id {project_id} not found"
                    )
            
            if project in dataset.projects:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Dataset is already linked to project '{project.name}'"
                )
            
            dataset.projects.append(project)
                
                
    db.commit()
    db.refresh(dataset)

    return dataset

@app.delete("/api/datasets/{dataset_id}/projects/{project_id}", tags=["Datasets"])
async def remove_dataset_from_project(
    dataset_id: int,
    project_id: int,
    db: Session = Depends(get_db)
):
    """Remove a dataset from a project"""
    
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with id {dataset_id} not found"
        )
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    
    if project not in dataset.projects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dataset is not linked to this project"
        )
    
    dataset.projects.remove(project)
    db.commit()
    
    return {"message": f"Dataset removed from project '{project.name}'"}

    # if dataset_update.project_id is not None:
        
    #     # Check if project id doesn't exist
    #     project = db.query(Project).filter(Project.id == dataset_update.project_id).first()
    #     if not project:
    #         raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail=f"Project with id {dataset_update.project_id} not found"
    #     )

        # Check if new project id already exists
        # existing = db.query(Dataset).filter(
        #     Dataset.project_id == dataset_update.project_id,
        #     Dataset.id != dataset_id,

        # ).first()
        # if existing:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Dataset already found in this project"
        #     )
        # project.datasets.append(dataset)
    
    
    
    

@app.delete("/api/datasets/{dataset_id}", response_model=schemas.SuccessResponse, tags=["Datasets"])
async def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with id {dataset_id} not found"
        )
    
    db.delete(dataset)
    db.commit()

    return schemas.SuccessResponse(
        message=f"Dataset '{dataset.name}' id: {dataset.id} deleted successfully"
    )
    
@app.get("/api/datasets", response_model=List[schemas.DatasetResponse], tags=["Datasets"])
def list_datasets(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    datasets = db.query(Dataset).offset(skip).limit(limit).all()
    return datasets

##### EXPANDED UPLOAD_DATASETS_TO_PROJECT COMMENTED CODE IN THIS FUNCTION #####
def add_datasets_to_project():
    # @app.post("/api/projects/{project_id}/datasets", response_model=schemas.ProjectResponse, tags=["Datasets"])
# async def upload_datasets_to_project(
#     project_id: int,
#     dataset_id: int | None = None,
#     files: list[UploadFile] | None = None,
#     db: Session = Depends(get_db)
# ):
#     """Upload dataset(s) and/or link existing dataset to a project"""
    
#     # Get the project
#     project = db.query(Project).filter(Project.id == project_id).first()
#     if not project:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail=f"Project with id {project_id} not found"
#         )
    
#     # Check if at least one option is provided
#     if not dataset_id and not files:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Must provide either dataset_id or files"
#         )
    
#     # Link existing dataset if provided
#     if dataset_id:
#         existing_dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
#         if not existing_dataset:
#             raise HTTPException(
#                 status=status.HTTP_404_NOT_FOUND,
#                 detail=f"Dataset with id {dataset_id} not found"
#             )
        
#         # Check if already linked to avoid duplicates
#         if existing_dataset not in project.datasets:
#             project.datasets.append(existing_dataset)
    
#     # Upload new datasets if files provided
#     if files:
#         for file in files:
#             dataset = create_dataset(db, file)
#             project.datasets.append(dataset)
    
#     db.commit()
#     db.refresh(project)
    
#     return project
    pass
