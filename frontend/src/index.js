import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enregistrement du Service Worker pour PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW enregistré avec succès: ', registration.scope);
        
        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Une nouvelle version est disponible
                if (window.confirm('Une nouvelle version de l\'application est disponible. Voulez-vous la charger ?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('Échec de l\'enregistrement SW: ', error);
      });
  });
}

// Gestion de l'installation PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Empêcher Chrome 67 et antérieur d'afficher automatiquement la bannière
  e.preventDefault();
  // Stocker l'événement pour pouvoir l'utiliser plus tard
  deferredPrompt = e;
  
  // Optionnel: Afficher votre propre bouton d'installation
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', () => {
      // Masquer le bouton
      installButton.style.display = 'none';
      // Afficher l'invite
      deferredPrompt.prompt();
      // Attendre que l'utilisateur réponde à l'invite
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('L\'utilisateur a accepté l\'invite A2HS');
        } else {
          console.log('L\'utilisateur a refusé l\'invite A2HS');
        }
        deferredPrompt = null;
      });
    });
  }
});