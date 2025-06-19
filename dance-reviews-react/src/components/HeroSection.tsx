import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверяем наличие токена при монтировании компонента
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <section className="pt-32 pb-16 md:py-36 overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            className="w-full md:w-1/2 text-center md:text-left mb-10 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-5xl font-serif mb-6">
              СДЕЛАЙ ИДЕАЛЬНОЕ ТАНЦЕВАЛЬНОЕ ДВИЖЕНИЕ
            </h1>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto md:mx-0">
              Откройте для себя мир танца, выразите себя через движение. 
              Наши профессиональные инструкторы помогут вам освоить различные танцевальные стили.
            </p>
            {!isAuthenticated && (
              <Link 
                to="/signin" 
                className="btn-primary inline-block"
              >
                Войти
              </Link>
            )}
          </motion.div>
          
          <motion.div 
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img 
              src="/public/images/images-balet.png" 
              alt="Танцор" 
              className="w-full max-w-md mx-auto md:mx-0 md:ml-auto rounded-md shadow-lg"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;