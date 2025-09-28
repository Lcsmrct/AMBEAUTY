from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import uuid
from pathlib import Path

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/am_beauty")
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

# Create uploads directory
Path(UPLOAD_DIR).mkdir(exist_ok=True)

# Initialize FastAPI
app = FastAPI(title="AM.BEAUTYY2 API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection (fallback to in-memory storage if MongoDB is not available)
try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=2000)
    client.server_info()  # Test connection
    db = client.am_beauty
    print("Connected to MongoDB")
except Exception as e:
    print(f"MongoDB not available, using in-memory storage: {e}")
    # Simple in-memory storage as fallback
    class InMemoryDB:
        def __init__(self):
            self.collections = {
                'users': [],
                'bookings': [],
                'media': []
            }
        
        def __getattr__(self, name):
            if name not in self.collections:
                self.collections[name] = []
            return InMemoryCollection(self.collections[name])
    
    class InMemoryCollection:
        def __init__(self, data):
            self.data = data
        
        def find_one(self, query=None):
            if not query:
                return self.data[0] if self.data else None
            for item in self.data:
                if all(item.get(k) == v for k, v in query.items()):
                    return item
            return None
        
        def find(self, query=None):
            if not query:
                return InMemoryCursor(self.data[:])
            results = []
            for item in self.data:
                if all(item.get(k) == v for k, v in query.items()):
                    results.append(item)
            return InMemoryCursor(results)
        
        def insert_one(self, doc):
            self.data.append(doc)
            return type('InsertResult', (), {'inserted_id': doc.get('id')})()
        
        def update_one(self, query, update):
            for item in self.data:
                if all(item.get(k) == v for k, v in query.items()):
                    if '$set' in update:
                        item.update(update['$set'])
                    return type('UpdateResult', (), {'matched_count': 1})()
            return type('UpdateResult', (), {'matched_count': 0})()
    
    class InMemoryCursor:
        def __init__(self, data):
            self.data = data
        
        def sort(self, key, direction=-1):
            reverse = direction == -1
            if isinstance(key, str):
                self.data.sort(key=lambda x: x.get(key, ''), reverse=reverse)
            return self
        
        def __iter__(self):
            return iter(self.data)
    
    db = InMemoryDB()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
security = HTTPBearer()

# Pydantic models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password: str
    role: str = "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    service: str
    date: str
    time: str
    notes: str = ""
    status: str = "pending"  # pending, confirmed, completed, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookingCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    service: str
    date: str
    time: str
    notes: str = ""

class BookingUpdate(BaseModel):
    status: str

class MediaItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_name: str
    category: str = "general"
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

# Helper functions
def verify_password(plain_password, hashed_password):
    # Ensure password is string and truncate to 72 characters for bcrypt compatibility
    password_str = str(plain_password)[:72] if plain_password else ""
    try:
        return pwd_context.verify(password_str, hashed_password)
    except Exception as e:
        print(f"Error verifying password with bcrypt: {e}")
        # Fallback to simple hash verification if bcrypt fails
        import hashlib
        return hashlib.sha256(password_str.encode()).hexdigest() == hashed_password

def hash_password(password):
    # Ensure password is string and truncate to 72 characters for bcrypt compatibility
    password_str = str(password)[:72] if password else ""
    try:
        return pwd_context.hash(password_str)
    except Exception as e:
        print(f"Error hashing password: {e}")
        # Fallback to simple hash if bcrypt fails
        import hashlib
        return hashlib.sha256(password_str.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Initialize admin user
@app.on_event("startup")
async def startup_event():
    print("Backend API started successfully")
    print("You can create an admin account through registration with role assignment")

# Authentication routes
@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    user = User(
        username=user_data.username,
        email=user_data.email,
        password=hash_password(user_data.password)
    )
    
    db.users.insert_one(user.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    # Find user
    user = db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"]
    }

# Booking routes
@app.post("/api/bookings")
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    booking = Booking(
        user_id=current_user["id"],
        customer_name=booking_data.customer_name,
        customer_email=booking_data.customer_email,
        customer_phone=booking_data.customer_phone,
        service=booking_data.service,
        date=booking_data.date,
        time=booking_data.time,
        notes=booking_data.notes
    )
    
    db.bookings.insert_one(booking.dict())
    return {"message": "Booking created successfully", "booking_id": booking.id}

@app.get("/api/bookings/me")
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    bookings = list(db.bookings.find({"user_id": current_user["id"]}).sort("created_at", -1))
    # Remove MongoDB _id field
    for booking in bookings:
        booking.pop("_id", None)
    return bookings

@app.get("/api/bookings")
async def get_all_bookings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    bookings = list(db.bookings.find().sort("created_at", -1))
    # Remove MongoDB _id field
    for booking in bookings:
        booking.pop("_id", None)
    return bookings

@app.put("/api/bookings/{booking_id}")
async def update_booking(booking_id: str, booking_update: BookingUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": booking_update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking updated successfully"}

# Media routes
@app.post("/api/media/upload")
async def upload_media(file: UploadFile = File(...), category: str = "general", current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{str(uuid.uuid4())}.{file_extension}"
    file_path = Path(UPLOAD_DIR) / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Save to database
    media_item = MediaItem(
        filename=filename,
        original_name=file.filename,
        category=category
    )
    
    db.media.insert_one(media_item.dict())
    
    return {"message": "File uploaded successfully", "filename": filename}

@app.get("/api/media")
async def get_media():
    media_items = list(db.media.find().sort("uploaded_at", -1))
    # Remove MongoDB _id field
    for item in media_items:
        item.pop("_id", None)
    return media_items

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "AM.BEAUTYY2 API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
