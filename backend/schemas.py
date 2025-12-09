from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime


# TAG SCHEMAS
class TagBase(BaseModel):
    """Base schema for tags"""
    name: str = Field(..., min_length=1, max_length=50)


class TagCreate(TagBase):
    """Schema for creating a tag - same as base"""
    pass


class TagResponse(TagBase):
    """Schema for tag responses - includes ID"""
    id: int
    
    model_config = ConfigDict(from_attributes=True)



class ProjectBase(BaseModel):
    """Base schema with common project fields"""
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=255,
        description="Unique project name",
        examples=["Human Genome Variation Study"]
    )
    description: Optional[str] = Field(
        None,
        description="Detailed project description",
        examples=["A comprehensive study of genetic variations..."]
    )

class ProjectCreate(ProjectBase):
    """
    Schema for creating a new project.
    This is what your frontend will send.
    """
    tags: Optional[List[str]] = Field(
        default_factory=list,
        description="List of tag names",
        examples=[["Genomics", "Cancer", "GWAS"]]
    )

class ProjectForm(BaseModel):
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=255,
        description="Unique project name",
        examples=["Human Genome Variation Study"]
    )
    description: Optional[str] = Field(
        None,
        description="Detailed project description",
        examples=["A comprehensive study of genetic variations..."])
    
    tags: Optional[List[str]] = Field(
        default_factory=list,
        description="List of tag names",
        examples=[["Genomics", "Cancer", "GWAS"]]
    )
    

class ProjectUpdate(BaseModel):
    """Schema for updating a project - all fields optional"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    datasets: Optional[List[int]] = None

############## To Simplify API Responses for Testing #################
class ProjectBasic(BaseModel):
    id: int
    name: str
#######################################################################

# DATASET SCHEMAS
class DatasetResponse(BaseModel):
    id: int
    name: str
    filename: str
    row_count: int
    columns: List[str]
    uploaded_at: datetime
    projects: List[ProjectBasic]

    model_config = ConfigDict(from_attributes=True)

# class DatasetListResponse(BaseModel):
#     """Schema for listing multiple projects"""
#     datasets: List[DatasetResponse]
#     total: int
#     page: int = 1
#     per_page: int = 20

############## To Simplify API Responses for Testing #################
class DatasetBasic(BaseModel):
    id: int
    name: str
    filename: str
    projects: List[ProjectBasic]
#######################################################################

class DatasetUploadResponse(BaseModel):
    id: int
    name: str
    filename: str
    row_count: int
    columns: List[str]
    projects: List[ProjectBase]

class DatasetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    projects: Optional[List[int]] = []

class ProjectResponse(ProjectBase):
    """
    Schema for project responses.
    This is what your API returns to the frontend.
    """
    id: int
    tags: List[TagResponse]
    datasets: List[DatasetBasic]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# class ProjectListResponse(BaseModel):
#     """Schema for listing multiple projects"""
#     projects: List[ProjectResponse]
#     total: int
#     page: int = 1
#     per_page: int = 20

# ERROR SCHEMAS
class ErrorResponse(BaseModel):
    """Standard error response schema"""
    detail: str
    status_code: int
    
    
class SuccessResponse(BaseModel):
    """Standard success response schema"""
    message: str
    data: Optional[dict] = None

class DatasetDataResponse(BaseModel):
    """Schema for returning dataset row data"""
    dataset_id: int
    dataset_name: str
    total_rows: int
    columns: List[str]
    column_types: Dict[str, str]  # Column name -> data type
    rows: List[Dict[str, Any]]  # List of row data
    
    model_config = ConfigDict(from_attributes=True)


class DatasetDataQuery(BaseModel):
    """Schema for querying dataset data with pagination"""
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=100, le=1000)  # Max 1000 rows at a time