import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Auth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', loginData);
    
    // Mock authentication logic
    if (loginData.email === "admin@example.com" && loginData.password === "Admin123!") {
      toast({ title: "Connexion réussie", description: "Redirection vers l'espace admin..." });
      setTimeout(() => navigate("/admin"), 1000);
    } else if (loginData.email && loginData.password) {
      toast({ title: "Connexion réussie", description: "Redirection vers votre espace client..." });
      setTimeout(() => navigate("/client"), 1000);
    } else {
      toast({ title: "Erreur", description: "Identifiants incorrects", variant: "destructive" });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register attempt:', registerData);
    toast({ 
      title: "Compte créé avec succès", 
      description: "Redirection vers votre espace client..." 
    });
    setTimeout(() => navigate("/client"), 1000);
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
            <Tabs defaultValue="login" className="w-full">
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
                    />
                  </div>
                  
                  <Button type="submit" className="w-full rounded-full" data-testid="button-login">
                    Se connecter
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
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Votre nom complet"
                      required
                      data-testid="input-register-name"
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
                    />
                  </div>
                  
                  <Button type="submit" className="w-full rounded-full" data-testid="button-register">
                    Créer mon compte
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