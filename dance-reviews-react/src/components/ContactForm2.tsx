import React, { useState } from 'react';
import { toast } from "sonner";
import { motion } from 'framer-motion';

const ContactForm2 = () => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get JWT token from localStorage
      const jwtToken = localStorage.getItem("token");
      
      if (!jwtToken) {
        // If token is missing, redirect to login page
        toast.error("Необходима авторизация для отправки отзыва");
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
        return;
      }
      
      // Make a real API call to your Laravel backend
      const response = await fetch('http://localhost:8080/api/admin/Addcomment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          contant: message,  // Match the field name expected by Laravel
          rating: rating
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при отправке отзыва');
      }
      
      const data = await response.json();
      
      // Success notification
      toast.success("Ваш отзыв успешно отправлен!");
      
      // Reset form
      setMessage('');
      setRating(0);
      
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Произошла ошибка при отправке отзыва");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2 mb-10 lg:mb-0"
          >
            <img
              src="/images/image-connect.png"
              alt="Танцоры"
              className="h-auto object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/600x800?text=Dance";
              }}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl mb-2">НАМ ВАЖНО ВАШЕ МНЕНИЕ</h2>
                <h2 className="text-2xl md:text-3xl mb-4">ОСТАВЬТЕ ОТЗЫВ</h2>
                <div className="w-24 h-[2px] bg-black mx-auto"></div>
              </div>
              
              <div className="mb-6">
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dance-light h-32 transition-all"
                  placeholder="Сообщение"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-6">
                <div className="rating-area w-[265px] mx-auto">
                  <input
                    type="radio"
                    id="star-5"
                    name="rating"
                    value="5"
                    onChange={() => setRating(5)}
                    checked={rating === 5}
                    required
                  />
                  <label htmlFor="star-5" title="Оценка «5»"></label>
                  
                  <input
                    type="radio"
                    id="star-4"
                    name="rating"
                    value="4"
                    onChange={() => setRating(4)}
                    checked={rating === 4}
                    required
                  />
                  <label htmlFor="star-4" title="Оценка «4»"></label>
                  
                  <input
                    type="radio"
                    id="star-3"
                    name="rating"
                    value="3"
                    onChange={() => setRating(3)}
                    checked={rating === 3}
                    required
                  />
                  <label htmlFor="star-3" title="Оценка «3»"></label>
                  
                  <input
                    type="radio"
                    id="star-2"
                    name="rating"
                    value="2"
                    onChange={() => setRating(2)}
                    checked={rating === 2}
                    required
                  />
                  <label htmlFor="star-2" title="Оценка «2»"></label>
                  
                  <input
                    type="radio"
                    id="star-1"
                    name="rating"
                    value="1"
                    onChange={() => setRating(1)}
                    checked={rating === 1}
                    required
                  />
                  <label htmlFor="star-1" title="Оценка «1»"></label>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="btn-primary w-full text-sm tracking-wider uppercase"
                disabled={loading}
              >
                {loading ? "ОТПРАВКА..." : "ОТПРАВИТЬ"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm2;