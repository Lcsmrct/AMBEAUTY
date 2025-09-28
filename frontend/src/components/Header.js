import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuth = () => {
    if (isAuthenticated) {
      // Navigate to dashboard based on role
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } else {
      navigate('/auth');
    }
  };

  const navigateToPage = (page) => {
    navigate(`/${page}`);
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="text-2xl font-bold text-primary cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => navigate('/')}
          >
            <span className="font-serif">AM.</span>
            <span className="text-accent-gold">BEAUTYY2</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { key: "accueil", label: "Accueil" },
              { key: "tarifs", label: "Tarifs" },
              { key: "galerie", label: "Galerie" },
              { key: "avis", label: "Avis" }
            ].map((item, index) => (
              <motion.button
                key={item.key}
                onClick={() => navigateToPage(item.key)}
                className="text-foreground hover:text-primary transition-colors"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ y: -2 }}
                data-testid={`link-${item.key}`}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <motion.div 
            className="hidden md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              className="rounded-full"
              onClick={handleAuth}
              data-testid="button-auth"
            >
              {isAuthenticated ? (
                user?.role === 'admin' ? 'Administration' : 'Mon Espace'
              ) : (
                'Se connecter'
              )}
            </Button>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav 
            className="md:hidden mt-4 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {[
              { key: "accueil", label: "Accueil" },
              { key: "tarifs", label: "Tarifs" },
              { key: "gallery", label: "Galerie" },
              { key: "avis", label: "Avis" }
            ].map((item) => (
              <motion.button
                key={item.key}
                onClick={() => scrollToSection(item.key)}
                className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
                whileHover={{ x: 10 }}
                data-testid={`link-mobile-${item.key}`}
              >
                {item.label}
              </motion.button>
            ))}
            <Button 
              className="w-full mt-4 rounded-full"
              onClick={handleAuth}
              data-testid="button-mobile-auth"
            >
              {isAuthenticated ? (
                user?.role === 'admin' ? 'Administration' : 'Mon Espace'
              ) : (
                'Se connecter'
              )}
            </Button>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}