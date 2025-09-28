import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from './ui';
import { Clock, Star, Euro } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    id: 1,
    name: "Pose américaine/Unie",
    description: "Manucure professionnelle américaine ou couleur unie avec vernis premium",
    price: "25€",
    duration: "45 min",
    rating: 4.9,
    popular: false
  },
  {
    id: 2,
    name: "Pose en gel",
    description: "Pose de vernis en gel résistant et brillant, idéal pour une tenue longue durée",
    price: "30€",
    duration: "60 min",
    rating: 4.8,
    popular: true
  },
  {
    id: 3,
    name: "Vernis semi-permanent pieds/mains",
    description: "Vernis semi-permanent longue durée pour mains et pieds",
    price: "20€",
    duration: "40 min",
    rating: 4.7,
    popular: false
  },
  {
    id: 4,
    name: "Extension de cils",
    description: "Extensions de cils professionnelles pour un regard spectaculaire et naturel",
    price: "40€",
    duration: "90 min",
    rating: 5.0,
    popular: true
  }
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <section id="tarifs" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
            Tarifs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Traitements de beauté professionnels réalisés avec précision et soin
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden hover-elevate transition-transform duration-300 h-full">
                <div className="relative p-6">
                  {service.popular && (
                    <Badge className="absolute top-4 right-4 bg-pink-300 text-black">
                      Populaire
                    </Badge>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                        <CardDescription className="text-base">
                          {service.description}
                        </CardDescription>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary">{service.price}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {service.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent-gold text-accent-gold" />
                      <span className="text-sm font-medium">{service.rating}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full rounded-full" 
                    variant={service.popular ? "primary" : "outline"}
                    onClick={() => navigate('/auth')}
                    data-testid={`button-book-${service.id}`}
                  >
                    Réserver ce Service
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-full"
            onClick={() => navigate('/auth')}
            data-testid="button-view-all-services"
          >
            Voir Tous les Services
          </Button>
        </motion.div>
      </div>
    </section>
  );
}