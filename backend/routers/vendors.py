from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from bson import ObjectId

from models import VendorCreate, VendorUpdate, VendorResponse
from database import get_database
from routers.auth import get_current_user, UserInDB

router = APIRouter(prefix="/api/vendors", tags=["vendors"])

@router.post("/", response_model=VendorResponse)
async def create_vendor(
    vendor: VendorCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    vendor_dict = vendor.dict()
    vendor_dict["ownerId"] = current_user.id
    vendor_dict["createdAt"] = datetime.utcnow()
    
    result = await db.vendors.insert_one(vendor_dict)
    return {**vendor_dict, "id": str(result.inserted_id)}

@router.get("/", response_model=List[VendorResponse])
async def get_vendors(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    cursor = db.vendors.find({"ownerId": current_user.id})
    vendors = await cursor.to_list(length=1000)
    for c in vendors:
        c["id"] = str(c["_id"])
    return vendors

@router.put("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: str,
    vendor: VendorUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(vendor_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Vendor ID")
        
    existing = await db.vendors.find_one({"_id": obj_id, "ownerId": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    update_data = {k: v for k, v in vendor.dict(exclude_unset=True).items() if v is not None}
    if update_data:
        await db.vendors.update_one({"_id": obj_id}, {"$set": update_data})
        
    updated = await db.vendors.find_one({"_id": obj_id})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{vendor_id}")
async def delete_vendor(
    vendor_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(vendor_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Vendor ID")
        
    result = await db.vendors.delete_one({"_id": obj_id, "ownerId": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    return {"status": "success"}
