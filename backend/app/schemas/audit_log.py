from pydantic import BaseModel
from datetime import datetime


class AuditLogBase(BaseModel):
    action: str
    module: str
    description: str
    user_id: int | None = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True