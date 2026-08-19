from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    body: str | None = None
):
    if not user_id:
        return None

    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body
    )

    db.add(notification)
    db.commit()

    return notification