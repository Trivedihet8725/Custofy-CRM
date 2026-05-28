import os
from motor.motor_asyncio import AsyncIOMotorClient

# For local development we'll default to localhost if no ENV var exists
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# Initialize Motor Client
client = AsyncIOMotorClient(MONGO_URL)
db = client.crm_database

def get_database():
    return db
