from datetime import datetime, timedelta
from typing import Optional
import traceback

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt
from jose import JWTError, jwt
from motor.core import AgnosticDatabase
from bson import ObjectId

from models import UserCreate, UserInDB, UserResponse, GoogleAuthRequest
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from database import get_database

SECRET_KEY = "supersecretkey123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/api/auth", tags=["auth"])

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    # We resolve get_database inside manually to avoid multiple Depends injects in routers if desired, 
    # but doing it via parameter is standard. To avoid import cyclic issues, we just do it here:
    db = get_database()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if user_doc is None:
        raise credentials_exception
        
    return UserInDB(
        id=str(user_doc["_id"]),
        email=user_doc["email"],
        hashed_password=user_doc["hashed_password"],
        name=user_doc.get("name")
    )

@router.post("/register")
async def register(user: UserCreate):
    db: AgnosticDatabase = get_database()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    result = await db.users.insert_one({"email": user.email, "hashed_password": hashed_password, "name": user.name})
    
    # Return access token on register to match firebase create flow
    access_token = create_access_token(data={"sub": str(result.inserted_id)}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"uid": str(result.inserted_id), "email": user.email, "displayName": user.name}
    }

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db: AgnosticDatabase = get_database()
    user_doc = await db.users.find_one({"email": form_data.username})
    if not user_doc or not verify_password(form_data.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": str(user_doc["_id"])}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"uid": str(user_doc["_id"]), "email": user_doc["email"], "displayName": user_doc.get("name")}
    }

GOOGLE_CLIENT_ID = "244499776668-gr6g4hvog0bavaqhvpmmjop21pic4f28.apps.googleusercontent.com"

@router.post("/google")
async def google_auth(req: GoogleAuthRequest):
    try:
        # Verify token
        idinfo = id_token.verify_oauth2_token(req.credential, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        
        db: AgnosticDatabase = get_database()
        user_doc = await db.users.find_one({"email": email})
        
        if not user_doc:
            # Create user if doesn't exist
            hashed_password = get_password_hash("GOOGLE_AUTH_NO_PASSWORD_" + email)
            result = await db.users.insert_one({"email": email, "hashed_password": hashed_password, "name": name})
            user_id = str(result.inserted_id)
        else:
            user_id = str(user_doc["_id"])
            
        access_token = create_access_token(data={"sub": user_id}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"uid": user_id, "email": email, "displayName": name}
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
