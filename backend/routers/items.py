from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from bson import ObjectId

from models import ItemCreate, ItemUpdate, ItemResponse
from database import get_database
from routers.auth import get_current_user, UserInDB

router = APIRouter(prefix="/api/items", tags=["items"])

@router.post("/", response_model=ItemResponse)
async def create_item(
    item: ItemCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    item_dict = item.dict()
    item_dict["ownerId"] = current_user.id
    item_dict["createdAt"] = datetime.utcnow()
    
    result = await db.items.insert_one(item_dict)
    return {**item_dict, "id": str(result.inserted_id)}

@router.get("/", response_model=List[ItemResponse])
async def get_items(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    cursor = db.items.find({"ownerId": current_user.id})
    items = await cursor.to_list(length=1000)
    for c in items:
        c["id"] = str(c["_id"])
    return items

@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: str,
    item: ItemUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Item ID")
        
    existing = await db.items.find_one({"_id": obj_id, "ownerId": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
        
    update_data = {k: v for k, v in item.dict(exclude_unset=True).items() if v is not None}
    if update_data:
        await db.items.update_one({"_id": obj_id}, {"$set": update_data})
        
    updated = await db.items.find_one({"_id": obj_id})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{item_id}")
async def delete_item(
    item_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Item ID")
        
    result = await db.items.delete_one({"_id": obj_id, "ownerId": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
        
    return {"status": "success"}
