from sqlalchemy import Column, Integer, String, DateTime, Float, PickleType, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    searches = relationship("SearchHistory", back_populates="user")

class SearchHistory(Base):
    __tablename__ = "search_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query_text = Column(String, nullable=True)
    query_image_path = Column(String, nullable=True)
    search_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="searches")

class ImageMetadata(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    filepath = Column(String, unique=True)
    description = Column(String)
    # Storing embedding as a Pickle for simplicity in SQLite. 
    # For Production/PG, use pgvector.
    embedding = Column(PickleType) 
