
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Direction from '@/components/Direction';
import Calendar from '@/components/Calendar';
import ReviewsBlock from '@/components/ReviewsBlock';
import ContactForm2 from '@/components/ContactForm2';
import Footer from '@/components/Footer';

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <main>
        <HeroSection />
        <Direction />
        <Calendar />
        <ReviewsBlock />
        {/* <ContactForm2 /> */}
      </main>
      <Footer />
    </motion.div>
  );
};

export default Index;
