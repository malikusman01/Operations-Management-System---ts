from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.audit_log import AuditLog

from app.schemas.audit_log import AuditLogCreate
from app.schemas.audit_log import AuditLogResponse


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


@router.get("", response_model=list[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).all()


@router.get("/{log_id}", response_model=AuditLogResponse)
def get_audit_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    log = db.query(AuditLog).filter(
        AuditLog.id == log_id
    ).first()

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found"
        )

    return log


@router.post("", response_model=AuditLogResponse)
def create_audit_log(
    audit_log: AuditLogCreate,
    db: Session = Depends(get_db)
):
    new_log = AuditLog(
        **audit_log.model_dump()
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log