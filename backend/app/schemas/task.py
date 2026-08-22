from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending"
    assigned_by: Optional[int] = None
    assigned_to: Optional[int] = None
    deadline: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    pass


class TaskResponse(TaskBase):
    id: int
    time_spent_seconds: int = 0
    timer_running_since: Optional[datetime] = None

    class Config:
        from_attributes = True