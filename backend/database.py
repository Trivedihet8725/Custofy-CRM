import os
from motor.motor_asyncio import AsyncIOMotorClient

# For local development we'll default to localhost if no ENV var exists
MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://custofycrm:HeT%40%23%2A%212110@cluster0.t38sjc4.mongodb.net/?appName=Cluster0")

# Initialize Motor Client
client = AsyncIOMotorClient(MONGO_URL)
db = client.crm_database

def get_database():
    return db
