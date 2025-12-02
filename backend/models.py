from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from database import Base

project_tags = Table(
    'project_tags',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id', ondelete='CASCADE')),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'))
)

project_datasets = Table(
    'project_datasets',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id', ondelete='CASCADE')),
    Column('dataset_id', Integer, ForeignKey('datasets.id', ondelete='CASCADE'))
)

class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key = True, index=True)
    name = Column(String(50), unique=True, 
    nullable=False, index=True)

    # Relationship back to projects
    projects = relationship("Project", secondary=project_tags, back_populates="tags")
    
    def __repr__(self):
        return f"<Tag(name='{self.name}')>"
    
class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)

    row_count = Column(Integer)
    columns = Column(JSONB)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    projects = relationship("Project", secondary = project_datasets, back_populates="datasets")
    rows = relationship("DatasetRow", back_populates="dataset", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Dataset(id={self.id}, name='{self.name}', rows={self.row_count})>"
    
class DatasetRow(Base):
    __tablename__ = 'dataset_rows'

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey('datasets.id', ondelete='CASCADE'), index=True)
    row_number = Column(Integer)
    data = Column(JSONB, index=True)

    dataset = relationship("Dataset", back_populates="rows")

    def __repr__(self):
        return f"<DatasetRow(id={self.id}, dataset_id={self.dataset_id})>"



class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tags = relationship("Tag", secondary=project_tags, back_populates="projects")
    datasets = relationship("Dataset", secondary=project_datasets, back_populates="projects")

    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}')>"