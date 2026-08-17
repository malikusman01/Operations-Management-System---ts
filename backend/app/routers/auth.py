from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.role import Role
from app.models.department import Department
from app.core.security import create_access_token, verify_password, get_current_user

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


@router.get("/me")
def get_me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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
        "role_id": user.role_id,
        "department": department_name,
        "department_id": user.department_id,
        "is_active": user.is_active,
    }


@router.post("/logout")
def logout():
    return {"message": "Logged out"}