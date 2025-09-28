#!/usr/bin/env python3
"""
Script pour créer les données dans MongoDB Atlas via l'API FastAPI
"""
import requests
import json
from datetime import datetime, timedelta

API_BASE = "http://localhost:8001"

def get_admin_token():
    """Se connecter en tant qu'admin et récupérer le token"""
    response = requests.post(f"{API_BASE}/api/auth/login", json={
        "email": "admin@ambeauty.com",
        "password": "admin123456"
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"❌ Erreur de connexion admin: {response.status_code}")
        return None

def create_client_users(token):
    """Créer des utilisateurs clients d'exemple"""
    headers = {"Authorization": f"Bearer {token}"}
    
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
        },
        {
            "username": "Emma Rousseau",
            "email": "emma@test.com",
            "password": "test123", 
            "instagram": "@emma_beauty"
        }
    ]
    
    print("👥 Création des utilisateurs clients...")
    created_users = []
    
    for client_data in clients:
        # Tenter de créer l'utilisateur
        response = requests.post(f"{API_BASE}/api/auth/register", json=client_data)
        
        if response.status_code == 200:
            user_info = response.json()["user"]
            created_users.append(user_info)
            print(f"✅ Client créé: {client_data['email']}")
        else:
            print(f"⚠️  Client {client_data['email']} existe déjà ou erreur")
    
    return created_users

def create_time_slots(token):
    """Créer des créneaux horaires"""
    headers = {"Authorization": f"Bearer {token}"}
    
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
    
    print("📅 Création des créneaux horaires...")
    slots_created = 0
    
    # Créer des créneaux pour les 2 prochaines semaines
    for i in range(14):
        date = (datetime.now() + timedelta(days=i+1)).strftime("%Y-%m-%d")
        
        # Éviter les dimanches
        day_of_week = (datetime.now() + timedelta(days=i+1)).weekday()
        if day_of_week == 6:  # Dimanche
            continue
        
        for time_slot in time_slots:
            for service in services:
                slot_data = {
                    "date": date,
                    "time": time_slot,
                    "service": service
                }
                
                response = requests.post(f"{API_BASE}/api/time-slots", 
                                       json=slot_data, 
                                       headers=headers)
                
                if response.status_code == 200:
                    slots_created += 1
                    if slots_created % 20 == 0:  # Afficher le progrès
                        print(f"  {slots_created} créneaux créés...")
    
    print(f"✅ {slots_created} créneaux horaires créés dans MongoDB Atlas")
    return slots_created

def get_available_slots():
    """Récupérer quelques créneaux disponibles"""
    response = requests.get(f"{API_BASE}/api/time-slots/available")
    if response.status_code == 200:
        return response.json()[:5]  # Prendre les 5 premiers
    return []

def create_sample_bookings(token, users):
    """Créer quelques réservations d'exemple"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Récupérer des créneaux disponibles
    available_slots = get_available_slots()
    
    print(f"📝 Création de réservations avec {len(available_slots)} créneaux disponibles...")
    
    bookings_created = 0
    sample_phones = ["0612345678", "0623456789", "0634567890", "0645678901"]
    
    for i, slot in enumerate(available_slots[:len(users)]):
        if i < len(users):
            user = users[i]
            phone = sample_phones[i % len(sample_phones)]
            
            booking_data = {
                "customer_name": user["username"],
                "customer_email": user["email"], 
                "customer_phone": phone,
                "time_slot_id": slot["id"],
                "notes": f"Réservation d'exemple pour {slot['service']}"
            }
            
            response = requests.post(f"{API_BASE}/api/bookings",
                                   json=booking_data,
                                   headers=headers)
            
            if response.status_code == 200:
                bookings_created += 1
                print(f"✅ Réservation: {user['username']} - {slot['service']} - {slot['date']} {slot['time']}")
    
    return bookings_created

def check_database_stats():
    """Vérifier les statistiques de la base de données"""
    print("\n📊 Vérification des données dans MongoDB Atlas...")
    
    # Vérifier les créneaux
    slots_response = requests.get(f"{API_BASE}/api/time-slots")
    if slots_response.status_code == 200:
        slots_count = len(slots_response.json())
        print(f"  📅 Créneaux horaires: {slots_count}")
    
    # Vérifier les créneaux disponibles
    available_response = requests.get(f"{API_BASE}/api/time-slots/available")
    if available_response.status_code == 200:
        available_count = len(available_response.json())
        print(f"  🆓 Créneaux disponibles: {available_count}")

def main():
    print("🚀 Initialisation des données MongoDB Atlas via l'API FastAPI...")
    print("=" * 60)
    
    # 1. Se connecter en tant qu'admin
    token = get_admin_token()
    if not token:
        print("❌ Impossible de se connecter en tant qu'admin")
        return
    
    print("✅ Connexion admin réussie")
    
    # 2. Créer des utilisateurs clients
    created_users = create_client_users(token)
    print(f"✅ {len(created_users)} utilisateurs clients traités")
    
    # 3. Créer des créneaux horaires
    slots_created = create_time_slots(token)
    
    # 4. Créer quelques réservations d'exemple
    bookings_created = create_sample_bookings(token, created_users)
    print(f"✅ {bookings_created} réservations d'exemple créées")
    
    # 5. Vérifier les statistiques
    check_database_stats()
    
    print("\n🎉 Initialisation terminée!")
    print(f"📋 MongoDB Atlas maintenant contient:")
    print(f"  👤 Utilisateurs: Admin + {len(created_users)} clients")
    print(f"  📅 {slots_created} créneaux horaires")
    print(f"  📝 {bookings_created} réservations")
    
    print(f"\n🔐 Comptes de test:")
    print(f"  👨‍💼 Admin: admin@ambeauty.com / admin123456")
    for user in created_users:
        print(f"  👤 Client: {user['email']} / test123")

if __name__ == "__main__":
    main()