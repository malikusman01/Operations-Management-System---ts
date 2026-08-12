from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.role import Role
from app.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleResponse
)

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


@router.get("", response_model=list[RoleResponse])
def get_roles(
    db: Session = Depends(get_db)
):
    return db.query(Role).all()


@router.get("/{role_id}", response_model=RoleResponse)
def get_role(
    role_id: int,
    db: Session = Depends(get_db)
):
    role = db.query(Role).filter(
        Role.id == role_id
    ).first()

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    return role


@router.post("", response_model=RoleResponse)
def create_role(
    data: RoleCreate,
    db: Session = Depends(get_db)
):
    role = Role(
        name=data.name
    )

    db.add(role)
    db.commit()
    db.refresh(role)

    return role


@router.put("/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: int,
    data: RoleUpdate,
    db: Session = Depends(get_db)
):
    role = db.query(Role).filter(
        Role.id == role_id
    ).first()

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    role.name = data.name

    db.commit()
    db.refresh(role)

    return role


@router.delete("/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db)
):
    role = db.query(Role).filter(
        Role.id == role_id
    ).first()

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    db.delete(role)
    db.commit()

    return {
        "message": "Role deleted successfully"
    }