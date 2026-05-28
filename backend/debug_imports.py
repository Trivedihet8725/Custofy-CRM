import traceback
try:
    import motor
    from motor.motor_asyncio import AsyncIOMotorClient
    print("Success")
except Exception as e:
    traceback.print_exc()
