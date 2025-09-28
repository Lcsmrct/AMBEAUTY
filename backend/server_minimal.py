from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import uuid
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")

# Initialize FastAPI
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory storage for testing
users_db = []

# Pydantic models
class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# Helper functions
def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")

# Routes
@app.get("/")
async def root():
    return {"message": "API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "AM.BEAUTYY2 API is running"}

@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    try:
        # Validate input
        if not user_data.email or not user_data.password or not user_data.username:
            raise HTTPException(status_code=400, detail="Tous les champs sont requis")
        
        if len(user_data.password) < 6:
            raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères")
        
        # Check if user exists
        for user in users_db:
            if user["email"] == user_data.email:
                raise HTTPException(status_code=400, detail="Un compte avec cet email existe déjà")
        
        # Create new user
        user_id = str(uuid.uuid4())
        new_user = {
            "id": user_id,
            "username": user_data.username,
            "email": user_data.email,
            "password": hash_password(user_data.password),
            "role": "user",
            "created_at": datetime.utcnow()
        }
        
        users_db.append(new_user)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "username": user_data.username,
                "email": user_data.email,
                "role": "user"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    try:
        # Validate input
        if not user_data.email or not user_data.password:
            raise HTTPException(status_code=400, detail="Email et mot de passe sont requis")
        
        # Find user
        user = None
        for u in users_db:
            if u["email"] == user_data.email:
                user = u
                break
        
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
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)