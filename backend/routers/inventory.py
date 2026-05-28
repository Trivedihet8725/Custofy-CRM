from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from pydantic import BaseModel

from database import get_database
from routers.auth import get_current_user, UserInDB

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

class InventoryUpdateRequest(BaseModel):
    itemId: str
    itemName: str
    unit: str
    change: float
    reason: str
    refId: str

@router.get("/stock/{item_id}")
async def get_stock(
    item_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    inventory_id = f"{current_user.id}_{item_id}"
    doc = await db.inventory.find_one({"_id": inventory_id})
    return {"quantity": doc["quantity"] if doc else 0}

@router.post("/update")
async def update_stock(
    req: InventoryUpdateRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    inventory_id = f"{current_user.id}_{req.itemId}"
    
    await db.inventory.update_one(
        {"_id": inventory_id},
        {
            "$inc": {"quantity": req.change}, 
            "$set": {
                "ownerId": current_user.id, 
                "itemId": req.itemId, 
                "itemName": req.itemName, 
                "unit": req.unit, 
                "updatedAt": datetime.utcnow()
            }
        },
        upsert=True
    )
    
    log_entry = {
        "ownerId": current_user.id,
        "itemId": req.itemId,
        "itemName": req.itemName,
        "change": req.change,
        "reason": req.reason,
        "refId": req.refId,
        "createdAt": datetime.utcnow()
    }
    await db.inventory_logs.insert_one(log_entry)
    
    return {"status": "success"}

@router.get("/logs")
async def get_inventory_logs(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    cursor = db.inventory_logs.find({"ownerId": current_user.id}).sort("createdAt", -1)
    logs = await cursor.to_list(length=1000)
    for c in logs:
        c["id"] = str(c["_id"])
    return logs

@router.get("/")
async def get_inventory(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    cursor = db.inventory.find({"ownerId": current_user.id})
    inv = await cursor.to_list(length=1000)
    for c in inv:
        c["id"] = str(c["_id"])
    return inv
