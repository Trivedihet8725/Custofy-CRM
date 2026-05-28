from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from bson import ObjectId

from models import PaymentReceivedCreate, PaymentReceivedUpdate, PaymentReceivedResponse
from database import get_database
from routers.auth import get_current_user, UserInDB

router = APIRouter(prefix="/api/payments_received", tags=["payments_received"])

@router.post("/", response_model=PaymentReceivedResponse)
async def create_payment_received(
    payment: PaymentReceivedCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    payment_dict = payment.dict()
    payment_dict["ownerId"] = current_user.id
    payment_dict["createdAt"] = datetime.utcnow()
    
    result = await db.payments_received.insert_one(payment_dict)
    return {**payment_dict, "id": str(result.inserted_id)}

@router.get("/", response_model=List[PaymentReceivedResponse])
async def get_payments_received(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    cursor = db.payments_received.find({"ownerId": current_user.id})
    payments = await cursor.to_list(length=1000)
    for c in payments:
        c["id"] = str(c["_id"])
    return payments

@router.put("/{payment_id}", response_model=PaymentReceivedResponse)
async def update_payment_received(
    payment_id: str,
    payment: PaymentReceivedUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(payment_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Payment ID")
        
    existing = await db.payments_received.find_one({"_id": obj_id, "ownerId": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    update_data = {k: v for k, v in payment.dict(exclude_unset=True).items() if v is not None}
    if update_data:
        await db.payments_received.update_one({"_id": obj_id}, {"$set": update_data})
        
    updated = await db.payments_received.find_one({"_id": obj_id})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{payment_id}")
async def delete_payment_received(
    payment_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(payment_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Payment ID")
        
    result = await db.payments_received.delete_one({"_id": obj_id, "ownerId": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    return {"status": "success"}
