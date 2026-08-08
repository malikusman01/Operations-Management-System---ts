from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from datetime import datetime

from app.db.database import Base


class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    action = Column(
        String,
        nullable=False
    )

    module = Column(
        String,
        nullable=False
    )

    description = Column(
        String,
        nullable=False
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )