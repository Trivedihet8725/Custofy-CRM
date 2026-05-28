from fastapi import APIRouter, Depends
from motor.core import AgnosticDatabase
from database import get_database
from routers.auth import get_current_user
from models import UserInDB
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter(prefix="/api/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    name: str
    email: str
    phone: str

@router.get("/admin")
async def get_admin_profile(current_user: UserInDB = Depends(get_current_user)):
    db: AgnosticDatabase = get_database()
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if user:
        return {
            "name": user.get("name", ""),
            "email": str(user.get("email", current_user.email)),
            "phone": user.get("phone", "")
        }
    return {}

@router.post("/admin")
async def update_admin_profile(profile_data: ProfileUpdate, current_user: UserInDB = Depends(get_current_user)):
    db: AgnosticDatabase = get_database()
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"name": profile_data.name, "email": profile_data.email, "phone": profile_data.phone}}
    )
    return {"message": "Profile updated successfully"}
