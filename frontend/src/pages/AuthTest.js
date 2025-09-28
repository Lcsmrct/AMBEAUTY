import React, { useState } from 'react';

export default function AuthTest() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Test Auth</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`flex-1 px-4 py-2 font-medium border-b-2 ${
              activeTab === 'login' 
                ? 'border-red-500 text-red-500' 
                : 'border-transparent text-gray-500'
            }`}
            onClick={() => {
              console.log('Login tab clicked');
              setActiveTab('login');
            }}
          >
            Connexion
          </button>
          <button
            className={`flex-1 px-4 py-2 font-medium border-b-2 ${
              activeTab === 'register' 
                ? 'border-red-500 text-red-500' 
                : 'border-transparent text-gray-500'
            }`}
            onClick={() => {
              console.log('Register tab clicked');
              setActiveTab('register');
            }}
          >
            Inscription
          </button>
        </div>
        
        <div className="mb-4">
          <p>Active tab: {activeTab}</p>
        </div>
        
        {/* Login Form */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="votre.email@example.com"
                data-testid="input-login-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="••••••••"
                data-testid="input-login-password"
              />
            </div>
            <button 
              className="w-full bg-red-500 text-white p-3 rounded-lg"
              data-testid="button-login"
            >
              Se connecter
            </button>
          </div>
        )}
        
        {/* Register Form */}
        {activeTab === 'register' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom complet</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Votre nom complet"
                data-testid="input-register-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="votre.email@example.com"
                data-testid="input-register-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="••••••••"
                data-testid="input-register-password"
              />
            </div>
            <button 
              className="w-full bg-red-500 text-white p-3 rounded-lg"
              data-testid="button-register"
            >
              Créer mon compte
            </button>
          </div>
        )}
      </div>
    </div>
  );
}