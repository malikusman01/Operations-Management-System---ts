from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from app.db.database import Base


class Task(Base):

    __tablename__ = "tasks"

    id = Column(
        Integer,
        primary_key=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(Text)

    priority = Column(String)

    status = Column(String)

    assigned_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.id")
    )

    deadline = Column(DateTime)

    time_spent_seconds = Column(
        Integer,
        default=0
    )

    timer_running_since = Column(
        DateTime,
        nullable=True
    )