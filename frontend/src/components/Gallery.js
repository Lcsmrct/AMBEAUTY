import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, LoadingSpinner } from './ui';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { mediaAPI } from '../services/api';

// Vos vraies photos de nail art AM.BEAUTYY2
const portfolioImages = [
  {
    id: 1,
    filename: 'french-classic.jpg',
    original_name: 'French manucure classique',
    category: 'french-manucure',
    media_type: 'image',
    url: 'https://customer-assets.emergentagent.com/job_3b17d939-f009-4be6-ae07-4e5c12ff4e6c/artifacts/svt3ri17_image.png'
  },
  {
    id: 2,
    filename: 'nail-art-rose.jpg', 
    original_name: 'Nail art rose avec motifs',
    category: 'nail-art',
    media_type: 'image',
    url: 'https://customer-assets.emergentagent.com/job_3b17d939-f009-4be6-ae07-4e5c12ff4e6c/artifacts/akjkoxe7_image.png'
  },
  {
    id: 3,
    filename: 'nail-art-strass.jpg',
    original_name: 'Design avec strass et motifs',
    category: 'nail-art',
    media_type: 'image',
    url: 'https://customer-assets.emergentagent.com/job_3b17d939-f009-4be6-ae07-4e5c12ff4e6c/artifacts/prucnmov_image.png'
  },
  {
    id: 4,
    filename: 'french-pieds.jpg',
    original_name: 'French manucure pieds et mains',
    category: 'french-manucure',
    media_type: 'image',
    url: 'https://customer-assets.emergentagent.com/job_3b17d939-f009-4be6-ae07-4e5c12ff4e6c/artifacts/69si1b95_image.png'
  }
];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await mediaAPI.getAll();
        const mediaImages = response.data.map(item => ({
          ...item,
          url: `${process.env.REACT_APP_BACKEND_URL}/uploads/${item.filename}`
        }));
        
        // If no images from API, use placeholders
        setImages(mediaImages.length > 0 ? mediaImages : placeholderImages);
      } catch (error) {
        console.error('Error fetching images:', error);
        // Fallback to placeholder images
        setImages(placeholderImages);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(images[newIndex]);
  };

  if (loading) {
    return (
      <section id="gallery" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
            Notre Galerie
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos dernières réalisations et inspirez-vous pour votre prochain rendez-vous beauté
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className="aspect-square overflow-hidden rounded-2xl cursor-pointer group"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              onClick={() => openModal(image)}
              data-testid={`gallery-image-${image.id}`}
            >
              <img 
                src={image.url}
                alt={image.original_name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && selectedImage && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="relative max-w-4xl w-full mx-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                  onClick={closeModal}
                  data-testid="button-close-modal"
                >
                  <X className="h-6 w-6" />
                </Button>

                <img
                  src={selectedImage.url}
                  alt={selectedImage.original_name}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />

                {/* Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigateImage('prev')}
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigateImage('next')}
                  data-testid="button-next-image"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}