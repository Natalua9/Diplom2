
import React from 'react';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface DirectionGalleryProps {
  images: string[];
}

const DirectionGallery = ({ images }: DirectionGalleryProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // For mobile view, show a carousel
  const mobileGallery = (
    <div className="md:hidden">
      <Carousel opts={{ loop: true }}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="aspect-w-3 aspect-h-4 rounded-md overflow-hidden">
                <img 
                  src={image} 
                  alt={`Gallery image ${index + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/defolt.png";
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );

  // For desktop view, show a grid gallery
  const desktopGallery = (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="hidden md:grid grid-cols-3 gap-4"
    >
      {images.map((image, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={`rounded-md overflow-hidden ${
            index === 0 ? 'md:col-span-2 md:row-span-2' : ''
          }`}
        >
          <div className="h-full">
            <img 
              src={image} 
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/images/defolt.png";
              }}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <section className="py-16 md:py-20">
      <div className="container-custom">
        {mobileGallery}
        {desktopGallery}
      </div>
    </section>
  );
};

export default DirectionGallery;
