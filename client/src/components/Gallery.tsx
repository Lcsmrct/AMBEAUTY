import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import manicureImage from "@assets/generated_images/Professional_manicure_service_image_ac4724c4.png";
import eyelashImage from "@assets/generated_images/Eyelash_extensions_service_image_4d45b2d4.png";
import heroImage from "@assets/generated_images/Beauty_spa_hero_background_56b98f74.png";

// Mock gallery images for demo
const galleryImages = [
  { id: 1, src: manicureImage, alt: "Professional manicure work", category: "manicure" },
  { id: 2, src: eyelashImage, alt: "Eyelash extension application", category: "eyelashes" },
  { id: 3, src: heroImage, alt: "Beauty salon atmosphere", category: "salon" },
  { id: 4, src: manicureImage, alt: "Nail art design", category: "manicure" },
  { id: 5, src: eyelashImage, alt: "Dramatic lash extensions", category: "eyelashes" },
  { id: 6, src: manicureImage, alt: "French manicure style", category: "manicure" },
  { id: 7, src: eyelashImage, alt: "Natural lash enhancement", category: "eyelashes" },
  { id: 8, src: heroImage, alt: "Luxury treatment room", category: "salon" },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (imageId: number) => {
    setSelectedImage(imageId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    const currentIndex = galleryImages.findIndex(img => img.id === selectedImage);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : galleryImages.length - 1;
    } else {
      newIndex = currentIndex < galleryImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(galleryImages[newIndex].id);
  };

  const selectedImageData = galleryImages.find(img => img.id === selectedImage);

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
            Our Gallery
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See our latest work and get inspired for your next beauty appointment
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              className="aspect-square overflow-hidden rounded-2xl cursor-pointer group"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              onClick={() => openModal(image.id)}
              data-testid={`gallery-image-${image.id}`}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl w-full p-0 bg-black/90 border-none">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={closeModal}
                data-testid="button-close-modal"
              >
                <X className="h-6 w-6" />
              </Button>

              {selectedImageData && (
                <motion.img
                  src={selectedImageData.src}
                  alt={selectedImageData.alt}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

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
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}