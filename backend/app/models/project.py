from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func

from app.db.database import Base


class Project(Base):

    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True
    )

    name = Column(
        String,
        nullable=False
    )

    description = Column(
        Text
    )

    status = Column(
        String,
        default="Planning"
    )

    project_manager = Column(
        Integer,
        ForeignKey("users.id")
    )

    start_date = Column(
        DateTime
    )

    end_date = Column(
        DateTime
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )