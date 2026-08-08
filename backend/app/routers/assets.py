from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetCreate
from app.schemas.asset import AssetResponse


router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)


@router.get(
    "",
    response_model=list[AssetResponse]
)
def get_assets(
    db: Session = Depends(get_db)
):
    return db.query(Asset).all()


@router.get(
    "/{asset_id}",
    response_model=AssetResponse
)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(
        Asset.id == asset_id
    ).first()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    return asset


@router.post(
    "",
    response_model=AssetResponse
)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db)
):
    asset = Asset(**payload.model_dump())

    db.add(asset)
    db.commit()
    db.refresh(asset)

    return asset


@router.put(
    "/{asset_id}",
    response_model=AssetResponse
)
def update_asset(
    asset_id: int,
    payload: AssetCreate,
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(
        Asset.id == asset_id
    ).first()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    for key, value in payload.model_dump().items():
        setattr(asset, key, value)

    db.commit()
    db.refresh(asset)

    return asset


@router.delete(
    "/{asset_id}"
)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(
        Asset.id == asset_id
    ).first()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    db.delete(asset)
    db.commit()

    return {
        "message": "Asset deleted successfully"
    }