from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from bson import ObjectId

from models import BillCreate, BillUpdate, BillResponse
from database import get_database
from routers.auth import get_current_user, UserInDB

router = APIRouter(prefix="/api/bills", tags=["bills"])

@router.post("/", response_model=BillResponse)
async def create_bill(
    bill: BillCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    bill_dict = bill.dict()
    bill_dict["ownerId"] = current_user.id
    bill_dict["createdAt"] = datetime.utcnow()
    result = await db.bills.insert_one(bill_dict)
    return {**bill_dict, "id": str(result.inserted_id)}

@router.get("/", response_model=List[BillResponse])
async def get_bills(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    cursor = db.bills.find({"ownerId": current_user.id})
    bills = await cursor.to_list(length=1000)
    for c in bills:
        c["id"] = str(c["_id"])
    return bills

@router.put("/{bill_id}", response_model=BillResponse)
async def update_bill(
    bill_id: str,
    bill: BillUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(bill_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Bill ID")
        
    existing = await db.bills.find_one({"_id": obj_id, "ownerId": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Bill not found")
        
    update_data = {k: v for k, v in bill.dict(exclude_unset=True).items() if v is not None}
    if update_data:
        await db.bills.update_one({"_id": obj_id}, {"$set": update_data})
        
    updated = await db.bills.find_one({"_id": obj_id})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{bill_id}")
async def delete_bill(
    bill_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(bill_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Bill ID")
        
    result = await db.bills.delete_one({"_id": obj_id, "ownerId": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bill not found")
        
    return {"status": "success"}
