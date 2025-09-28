#!/usr/bin/env python3
"""
Script pour initialiser les données de l'application AM.BEAUTY
"""
import os
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient
from passlib.context import CryptContext
import uuid

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://j88463800_db_user:7TW5vH3p7Xq92BY8@ambeauty.0vk8krw.mongodb.net/?retryWrites=true&w=majority&appName=AMBEAUTY")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(password):
    return pwd_context.hash(str(password)[:72] if password else "")

def main():
    try:
        print("🔗 Connexion à MongoDB Atlas...")
        client = MongoClient(
            MONGO_URL, 
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            tls=True,
            tlsAllowInvalidCertificates=True,
            retryWrites=True
        )
        client.server_info()
        db = client.am_beauty
        print("✅ Connexion réussie!")

        # 1. Créer l'utilisateur admin s'il n'existe pas
        print("\n👤 Vérification de l'utilisateur admin...")
        admin_user = db.users.find_one({"email": "admin@ambeauty.com"})
        if not admin_user:
            admin = {
                "id": str(uuid.uuid4()),
                "username": "admin",
                "email": "admin@ambeauty.com",
                "password": hash_password("admin123456"),
                "role": "admin",
                "instagram": "",
                "created_at": datetime.utcnow()
            }
            db.users.insert_one(admin)
            print("✅ Utilisateur admin créé: admin@ambeauty.com / admin123456")
        else:
            print("✅ Utilisateur admin existe déjà")

        # 2. Créer des créneaux horaires d'exemple pour les 7 prochains jours
        print("\n📅 Création des créneaux horaires...")
        
        # Services disponibles
        services = [
            "French Manucure",
            "Nail Art",
            "Pose Gel",
            "Extensions de Cils",
            "Soins des Pieds",
            "Tous services"
        ]
        
        # Horaires typiques (9h à 18h)
        time_slots = [
            "09:00", "10:00", "11:00", "12:00",
            "14:00", "15:00", "16:00", "17:00", "18:00"
        ]
        
        slots_created = 0
        for i in range(7):  # 7 jours à partir d'aujourd'hui
            date = (datetime.now() + timedelta(days=i+1)).strftime("%Y-%m-%d")
            
            for time_slot in time_slots:
                for service in services:
                    # Vérifier si le créneau existe déjà
                    existing = db.time_slots.find_one({
                        "date": date,
                        "time": time_slot,
                        "service": service
                    })
                    
                    if not existing:
                        slot = {
                            "id": str(uuid.uuid4()),
                            "date": date,
                            "time": time_slot,
                            "service": service,
                            "is_available": True,
                            "is_booked": False,
                            "booking_id": None,
                            "created_at": datetime.utcnow()
                        }
                        db.time_slots.insert_one(slot)
                        slots_created += 1
        
        print(f"✅ {slots_created} créneaux horaires créés")

        # 3. Créer un utilisateur client d'exemple
        print("\n👥 Création d'un utilisateur client d'exemple...")
        test_user = db.users.find_one({"email": "client@test.com"})
        if not test_user:
            client_user = {
                "id": str(uuid.uuid4()),
                "username": "Client Test",
                "email": "client@test.com",
                "password": hash_password("test123"),
                "role": "user",
                "instagram": "@clienttest",
                "created_at": datetime.utcnow()
            }
            db.users.insert_one(client_user)
            print("✅ Utilisateur client créé: client@test.com / test123")
        else:
            print("✅ Utilisateur client existe déjà")

        # 4. Statistiques finales
        print("\n📊 Statistiques de la base de données:")
        stats = {
            "users": db.users.count_documents({}),
            "time_slots": db.time_slots.count_documents({}),
            "bookings": db.bookings.count_documents({}),
            "media": db.media.count_documents({})
        }
        
        for collection, count in stats.items():
            print(f"  - {collection}: {count} documents")

        # 5. Lister les collections créées
        print(f"\n🗂️ Collections disponibles: {db.list_collection_names()}")

        print("\n🎉 Initialisation des données terminée avec succès!")
        print("\n📋 Comptes disponibles:")
        print("  👤 Admin: admin@ambeauty.com / admin123456")
        print("  👤 Client: client@test.com / test123")

    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()