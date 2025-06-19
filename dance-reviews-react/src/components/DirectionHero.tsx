
import React from 'react';
import { motion } from 'framer-motion';

interface DirectionHeroProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  accentColor: string;
}

const DirectionHero = ({ title, subtitle, description, image, accentColor }: DirectionHeroProps) => {
  return (
    <section className={`relative ${accentColor} pb-16 pt-32 overflow-hidden`}>
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <h4 className="text-gray-500 mb-2">{subtitle}</h4>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{title}</h1>
            <p className="text-gray-700 max-w-lg">{description}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img 
                src={image} 
                alt={title} 
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/defolt.png";
                }} 
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-white opacity-10"></div>
      <div className="absolute top-10 -left-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
    </section>
  );
};

export default DirectionHero;
