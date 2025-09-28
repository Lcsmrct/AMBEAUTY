import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(loginData);
    
    if (result.success) {
      toast({ title: "Connexion réussie", description: "Redirection vers votre espace..." });
      setTimeout(() => {
        // Navigation will be handled by the auth context
        navigate('/');
        window.location.reload(); // Refresh to update auth state
      }, 1000);
    } else {
      toast({ 
        title: "Erreur de connexion", 
        description: result.error,
        variant: "error"
      });
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await register(registerData);
    
    if (result.success) {
      toast({ 
        title: "Compte créé avec succès", 
        description: "Redirection vers votre espace client..." 
      });
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Refresh to update auth state
      }, 1000);
    } else {
      toast({ 
        title: "Erreur lors de l'inscription", 
        description: result.error,
        variant: "error"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-3xl font-bold">
              <span className="font-serif">AM.</span>
              <span className="text-primary">BEAUTYY2</span>
            </span>
          </motion.div>
          <p className="text-muted-foreground">Accédez à votre espace personnel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Connexion / Inscription</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous pour réserver vos rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre.email@example.com"
                      required
                      data-testid="input-login-email"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Mot de passe
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                      data-testid="input-login-password"
                      disabled={loading}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full rounded-full" 
                    data-testid="button-login"
                    disabled={loading}
                  >
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Admin test: admin@example.com / Admin123!
                  </p>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nom complet
                    </Label>
                    <Input
                      id="register-name"
                      value={registerData.username}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Votre nom complet"
                      required
                      data-testid="input-register-name"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre.email@example.com"
                      required
                      data-testid="input-register-email"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Mot de passe
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                      data-testid="input-register-password"
                      disabled={loading}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full rounded-full" 
                    data-testid="button-register"
                    disabled={loading}
                  >
                    {loading ? "Création..." : "Créer mon compte"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            data-testid="button-back-home"
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </motion.div>
    </div>
  );
}