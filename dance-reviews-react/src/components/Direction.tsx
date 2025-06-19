
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const directionData = [
  {
    id: 1,
    title: 'Балет',
    image: '/images/landing-1-img-1.jpg.png',
    path: '/directions/ballet',
    slug: 'ballet'
  },
  {
    id: 2,
    title: 'Латиноамериканские танцы',
    image: '/images/image 14.png',
    path: '/directions/latin',
    slug: 'latin'
  },
  {
    id: 3,
    title: 'Современный танец',
    image: '/images/Link.png',
    path: '/directions/contemporary',
    slug: 'contemporary'
  },
  {
    id: 4,
    title: 'Детские танцы',
    image: '/images/landing-1-img-6.jpg.png',
    path: '/directions/kids',
    slug: 'kids'
  }
];

const Direction = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl text-gray-300 font-light text-center mb-16"
        >
          Направления
        </motion.h2>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto"
        >
          {directionData.map((direction) => (
            <motion.div 
              key={direction.id}
              variants={itemVariants}
              className="direction-item group"
            >
              <Link to={`/directions/${direction.slug}`} className="block">
                <div className="relative overflow-hidden">
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100 overflow-hidden">
                    <img 
                      src={direction.image} 
                      alt={direction.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x300?text=Dance";
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="mt-4 text-center transition-all duration-300 group-hover:translate-x-1">
                  <h3 className="text-xl md:text-2xl">{direction.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-12 text-center">
          <Link to="/directions" className="btn-primary inline-block rounded-md hover:bg-dance transition-colors">
            Все направления
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Direction;
