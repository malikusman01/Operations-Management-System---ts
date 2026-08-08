from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func

from app.db.database import Base


class Ticket(Base):

    __tablename__ = "tickets"

    id = Column(
        Integer,
        primary_key=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text
    )

    category = Column(
        String,
        default="Hardware"
    )

    status = Column(
        String,
        default="Open"
    )

    priority = Column(
        String,
        default="Medium"
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.id")
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )