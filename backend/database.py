from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator
import os
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)

session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    db = session()
    try:
        yield db
    finally:
        db.close()