import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, User } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Sophie Martin",
    service: "Extension de cils",
    rating: 5,
    comment: "Magnifique travail ! Mes cils sont parfaits et naturels. Je recommande vivement AM.BEAUTYY2 !",
    avatar: "SM"
  },
  {
    id: 2,
    name: "Camille Dubois",
    service: "Pose en gel",
    rating: 5,
    comment: "Super prestation, manucure impeccable qui tient longtemps. L'accueil est très chaleureux.",
    avatar: "CD"
  },
  {
    id: 3,
    name: "Marie Leroy",
    service: "Pose américaine/french",
    rating: 5,
    comment: "Très professionnelle et à l'écoute. Le résultat dépasse mes attentes, merci beaucoup !",
    avatar: "ML"
  },
  {
    id: 4,
    name: "Emma Garcia",
    service: "Soins des Pieds",
    rating: 5,
    comment: "Excellent service, très soignée dans son travail. Je reviendrai sans hésiter !",
    avatar: "EG"
  },
  {
    id: 5,
    name: "Léa Bernard",
    service: "Extension de cils",
    rating: 5,
    comment: "Résultat au-delà de mes espérances ! Technique parfaite et ambiance très agréable.",
    avatar: "LB"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-défilement
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Relance l'auto après 10s
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Relance l'auto après 10s
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Relance l'auto après 10s
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
            Ce que disent nos clientes
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les témoignages authentiques de nos clientes satisfaites
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="p-8 md:p-12"
              >
                <div className="text-center">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-lg font-bold text-gray-700">
                      {testimonials[currentIndex].avatar}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-pink-300 text-pink-300 mx-0.5"
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <blockquote className="text-lg md:text-xl text-foreground mb-6 italic leading-relaxed">
                    "{testimonials[currentIndex].comment}"
                  </blockquote>

                  {/* Name & Service */}
                  <div className="text-center">
                    <div className="font-semibold text-foreground text-lg">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-pink-300 text-sm font-medium">
                      {testimonials[currentIndex].service}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors group"
              data-testid="testimonials-prev"
            >
              <ChevronLeft className="w-5 h-5 text-pink-400 group-hover:text-pink-500" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors group"
              data-testid="testimonials-next"
            >
              <ChevronRight className="w-5 h-5 text-pink-400 group-hover:text-pink-500" />
            </button>
          </div>

          {/* Dots Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-pink-300 w-8'
                    : 'bg-gray-300 hover:bg-pink-200'
                }`}
                data-testid={`testimonials-dot-${index}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {[
            { number: "500+", label: "Clientes satisfaites" },
            { number: "4.9", label: "Note moyenne" },
            { number: "98%", label: "Recommandations" },
            { number: "3 ans", label: "D'expérience" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-pink-400 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}