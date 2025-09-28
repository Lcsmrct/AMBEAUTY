import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <motion.div 
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">
                <span className="font-serif">AM.</span>
                <span className="text-primary">BEAUTYY2</span>
              </span>
            </motion.div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Services professionnels de manucure et d'extension de cils. 
              Sublimez votre beauté naturelle avec nos traitements de luxe.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/am.beautyy2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="mailto:Am.beautyy2@gmail.com"
                className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="tel:+33123456789"
                className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Pose américaine/unie - 25€</li>
              <li>Pose américaine/french/chargée - 30€</li>
              <li>Vernis semi-permanent - 20€</li>
              <li>Extension de cils - 40€</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Paris, France</li>
              <li>+33 1 23 45 67 89</li>
              <li>Am.beautyy2@gmail.com</li>
              <li>Lun-Sam: 9h-19h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AM.BEAUTYY2. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}