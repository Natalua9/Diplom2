import React, { useState } from 'react';
import { toast } from "sonner";
import { motion } from 'framer-motion';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Сообщение успешно отправлено!");
        setFormData({ name: '', email: '', message: '' }); // Сброс формы
      } else {
        throw new Error("Ошибка при отправке сообщения.");
      }
    } catch (error) {
      console.error("Ошибка отправки:", error);
      toast.error("Произошла ошибка при отправке сообщения.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl text-gray-300 font-serif mb-2">СВЯЖИТЕСЬ С НАМИ</h2>
        <h3 className="text-xl font-medium uppercase mb-4">МЫ РАДЫ ВАС СЛЫШАТЬ</h3>
        <div className="w-24 h-[2px] bg-black mx-auto"></div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Имя"
              className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-dance-light"
              required
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-dance-light"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Сообщение"
            className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-dance-light h-32"
            required
          ></textarea>
        </div>
        
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn-primary px-10 uppercase tracking-wider"
            disabled={loading}
          >
            {loading ? "Отправка..." : "Отправить"}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
