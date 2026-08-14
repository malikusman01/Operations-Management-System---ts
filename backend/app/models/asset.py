from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Date
from sqlalchemy import ForeignKey

from app.db.database import Base


class Asset(Base):

    __tablename__ = "assets"

    id = Column(
        Integer,
        primary_key=True
    )

    asset_tag = Column(
        String,
        unique=True,
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    category = Column(
        String,
        nullable=False
    )

    brand = Column(String)

    model = Column(String)

    serial_number = Column(
        String,
        unique=True
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    assignee_name = Column(String, nullable=True)

    employee_code = Column(String, nullable=True)

    location = Column(String, nullable=True)

    purchase_date = Column(Date)

    warranty_expiry = Column(Date)

    status = Column(
        String,
        default="Available"
    )