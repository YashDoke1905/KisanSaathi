from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class CropListingBase(BaseModel):
    farmer_name: str
    crop_name: str
    variety: Optional[str] = None
    category: str = Field(..., description="Grain, Vegetable, Fruit, Pulse, Cash Crop")
    quantity_kg: float = Field(..., gt=0)
    price_per_kg: float = Field(..., gt=0)
    harvest_date: str
    is_organic: bool = False
    description: Optional[str] = None
    location: str = "GreenValley Farms, Zone 4"
    image_url: Optional[str] = None


class CropListingCreate(CropListingBase):
    pass


class CropListingResponse(CropListingBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProduceOrderCreate(BaseModel):
    listing_id: int
    buyer_name: str
    buyer_contact: str
    buyer_address: str
    quantity_kg: float = Field(..., gt=0)


class ProduceOrderResponse(BaseModel):
    id: int
    listing_id: int
    buyer_name: str
    buyer_contact: str
    buyer_address: str
    quantity_kg: float
    total_price: float
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class MarketplaceStats(BaseModel):
    total_listings: int
    total_stock_kg: float
    total_orders: int
    categories: List[str]
