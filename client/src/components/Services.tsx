import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Euro } from "lucide-react";
import manicureImage from "@assets/generated_images/Professional_manicure_service_image_ac4724c4.png";
import eyelashImage from "@assets/generated_images/Eyelash_extensions_service_image_4d45b2d4.png";

const services = [
  {
    id: 1,
    name: "Manicure - Pose américaine/Unie",
    description: "Professional American or solid color manicure with premium polish",
    price: "25€",
    duration: "45 min",
    rating: 4.9,
    image: manicureImage,
    popular: true
  },
  {
    id: 2,
    name: "Manicure - Pose américaine/French/Chargée",
    description: "Elegant French manicure or detailed nail art with intricate designs",
    price: "30€",
    duration: "60 min",
    rating: 4.8,
    image: manicureImage,
    popular: false
  },
  {
    id: 3,
    name: "Vernis semi-permanent pieds/mains",
    description: "Long-lasting semi-permanent polish for hands and feet",
    price: "20€",
    duration: "40 min",
    rating: 4.7,
    image: manicureImage,
    popular: false
  },
  {
    id: 4,
    name: "Extension de cils",
    description: "Professional eyelash extensions for dramatic, natural-looking lashes",
    price: "30€",
    duration: "90 min",
    rating: 5.0,
    image: eyelashImage,
    popular: true
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional beauty treatments crafted with precision and care
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
                <div className="relative">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-48 object-cover"
                  />
                  {service.popular && (
                    <Badge className="absolute top-4 left-4 bg-accent-gold text-black">
                      Popular
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{service.price}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
                    variant={service.popular ? "default" : "outline"}
                    data-testid={`button-book-${service.id}`}
                  >
                    Book This Service
                  </Button>
                </CardContent>
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
            data-testid="button-view-all-services"
          >
            View All Services
          </Button>
        </motion.div>
      </div>
    </section>
  );
}