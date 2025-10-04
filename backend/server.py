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
    # Configuration spécifique pour MongoDB Atlas
    client = MongoClient(
        MONGO_URL, 
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        socketTimeoutMS=10000,
        tls=True,
        tlsAllowInvalidCertificates=True,
        retryWrites=True
    )
    client.server_info()  # Test connection
    db = client.am_beauty
    print("✅ Connected to MongoDB Atlas successfully!")
except Exception as e:
    print(f"MongoDB not available, using in-memory storage: {e}")
    # Simple in-memory storage as fallback
    class InMemoryDB:
        def __init__(self):
            self.collections = {
                'users': [],
                'bookings': [],
                'media': [],
                'time_slots': [],
                'reviews': []
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
    instagram: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    instagram: str = ""

class UserUpdate(BaseModel):
    role: str

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    instagram: Optional[str] = None

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
    time_slot_id: str  # Reference to the time slot
    notes: str = ""

class BookingUpdate(BaseModel):
    status: str

class MediaItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_name: str
    category: str = "general"
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class TimeSlot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    service: str = "Tous services"  # Service universel par défaut
    is_available: bool = True
    is_booked: bool = False
    booking_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TimeSlotCreate(BaseModel):
    date: str
    time: str
    service: str = "Tous services"

class TimeSlotUpdate(BaseModel):
    is_available: Optional[bool] = None
    is_booked: Optional[bool] = None
    booking_id: Optional[str] = None

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    booking_id: str  # Référence à la réservation confirmée
    customer_name: str  # Prénom du client
    rating: int  # Note de 1 à 5
    comment: str
    service: str  # Service concerné par l'avis
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int
    comment: str

class ReviewUpdate(BaseModel):
    status: str  # approved, rejected

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

# Initialize admin user when the app starts
def init_admin_user():
    print("Backend API started successfully")
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

# Call init function after db setup
init_admin_user()

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
        password=hash_password(user_data.password),
        instagram=user_data.instagram
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
            "role": user.role,
            "instagram": user.instagram
        }
    }

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
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
            "role": user["role"],
            "instagram": user["instagram"]
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "instagram": current_user["instagram"]
    }

@app.put("/api/auth/profile")
async def update_profile(profile_data: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    try:
        # Create update data
        update_fields = {}
        if profile_data.username is not None:
            update_fields["username"] = profile_data.username
        if profile_data.instagram is not None:
            update_fields["instagram"] = profile_data.instagram
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour")
        
        # Update user in database
        db.users.update_one(
            {"id": current_user["id"]}, 
            {"$set": update_fields}
        )
        
        # Get updated user
        updated_user = db.users.find_one({"id": current_user["id"]})
        
        return {
            "id": updated_user["id"],
            "username": updated_user["username"],
            "email": updated_user["email"],
            "role": updated_user["role"],
            "instagram": updated_user["instagram"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

# User management routes (admin only)
@app.put("/api/users/{user_id}")
async def update_user_role(user_id: str, user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = db.users.update_one(
        {"id": user_id},
        {"$set": {"role": user_update.role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User role updated successfully"}

# Time slot routes
@app.post("/api/time-slots")
async def create_time_slot(slot_data: TimeSlotCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if time slot already exists
    existing_slot = db.time_slots.find_one({
        "date": slot_data.date, 
        "time": slot_data.time,
        "service": slot_data.service
    })
    if existing_slot:
        raise HTTPException(status_code=400, detail="Time slot already exists for this service")
    
    time_slot = TimeSlot(
        date=slot_data.date,
        time=slot_data.time,
        service=slot_data.service
    )
    
    db.time_slots.insert_one(time_slot.dict())
    return {"message": "Time slot created successfully", "slot_id": time_slot.id}

@app.get("/api/time-slots")
async def get_time_slots(service: Optional[str] = None, date: Optional[str] = None):
    query = {}
    if service:
        query["service"] = service
    if date:
        query["date"] = date
    
    time_slots = list(db.time_slots.find(query).sort("date", 1))
    # Remove MongoDB _id field
    for slot in time_slots:
        slot.pop("_id", None)
    return time_slots

@app.get("/api/time-slots/available")
async def get_available_time_slots(service: Optional[str] = None, date: Optional[str] = None):
    query = {"is_available": True, "is_booked": False}
    if service:
        query["service"] = service  
    if date:
        query["date"] = date
    
    time_slots = list(db.time_slots.find(query).sort("date", 1))
    # Remove MongoDB _id field
    for slot in time_slots:
        slot.pop("_id", None)
    return time_slots

@app.put("/api/time-slots/{slot_id}")
async def update_time_slot(slot_id: str, slot_update: TimeSlotUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = {}
    if slot_update.is_available is not None:
        update_data["is_available"] = slot_update.is_available
    if slot_update.is_booked is not None:
        update_data["is_booked"] = slot_update.is_booked
    if slot_update.booking_id is not None:
        update_data["booking_id"] = slot_update.booking_id
    
    result = db.time_slots.update_one(
        {"id": slot_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    return {"message": "Time slot updated successfully"}

@app.delete("/api/time-slots/{slot_id}")
async def delete_time_slot(slot_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = db.time_slots.delete_one({"id": slot_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    return {"message": "Time slot deleted successfully"}

# Booking routes
@app.post("/api/bookings")
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    # Get the time slot
    time_slot = db.time_slots.find_one({"id": booking_data.time_slot_id})
    if not time_slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    if not time_slot["is_available"] or time_slot["is_booked"]:
        raise HTTPException(status_code=400, detail="Time slot is not available")
    
    # Create booking
    booking = Booking(
        user_id=current_user["id"],
        customer_name=booking_data.customer_name,
        customer_email=booking_data.customer_email,
        customer_phone=booking_data.customer_phone,
        service=time_slot["service"],
        date=time_slot["date"],
        time=time_slot["time"],
        notes=booking_data.notes
    )
    
    db.bookings.insert_one(booking.dict())
    
    # Mark time slot as booked
    db.time_slots.update_one(
        {"id": booking_data.time_slot_id},
        {"$set": {"is_booked": True, "booking_id": booking.id}}
    )
    
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
    # Remove MongoDB _id field and enrich with user data
    for booking in bookings:
        booking.pop("_id", None)
        # Get user info to include Instagram
        user = db.users.find_one({"id": booking["user_id"]})
        if user:
            booking["user_instagram"] = user.get("instagram", "")
        else:
            booking["user_instagram"] = ""
    return bookings

@app.put("/api/bookings/{booking_id}")
async def update_booking(booking_id: str, booking_update: BookingUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get the booking first
    booking = db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Update booking status
    result = db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": booking_update.status}}
    )
    
    # If booking is cancelled, free up the time slot
    if booking_update.status == "cancelled":
        db.time_slots.update_one(
            {"booking_id": booking_id},
            {"$set": {"is_booked": False, "booking_id": None}}
        )
    
    return {"message": "Booking updated successfully"}

# Media routes  
@app.post("/api/media/upload")
async def upload_media(file: UploadFile = File(...), category: str = "general", current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check file type
    allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv'}
    file_extension = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Type de fichier non supporté")
    
    # Generate unique filename
    filename = f"{str(uuid.uuid4())}.{file_extension}"
    file_path = Path(UPLOAD_DIR) / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Determine media type
    video_extensions = {'mp4', 'mov', 'avi', 'mkv'}
    media_type = "video" if file_extension in video_extensions else "image"
    
    # Save to database
    media_item = MediaItem(
        filename=filename,
        original_name=file.filename,
        category=category
    )
    # Add media type to the dict
    media_dict = media_item.dict()
    media_dict["media_type"] = media_type
    
    db.media.insert_one(media_dict)
    
    return {"message": "File uploaded successfully", "filename": filename, "media_type": media_type}

@app.get("/api/media")
async def get_media(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    
    media_items = list(db.media.find(query).sort("uploaded_at", -1))
    # Remove MongoDB _id field
    for item in media_items:
        item.pop("_id", None)
    return media_items

@app.get("/api/media/categories")
async def get_media_categories():
    """Get all available media categories"""
    categories = ["french-manucure", "nail-art", "pose-gel", "extensions-cils", "soins-pieds"]
    return {"categories": categories}

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Review routes
@app.post("/api/reviews")
async def create_review(review_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    # Vérifier que la réservation existe et appartient au user
    booking = db.bookings.find_one({"id": review_data.booking_id, "user_id": current_user["id"]})
    if not booking:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    
    # Vérifier que la réservation est confirmée ou complétée
    if booking["status"] not in ["confirmed", "completed"]:
        raise HTTPException(status_code=400, detail="Seules les réservations confirmées permettent de laisser un avis")
    
    # Vérifier qu'aucun avis n'existe déjà pour cette réservation
    existing_review = db.reviews.find_one({"booking_id": review_data.booking_id})
    if existing_review:
        raise HTTPException(status_code=400, detail="Un avis existe déjà pour cette réservation")
    
    # Valider la note (1-5)
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit être entre 1 et 5")
    
    # Créer l'avis
    review = Review(
        user_id=current_user["id"],
        booking_id=review_data.booking_id,
        customer_name=current_user["username"],  # Utilise le prénom du user
        rating=review_data.rating,
        comment=review_data.comment,
        service=booking["service"]
    )
    
    db.reviews.insert_one(review.dict())
    return {"message": "Avis créé avec succès. Il sera visible après validation par l'équipe.", "review_id": review.id}

@app.get("/api/reviews")
async def get_approved_reviews():
    """Récupère tous les avis approuvés pour affichage public"""
    reviews = list(db.reviews.find({"status": "approved"}).sort("approved_at", -1))
    # Remove MongoDB _id field
    for review in reviews:
        review.pop("_id", None)
    return reviews

@app.get("/api/reviews/stats")
async def get_review_stats():
    """Statistiques des avis approuvés"""
    approved_reviews = list(db.reviews.find({"status": "approved"}))
    
    if not approved_reviews:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    total_reviews = len(approved_reviews)
    total_rating = sum(review["rating"] for review in approved_reviews)
    average_rating = round(total_rating / total_reviews, 1)
    
    # Distribution des notes
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in approved_reviews:
        rating_distribution[review["rating"]] += 1
    
    return {
        "total_reviews": total_reviews,
        "average_rating": average_rating,
        "rating_distribution": rating_distribution
    }

@app.get("/api/reviews/pending")
async def get_pending_reviews(current_user: dict = Depends(get_current_user)):
    """Récupère les avis en attente de modération (admin seulement)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    reviews = list(db.reviews.find({"status": "pending"}).sort("created_at", -1))
    # Remove MongoDB _id field et enrichir avec info booking
    for review in reviews:
        review.pop("_id", None)
        # Ajouter info de la réservation
        booking = db.bookings.find_one({"id": review["booking_id"]})
        if booking:
            review["booking_date"] = booking["date"]
            review["booking_time"] = booking["time"]
    return reviews

@app.put("/api/reviews/{review_id}")
async def update_review_status(review_id: str, review_update: ReviewUpdate, current_user: dict = Depends(get_current_user)):
    """Approuver ou rejeter un avis (admin seulement)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if review_update.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    update_data = {"status": review_update.status}
    if review_update.status == "approved":
        update_data["approved_at"] = datetime.utcnow()
    
    result = db.reviews.update_one(
        {"id": review_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Avis non trouvé")
    
    action = "approuvé" if review_update.status == "approved" else "rejeté"
    return {"message": f"Avis {action} avec succès"}

@app.get("/api/reviews/my-eligible-bookings")
async def get_my_eligible_bookings(current_user: dict = Depends(get_current_user)):
    """Récupère les réservations du user éligibles pour un avis"""
    # Réservations confirmées ou complétées
    eligible_bookings = list(db.bookings.find({
        "user_id": current_user["id"],
        "status": {"$in": ["confirmed", "completed"]}
    }).sort("created_at", -1))
    
    # Retirer celles qui ont déjà un avis
    bookings_with_reviews = []
    for booking in eligible_bookings:
        existing_review = db.reviews.find_one({"booking_id": booking["id"]})
        booking["has_review"] = existing_review is not None
        booking.pop("_id", None)
        bookings_with_reviews.append(booking)
    
    return bookings_with_reviews

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "AM.BEAUTYY2 API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)