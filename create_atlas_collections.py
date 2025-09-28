#!/usr/bin/env python3
"""
Script pour créer les collections et données initiales dans MongoDB Atlas
Utilise les mêmes paramètres de connexion que le serveur FastAPI
"""
import os
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient
from passlib.context import CryptContext
import uuid

# Configuration exacte du serveur FastAPI
MONGO_URL = "mongodb+srv://j88463800_db_user:7TW5vH3p7Xq92BY8@ambeauty.0vk8krw.mongodb.net/?retryWrites=true&w=majority&appName=AMBEAUTY"

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(password):
    return pwd_context.hash(str(password)[:72] if password else "")

def main():
    try:
        print("🔗 Connexion à MongoDB Atlas avec les paramètres FastAPI...")
        
        # Utiliser exactement les mêmes paramètres que dans server.py
        client = MongoClient(
            MONGO_URL, 
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            tls=True,
            tlsAllowInvalidCertificates=True,
            retryWrites=True
        )
        
        # Test de connexion
        client.server_info()
        db = client.am_beauty
        print("✅ Connexion à MongoDB Atlas réussie!")

        # Lister les collections existantes
        existing_collections = db.list_collection_names()
        print(f"📊 Collections existantes: {existing_collections}")

        # 1. Créer l'utilisateur admin s'il n'existe pas
        print("\n👤 Création de l'utilisateur admin...")
        admin_user = db.users.find_one({"email": "admin@ambeauty.com"})
        if not admin_user:
            admin = {
                "id": str(uuid.uuid4()),
                "username": "admin",
                "email": "admin@ambeauty.com",
                "password": hash_password("admin123456"),
                "role": "admin",
                "instagram": "@ambeauty_official",
                "created_at": datetime.utcnow()
            }
            result = db.users.insert_one(admin)
            print(f"✅ Utilisateur admin créé avec ID: {result.inserted_id}")
        else:
            print("✅ Utilisateur admin existe déjà")

        # 2. Créer des utilisateurs clients d'exemple
        print("\n👥 Création d'utilisateurs clients...")
        clients = [
            {
                "username": "Sophie Martin",
                "email": "sophie@test.com",
                "password": "test123",
                "instagram": "@sophie_beauty"
            },
            {
                "username": "Marie Dubois",
                "email": "marie@test.com", 
                "password": "test123",
                "instagram": "@marie_nails"
            },
            {
                "username": "Julie Moreau",
                "email": "julie@test.com",
                "password": "test123", 
                "instagram": "@julie_lashes"
            }
        ]

        for client_data in clients:
            existing_client = db.users.find_one({"email": client_data["email"]})
            if not existing_client:
                client_user = {
                    "id": str(uuid.uuid4()),
                    "username": client_data["username"],
                    "email": client_data["email"],
                    "password": hash_password(client_data["password"]),
                    "role": "user",
                    "instagram": client_data["instagram"],
                    "created_at": datetime.utcnow()
                }
                result = db.users.insert_one(client_user)
                print(f"✅ Client {client_data['email']} créé avec ID: {result.inserted_id}")

        # 3. Créer des créneaux horaires pour les prochains jours
        print("\n📅 Création des créneaux horaires...")
        
        services = [
            "French Manucure",
            "Nail Art", 
            "Pose Gel",
            "Extensions de Cils",
            "Soins des Pieds",
            "Tous services"
        ]
        
        time_slots = [
            "09:00", "10:00", "11:00", "12:00",
            "14:00", "15:00", "16:00", "17:00", "18:00"
        ]
        
        slots_created = 0
        for i in range(14):  # 2 semaines à partir d'aujourd'hui
            date = (datetime.now() + timedelta(days=i+1)).strftime("%Y-%m-%d")
            
            # Éviter les dimanches (jour 6 dans weekday())
            day_of_week = (datetime.now() + timedelta(days=i+1)).weekday()
            if day_of_week == 6:  # Dimanche
                continue
            
            for time_slot in time_slots:
                for service in services:
                    existing_slot = db.time_slots.find_one({
                        "date": date,
                        "time": time_slot,
                        "service": service
                    })
                    
                    if not existing_slot:
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
                        result = db.time_slots.insert_one(slot)
                        slots_created += 1
        
        print(f"✅ {slots_created} créneaux horaires créés")

        # 4. Créer quelques réservations d'exemple
        print("\n📝 Création de réservations d'exemple...")
        
        # Récupérer quelques créneaux et utilisateurs pour créer des réservations
        some_slots = list(db.time_slots.find({"is_booked": False}).limit(3))
        some_users = list(db.users.find({"role": "user"}).limit(2))
        
        bookings_created = 0
        for i, slot in enumerate(some_slots[:2]):  # Créer 2 réservations
            if i < len(some_users):
                user = some_users[i]
                booking = {
                    "id": str(uuid.uuid4()),
                    "user_id": user["id"],
                    "customer_name": user["username"],
                    "customer_email": user["email"],
                    "customer_phone": f"06{20000000 + i:08d}",
                    "service": slot["service"],
                    "date": slot["date"],
                    "time": slot["time"],
                    "notes": f"Réservation d'exemple pour {slot['service']}",
                    "status": "confirmed",
                    "created_at": datetime.utcnow()
                }
                
                # Insérer la réservation
                result = db.bookings.insert_one(booking)
                
                # Marquer le créneau comme réservé
                db.time_slots.update_one(
                    {"id": slot["id"]},
                    {"$set": {"is_booked": True, "booking_id": booking["id"]}}
                )
                
                bookings_created += 1
                print(f"✅ Réservation créée: {booking['customer_name']} - {booking['service']}")

        # 5. Statistiques finales
        print("\n📊 Statistiques finales de MongoDB Atlas:")
        stats = {
            "users": db.users.count_documents({}),
            "time_slots": db.time_slots.count_documents({}),
            "bookings": db.bookings.count_documents({}),
            "media": db.media.count_documents({})
        }
        
        for collection, count in stats.items():
            print(f"  - {collection}: {count} documents")

        # 6. Lister toutes les collections créées
        final_collections = db.list_collection_names()
        print(f"\n🗂️ Collections dans MongoDB Atlas: {final_collections}")

        print("\n🎉 Création des collections MongoDB Atlas terminée!")
        print("\n📋 Comptes disponibles:")
        print("  👤 Admin: admin@ambeauty.com / admin123456")
        print("  👤 Clients: sophie@test.com, marie@test.com, julie@test.com / test123")
        
        print(f"\n📅 {slots_created} créneaux horaires disponibles")
        print(f"📝 {bookings_created} réservations d'exemple créées")

    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        import traceback
        print(f"Détails de l'erreur: {traceback.format_exc()}")
        sys.exit(1)

if __name__ == "__main__":
    main()