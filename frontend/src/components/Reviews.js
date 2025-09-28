import React from 'react';
import { motion } from 'framer-motion';
import { Construction, Star } from 'lucide-react';

export default function Reviews() {
  return (
    <section id="avis" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
            Avis Clients
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les témoignages de nos clientes satisfaites
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="bg-card rounded-lg p-12 shadow-lg text-center max-w-md mx-auto">
            <Construction className="w-16 h-16 text-accent-gold mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              En Construction
            </h3>
            <p className="text-muted-foreground mb-6">
              Cette section est actuellement en développement. 
              Bientôt vous pourrez consulter tous les avis de nos clientes !
            </p>
            <div className="flex justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className="w-6 h-6 fill-accent-gold text-accent-gold"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              En attendant, n'hésitez pas à nous contacter !
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}