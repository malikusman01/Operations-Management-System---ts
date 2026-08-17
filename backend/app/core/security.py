from datetime import datetime, timedelta

import bcrypt
from fastapi import Depends, Header, HTTPException
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


# --- Auth / RBAC dependencies -------------------------------------------
MANAGER_ROLES = {"Manager IT", "Assistant Manager IT"}


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    from app.models.user import User

    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("user_id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def get_current_role_name(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> str | None:
    from app.models.role import Role

    if not user.role_id:
        return None
    return db.query(Role.name).filter(Role.id == user.role_id).scalar()


def require_manager(
    user=Depends(get_current_user),
    role_name: str | None = Depends(get_current_role_name),
):
    if role_name not in MANAGER_ROLES:
        raise HTTPException(status_code=403, detail="Manager access required")
    return user