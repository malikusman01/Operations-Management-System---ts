from pydantic import BaseModel
from datetime import datetime


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    body: str | None = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True