from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

async def check_user():
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.crm_database
    user = await db.users.find_one({"email": "longpass_test@example.com"})
    print(f"User found: {user}")

asyncio.run(check_user())
