from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from app.db.database import Base


class Department(Base):

    __tablename__ = "departments"

    id = Column(
        Integer,
        primary_key=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )