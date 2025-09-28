#!/usr/bin/env python3
"""
Script pour peupler la base de données MongoDB Atlas avec des données de production
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

def create_time_slots(token):
    """Créer des créneaux horaires pour les 2 prochaines semaines"""
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
                    if slots_created % 50 == 0:  # Afficher le progrès
                        print(f"  {slots_created} créneaux créés...")
    
    print(f"✅ {slots_created} créneaux horaires créés dans MongoDB Atlas")
    return slots_created

def main():
    print("🚀 Peuplement des données de production MongoDB Atlas...")
    print("=" * 60)
    
    # 1. Se connecter en tant qu'admin
    token = get_admin_token()
    if not token:
        print("❌ Impossible de se connecter en tant qu'admin")
        return
    
    print("✅ Connexion admin réussie")
    
    # 2. Créer des créneaux horaires
    slots_created = create_time_slots(token)
    
    print(f"\n🎉 Peuplement terminé!")
    print(f"📅 {slots_created} créneaux horaires créés")
    print(f"🔐 Admin: admin@ambeauty.com / admin123456")

if __name__ == "__main__":
    main()