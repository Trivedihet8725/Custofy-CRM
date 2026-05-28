from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from bson import ObjectId

from database import get_database
from routers.auth import get_current_user, UserInDB
from models import CompanyProfileCreate, CompanyProfileUpdate, CompanyProfileResponse, UserResponse

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("/company", response_model=CompanyProfileResponse)
async def get_company(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    doc = await db.companies.find_one({"ownerId": current_user.id})
    if doc:
        doc["id"] = str(doc["_id"])
        return doc
    raise HTTPException(status_code=404, detail="Company profile not found")

@router.post("/company", response_model=CompanyProfileResponse)
async def save_company(
    company: CompanyProfileCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    
    update_data = company.dict()
    update_data["ownerId"] = current_user.id
    update_data["updatedAt"] = datetime.utcnow()
    
    await db.companies.update_one(
        {"ownerId": current_user.id},
        {"$set": update_data, "$setOnInsert": {"createdAt": datetime.utcnow()}},
        upsert=True
    )
    
    doc = await db.companies.find_one({"ownerId": current_user.id})
    doc["id"] = str(doc["_id"])
    return doc

@router.get("/admin")
async def get_admin_profile(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    doc = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        doc.pop("hashed_password", None)
        return doc
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/admin")
async def update_admin_profile(
    data: dict,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    
    valid_keys = {"name", "phone", "email"}
    update_data = {k: v for k, v in data.items() if k in valid_keys}
    update_data["updatedAt"] = datetime.utcnow()
    
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    return {"status": "success"}
