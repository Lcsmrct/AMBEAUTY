import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, LoadingSpinner, Badge } from './ui';
import { X, ChevronLeft, ChevronRight, Filter, Play } from 'lucide-react';
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
  const [allMedia, setAllMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories] = useState([
    { id: 'all', name: 'Tout voir' },
    { id: 'french-manucure', name: 'French Manucure' },
    { id: 'nail-art', name: 'Nail Art' },
    { id: 'pose-gel', name: 'Pose Gel' },
    { id: 'extensions-cils', name: 'Extensions Cils' }
  ]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await mediaAPI.getAll();
        const mediaItems = response.data.map(item => ({
          ...item,
          url: `${process.env.REACT_APP_BACKEND_URL}/uploads/${item.filename}`
        }));
        
        // Combine API media with portfolio images
        const combinedMedia = [...portfolioImages, ...mediaItems];
        setAllMedia(combinedMedia);
        setFilteredMedia(combinedMedia);
      } catch (error) {
        console.error('Error fetching media:', error);
        // Use only portfolio images if API fails
        setAllMedia(portfolioImages);
        setFilteredMedia(portfolioImages);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredMedia(allMedia);
    } else {
      setFilteredMedia(allMedia.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, allMedia]);

  const openModal = (media) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  const navigateMedia = (direction) => {
    if (!selectedMedia) return;
    
    const currentIndex = filteredMedia.findIndex(item => item.id === selectedMedia.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredMedia.length - 1;
    } else {
      newIndex = currentIndex < filteredMedia.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedMedia(filteredMedia[newIndex]);
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
            Notre Portfolio
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos réalisations AM.BEAUTYY2 - Nail art, French manucure et extensions de cils
          </p>
        </motion.div>

        {/* Filtres par catégorie */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full"
              data-testid={`filter-${category.id}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              {category.name}
            </Button>
          ))}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((media, index) => (
            <motion.div
              key={media.id}
              className="aspect-square overflow-hidden rounded-2xl cursor-pointer group relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              onClick={() => openModal(media)}
              data-testid={`gallery-media-${media.id}`}
            >
              {media.media_type === 'video' ? (
                <>
                  <video 
                    src={media.url}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    muted
                    loop
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <img 
                  src={media.url}
                  alt={media.original_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              )}
              
              {/* Badge catégorie */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  {categories.find(cat => cat.id === media.category)?.name || media.category}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMedia.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Filter className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucune réalisation dans cette catégorie pour le moment.</p>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && selectedMedia && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
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

                {/* Titre et catégorie */}
                <div className="absolute top-4 left-4 z-10">
                  <h3 className="text-white text-lg font-semibold mb-1">
                    {selectedMedia.original_name}
                  </h3>
                  <Badge variant="secondary">
                    {categories.find(cat => cat.id === selectedMedia.category)?.name || selectedMedia.category}
                  </Badge>
                </div>

                {selectedMedia.media_type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    controls
                    autoPlay
                    loop
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.original_name}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  />
                )}

                {/* Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigateMedia('prev')}
                  data-testid="button-prev-media"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigateMedia('next')}
                  data-testid="button-next-media"
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