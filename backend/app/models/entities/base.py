"""SQLAlchemy ORM Base 定义。"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """所有 ORM 实体的基类。"""
