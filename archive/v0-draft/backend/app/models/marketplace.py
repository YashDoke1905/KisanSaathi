from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_name = Column(String, nullable=False)
    crop_name = Column(String, nullable=False)
    variety = Column(String, nullable=True)
    category = Column(String, nullable=False)  # "Grain", "Vegetable", "Fruit", "Pulse", "Cash Crop"
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    harvest_date = Column(String, nullable=False)
    is_organic = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    location = Column(String, default="GreenValley Farms, Zone 4")
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)


class ProduceOrder(Base):
    __tablename__ = "produce_orders"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, nullable=False)
    buyer_name = Column(String, nullable=False)
    buyer_contact = Column(String, nullable=False)
    buyer_address = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String, default="Pending")  # "Pending", "Confirmed", "Shipped", "Delivered"
    created_at = Column(DateTime, default=utcnow)
