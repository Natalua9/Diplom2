
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { MapPin, Mail, Phone } from 'lucide-react';

// We'll use react-leaflet for the map
const Contact = () => {
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
      <main className="flex-grow pt-20">
        <div className="py-6 bg-gray-50">
          <div className="container-custom">
            <h1 className="text-2xl font-serif uppercase">КОНТАКТЫ</h1>
          </div>
        </div>

        <section className="py-12">
          <div className="container-custom">
            <ContactForm />
          </div>
        </section>

        <section className="py-8">
          <div className="container-custom">
            {/* Map will be loaded in an iframe for simplicity */}
            <div className="w-full h-[400px] mb-10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2381.7399809672813!2d55.97031731574236!3d54.73802688029123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x43d93a1c81463437%3A0x9c7f4e00495cf71c!2z0YPQuy4g0JvQtdC90LjQvdCwLCA1LzEsINCj0YTQsCwg0KDQtdGB0L8uINCR0LDRiNC60L7RgNGC0L7RgdGC0LDQvSwgNDUwMDA4!5e0!3m2!1sru!2sru!4v1580131158018!5m2!1sru!2sru"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              <div className="flex flex-col space-y-2">
                <h3 className="text-xl font-serif mb-2">КОНТАКТЫ</h3>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Phone size={18} className="text-dance-light" />
                  <span>+7 987 628 6232</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Mail size={18} className="text-dance-light" />
                  <span>dance@mail.ru</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <h3 className="text-xl font-serif mb-2">АДРЕС</h3>
                <div className="flex items-center space-x-2 text-gray-700">
                  <MapPin size={18} className="text-dance-light" />
                  <span>г. Уфа, Ленина 5/1</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Contact;
