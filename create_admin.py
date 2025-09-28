#!/usr/bin/env python3
import requests
import json

# Configuration
BACKEND_URL = "http://localhost:8001"

def create_admin():
    """Créer un compte administrateur"""
    
    # Données pour l'admin
    admin_data = {
        "username": "admin",
        "email": "admin@ambeauty.com",
        "password": "admin123456"
    }
    
    print("Création du compte admin...")
    
    try:
        # S'inscrire
        response = requests.post(f"{BACKEND_URL}/api/auth/register", json=admin_data)
        
        if response.status_code == 200:
            result = response.json()
            print("✓ Compte admin créé avec succès")
            print(f"Email: {admin_data['email']}")
            print(f"Mot de passe: {admin_data['password']}")
            print(f"Token: {result['access_token'][:20]}...")
            
            # Maintenant il faut modifier le rôle en admin (car par défaut c'est "user")
            # On va le faire directement via l'API en modifiant le serveur pour permettre cela
            
        elif response.status_code == 400:
            print("⚠ L'utilisateur admin existe déjà")
            
            # Essayer de se connecter
            login_data = {
                "email": admin_data['email'],
                "password": admin_data['password']
            }
            
            login_response = requests.post(f"{BACKEND_URL}/api/auth/login", json=login_data)
            
            if login_response.status_code == 200:
                result = login_response.json()
                print("✓ Connexion admin réussie")
                print(f"Rôle: {result['user']['role']}")
                
                if result['user']['role'] != 'admin':
                    print("⚠ L'utilisateur n'a pas le rôle admin")
                    return None
                    
                return result['access_token']
            else:
                print(f"✗ Erreur de connexion: {login_response.text}")
                return None
        else:
            print(f"✗ Erreur lors de la création: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("✗ Impossible de se connecter au backend. Vérifiez qu'il fonctionne sur le port 8001")
        return None
    except Exception as e:
        print(f"✗ Erreur: {e}")
        return None

def test_api():
    """Tester l'API de santé"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/health")
        if response.status_code == 200:
            print("✓ API backend accessible")
            return True
        else:
            print(f"⚠ API répond avec le code: {response.status_code}")
            return False
    except:
        print("✗ API backend inaccessible")
        return False

if __name__ == "__main__":
    print("=== Configuration Admin AM.BEAUTYY2 ===\n")
    
    if test_api():
        create_admin()
    else:
        print("Vérifiez que le backend est démarré avec: sudo supervisorctl restart backend")