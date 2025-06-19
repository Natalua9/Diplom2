
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg"
        >
          <h1 className="text-8xl font-serif text-dance mb-6">404</h1>
          <h2 className="text-3xl font-medium mb-4">Страница не найдена</h2>
          <p className="text-gray-600 mb-8">
            К сожалению, запрашиваемая вами страница не существует или была перемещена.
          </p>
          <Link 
            to="/"
            className="btn-primary inline-block"
          >
            Вернуться на главную
          </Link>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
