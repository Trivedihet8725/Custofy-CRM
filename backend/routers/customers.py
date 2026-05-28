from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from motor.core import AgnosticDatabase
from bson import ObjectId

from models import CustomerCreate, CustomerUpdate, CustomerResponse
from database import get_database
from routers.auth import get_current_user, UserInDB

router = APIRouter(prefix="/api/customers", tags=["customers"])

@router.post("/", response_model=CustomerResponse)
async def create_customer(
    customer: CustomerCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    customer_dict = customer.dict()
    customer_dict["ownerId"] = current_user.id
    customer_dict["createdAt"] = datetime.utcnow()
    
    result = await db.customers.insert_one(customer_dict)
    return {**customer_dict, "id": str(result.inserted_id)}

@router.get("/", response_model=List[CustomerResponse])
async def get_customers(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    cursor = db.customers.find({"ownerId": current_user.id})
    customers = await cursor.to_list(length=1000)
    for c in customers:
        c["id"] = str(c["_id"])
    return customers

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    customer: CustomerUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(customer_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Customer ID")
        
    existing = await db.customers.find_one({"_id": obj_id, "ownerId": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    update_data = {k: v for k, v in customer.dict(exclude_unset=True).items() if v is not None}
    if update_data:
        await db.customers.update_one({"_id": obj_id}, {"$set": update_data})
        
    updated = await db.customers.find_one({"_id": obj_id})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{customer_id}")
async def delete_customer(
    customer_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(customer_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Customer ID")
        
    result = await db.customers.delete_one({"_id": obj_id, "ownerId": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    return {"status": "success"}
