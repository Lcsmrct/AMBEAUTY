import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui';
import { Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const scrollToGallery = () => {
    const element = document.getElementById('gallery');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://customer-assets.emergentagent.com/job_5dcdd295-159e-4d7a-b11d-f7a440a23312/artifacts/vhl8rzsa_image.png"
          alt="Extensions de cils - Service professionnel AM.BEAUTYY2"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent-gold/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-accent-gold" />
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="font-serif">AM.</span>
          <span className="text-accent-gold">BEAUTYY2</span>
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Services professionnels de manucure et d'extension de cils. 
          Découvrez des traitements de beauté de luxe qui subliment votre élégance naturelle.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="rounded-full text-lg px-8 py-6 shadow-elevate-xl"
              onClick={() => navigate('/auth')}
              data-testid="button-hero-book"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Prendre Rendez-vous
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full text-lg px-8 py-6"
              onClick={scrollToGallery}
              data-testid="button-hero-gallery"
            >
              Voir la Galerie
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Animation Elements */}
        <motion.div
          className="absolute top-20 left-10 w-4 h-4 bg-accent-gold rounded-full opacity-60"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-6 h-6 bg-primary rounded-full opacity-40"
          animate={{ 
            y: [0, 15, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-1 h-8 bg-muted-foreground/50 rounded-full"
          animate={{ scaleY: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}