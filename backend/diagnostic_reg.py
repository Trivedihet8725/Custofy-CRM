import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from routers.auth import get_password_hash, create_access_token
from models import UserCreate
from datetime import timedelta
from bson import ObjectId

async def test_register_logic():
    print("Testing registration logic...")
    user = UserCreate(email="test_internal@example.com", password="Password123", name="Internal Test")
    
    # Simulate DB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.crm_database
    
    try:
        print("Checking existing user...")
        existing_user = await db.users.find_one({"email": user.email})
        print(f"Existing user: {existing_user}")
        
        print("Hashing password...")
        hashed_password = get_password_hash(user.password)
        print(f"Hashed: {hashed_password[:10]}...")
        
        print("Inserting user...")
        result = await db.users.insert_one({"email": user.email, "hashed_password": hashed_password, "name": user.name})
        print(f"Inserted ID: {result.inserted_id}")
        
        print("Creating token...")
        access_token = create_access_token(data={"sub": str(result.inserted_id)})
        print(f"Token: {access_token[:10]}...")
        
        print("SUCCESS")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_register_logic())
