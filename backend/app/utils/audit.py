from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_log(
    db: Session,
    action: str,
    module: str,
    description: str,
    user_id: int | None = None
):
    log = AuditLog(
        action=action,
        module=module,
        description=description,
        user_id=user_id
    )

    db.add(log)
    db.commit()