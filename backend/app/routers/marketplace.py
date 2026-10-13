from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.marketplace import CropListing, ProduceOrder
from app.schemas.marketplace import (
    CropListingCreate,
    CropListingResponse,
    ProduceOrderCreate,
    ProduceOrderResponse,
    MarketplaceStats,
)

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace & Supply Chain"])


@router.get("/listings", response_model=List[CropListingResponse])
def get_listings(
    category: Optional[str] = None,
    organic_only: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CropListing)
    if category and category != "All":
        query = query.filter(CropListing.category == category)
    if organic_only:
        query = query.filter(CropListing.is_organic == True)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (CropListing.crop_name.ilike(search_pattern)) |
            (CropListing.farmer_name.ilike(search_pattern)) |
            (CropListing.location.ilike(search_pattern))
        )
    return query.order_by(CropListing.created_at.desc()).all()


@router.post("/listings", response_model=CropListingResponse)
def create_listing(listing: CropListingCreate, db: Session = Depends(get_db)):
    db_listing = CropListing(**listing.model_dump())
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing


@router.get("/listings/{listing_id}", response_model=CropListingResponse)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Produce listing not found")
    return listing


@router.post("/orders", response_model=ProduceOrderResponse)
def place_order(order: ProduceOrderCreate, db: Session = Depends(get_db)):
    listing = db.query(CropListing).filter(CropListing.id == order.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found")
    
    if order.quantity_kg > listing.quantity_kg:
        raise HTTPException(
            status_code=400,
            detail=f"Requested quantity ({order.quantity_kg}kg) exceeds available stock ({listing.quantity_kg}kg)"
        )

    total_price = round(order.quantity_kg * listing.price_per_kg, 2)
    
    # Deduct stock
    listing.quantity_kg -= order.quantity_kg
    
    db_order = ProduceOrder(
        listing_id=order.listing_id,
        buyer_name=order.buyer_name,
        buyer_contact=order.buyer_contact,
        buyer_address=order.buyer_address,
        quantity_kg=order.quantity_kg,
        total_price=total_price,
        status="Confirmed"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/orders", response_model=List[ProduceOrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(ProduceOrder).order_by(ProduceOrder.created_at.desc()).all()


@router.get("/stats", response_model=MarketplaceStats)
def get_marketplace_stats(db: Session = Depends(get_db)):
    listings = db.query(CropListing).all()
    orders = db.query(ProduceOrder).all()
    
    total_stock = sum(l.quantity_kg for l in listings)
    categories = list(set(l.category for l in listings))

    return MarketplaceStats(
        total_listings=len(listings),
        total_stock_kg=round(total_stock, 1),
        total_orders=len(orders),
        categories=categories if categories else ["Grain", "Vegetable", "Fruit", "Pulse"]
    )
