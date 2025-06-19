import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Teacher {
  id: number;
  full_name: string;
  role: string;
  photo: string;
}

const getPhotoUrl = (photoPath: string | null) => {
  if (!photoPath) return null;

  // Если это полный URL, возвращаем как есть
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }

  // Удаляем ведущий слэш, если присутствует
  const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;

  // Формируем полный URL
  return `http://localhost:8000/${cleanPath}`;
};

const DirectionTeam = ({ direction }: { direction: string }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8000/api/teachers', {
          params: { direction }
        });
        
        // Process photos using getPhotoUrl
        const processedTeachers = response.data.map((teacher: Teacher) => ({
          ...teacher,
          photo: getPhotoUrl(teacher.photo)
        }));
        
        setTeachers(processedTeachers);
        setIsLoading(false);
      } catch (err) {
        setError('Не удалось загрузить преподавателей');
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, [direction]);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 text-center">
        <p>Загрузка преподавателей...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50 text-center">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold uppercase mb-2">
            Познакомьтесь с нашей командой
          </h2>
          <div className="mx-auto w-20 h-1 bg-dance mb-4"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
        >
          {teachers.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              className="text-center"
            >
              <div className="rounded-full overflow-hidden mx-auto mb-4 w-40 h-40">
                <img
                  src={member.photo || "/images/defolt.png"}
                  alt={member.full_name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = "/images/defolt.png";
                  }}
                />
              </div>
              <h3 className="text-lg font-semibold">{member.full_name}</h3>
              <p className="text-gray-500">Хореограф</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DirectionTeam;