from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.models.role import Role
from app.models.department import Department
from app.core.security import create_access_token, verify_password

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = create_access_token(
        {
            "sub": user.email,
            "user_id": user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


def _get_current_user(authorization: str | None, db: Session) -> User:
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


@router.get("/me")
def get_me(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    user = _get_current_user(authorization, db)

    role_name = (
        db.query(Role.name).filter(Role.id == user.role_id).scalar()
        if user.role_id
        else None
    )
    department_name = (
        db.query(Department.name)
        .filter(Department.id == user.department_id)
        .scalar()
        if user.department_id
        else None
    )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": role_name,
        "department": department_name,
        "is_active": user.is_active,
    }


@router.post("/logout")
def logout():
    # JWTs are stateless — the frontend just discards the token.
    # If you later add refresh tokens or a blacklist, revoke them here.
    return {"message": "Logged out"}