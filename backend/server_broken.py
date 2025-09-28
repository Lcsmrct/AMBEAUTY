from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, ValidationError
from typing import Optional, List
import os
import uuid
from pathlib import Path
import traceback

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/am_beauty")
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

# Create uploads directory
Path(UPLOAD_DIR).mkdir(exist_ok=True)

# Initialize FastAPI
app = FastAPI(title="AM.BEAUTYY2 API", version="1.0.0")

# Add CORS middleware
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
                'media': [],
                'time_slots': []
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
        
        def delete_one(self, query):
            for i, item in enumerate(self.data):
                if all(item.get(k) == v for k, v in query.items()):
                    del self.data[i]
                    return type('DeleteResult', (), {'deleted_count': 1})()
            return type('DeleteResult', (), {'deleted_count': 0})()
    
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

# Helper functions
def verify_password(plain_password, hashed_password):
    password_str = str(plain_password)[:72] if plain_password else ""
    try:
        return pwd_context.verify(password_str, hashed_password)
    except Exception as e:
        print(f"Error verifying password with bcrypt: {e}")
        import hashlib
        return hashlib.sha256(password_str.encode()).hexdigest() == hashed_password

def hash_password(password):
    password_str = str(password)[:72] if password else ""
    try:
        return pwd_context.hash(password_str)
    except Exception as e:
        print(f"Error hashing password: {e}")
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
def init_admin_user():
    print("Backend API started successfully")
    try:
        # Create admin user if not exists
        admin_user = db.users.find_one({"email": "admin@ambeauty.com"})
        if not admin_user:
            admin = User(
                username="admin",
                email="admin@ambeauty.com", 
                password=hash_password("admin123456"),
                role="admin"
            )
            db.users.insert_one(admin.dict())
            print("Admin user created: admin@ambeauty.com / admin123456")
    except Exception as e:
        print(f"Error creating admin user: {e}")

# Call init function after db setup
init_admin_user()

# Authentication routes
@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    try:
        # Validate input data
        if not user_data.email or not user_data.password or not user_data.username:
            raise HTTPException(status_code=400, detail="Tous les champs sont requis")
        
        if len(user_data.password) < 6:
            raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères")
        
        # Check if user exists
        existing_user = db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Un compte avec cet email existe déjà")
        
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
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    try:
        # Validate input data
        if not user_data.email or not user_data.password:
            raise HTTPException(status_code=400, detail="Email et mot de passe sont requis")
        
        # Find user
        user = db.users.find_one({"email": user_data.email})
        if not user or not verify_password(user_data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Identifiants incorrects. Vérifiez votre email et mot de passe.")
        
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
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"]
    }

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "AM.BEAUTYY2 API is running"}

# Test route
@app.get("/")
async def root():
    return {"message": "AM.BEAUTYY2 API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)