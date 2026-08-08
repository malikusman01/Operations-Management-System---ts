from pydantic import BaseModel
from datetime import date


class AssetCreate(BaseModel):
    asset_tag: str
    name: str
    category: str
    brand: str | None = None
    model: str | None = None
    serial_number: str | None = None
    assigned_to: int | None = None
    purchase_date: date | None = None
    warranty_expiry: date | None = None
    status: str = "Available"


class AssetResponse(BaseModel):
    id: int
    asset_tag: str
    name: str
    category: str
    brand: str | None = None
    model: str | None = None
    serial_number: str | None = None
    assigned_to: int | None = None
    purchase_date: date | None = None
    warranty_expiry: date | None = None
    status: str

    class Config:
        from_attributes = True