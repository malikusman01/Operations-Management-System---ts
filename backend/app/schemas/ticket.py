from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "Hardware"
    status: Optional[str] = "Open"
    priority: Optional[str] = "Medium"
    created_by: Optional[int] = None
    assigned_to: Optional[int] = None


class TicketCreate(TicketBase):
    pass


class TicketUpdate(TicketBase):
    pass


class TicketResponse(TicketBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True