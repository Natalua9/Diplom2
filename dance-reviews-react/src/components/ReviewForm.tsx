import React, { useState } from 'react';
import { toast } from "sonner";
import { motion } from 'framer-motion';

interface ReviewFormProps {
  id_teacher: number;
  id_record_context?: number; // Опциональный контекст занятия
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ id_teacher, id_record_context, onReviewSubmitted }) => {
  const [contant, setContant] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

 // ... внутри ReviewForm.tsx ...

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!id_teacher) {
      toast.error("Ошибка: ID преподавателя не определен.");
      setLoading(false);
      return;
    }

    // Добавим проверку для id_record_context, если он обязателен
    if (id_record_context === undefined || id_record_context === null) {
        toast.error("Ошибка: ID занятия не определен для отзыва.");
        setLoading(false);
        return; // Прерываем, если id_record_context не предоставлен
    }

    if (rating === 0) {
      toast.error("Пожалуйста, поставьте оценку.");
      setLoading(false);
      return;
    }

    if (contant.trim() === '') {
      toast.error("Пожалуйста, напишите отзыв.");
      setLoading(false);
      return;
    }

    try {
      const jwtToken = localStorage.getItem("token");
      
      if (!jwtToken) {
        toast.error("Необходима авторизация для отправки отзыва");
        setLoading(false);
        return;
      }
      
      // ИСПРАВЛЕНО: Добавляем id_record_context как id_record
      const body = {
        contant: contant.trim(),
        rating: rating,
        id_teacher: id_teacher,
        id_record: id_record_context, // <--- ВОТ ИЗМЕНЕНИЕ
      };

      // Используем правильный эндпоинт - тот же, что в бэкенде
      // Убедитесь, что эндпоинт /api/admin/Addcomment ожидает те же поля
      const response = await fetch('http://localhost:8000/api/admin/Addcomment', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка при отправке отзыва' }));
        // Обработка ошибок валидации от Laravel
        if (response.status === 422 && errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat().join(' ');
            toast.error(`Ошибка валидации: ${errorMessages}`);
        } else {
            throw new Error(errorData.message || 'Ошибка при отправке отзыва');
        }
        return; // Прерываем выполнение, если была ошибка от сервера
      }
      
      const data = await response.json();
      
      toast.success(data.message || "Ваш отзыв о преподавателе успешно отправлен!");
      
      setContant('');
      setRating(0);
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Произошла ошибка при отправке отзыва");
    } finally {
      setLoading(false);
    }
  };


  const ratingInputName = `rating-teacher-${id_teacher}`;

  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-4">
          <h3 className="text-xl font-medium mb-2">ОСТАВЬТЕ ОТЗЫВ О ПРЕПОДАВАТЕЛЕ</h3>
          <div className="w-16 h-[2px] bg-dance-light mx-auto"></div>
        </div>
        
        <div className="mb-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dance-light h-24 transition-all"
            placeholder="Расскажите о ваших впечатлениях от работы с преподавателем"
            value={contant}
            onChange={(e) => setContant(e.target.value)}
            required
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 mt-1">
            {contant.length}/1000 символов
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Оценка преподавателя:
          </label>
          <div className="rating-area w-[185px] mx-auto">
            {[5, 4, 3, 2, 1].map((star) => (
              <React.Fragment key={star}>
                <input
                  type="radio"
                  id={`star-${star}-${ratingInputName}`}
                  name={ratingInputName}
                  value={star}
                  onChange={() => setRating(star)}
                  checked={rating === star}
                  required
                />
                <label htmlFor={`star-${star}-${ratingInputName}`} title={`Оценка «${star}»`}></label>
              </React.Fragment>
            ))}
          </div>
          {rating > 0 && (
            <div className="text-center text-sm text-gray-600 mt-2">
              Выбрана оценка: {rating} из 5
            </div>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="btn-primary w-full text-sm tracking-wider py-2 uppercase bg-dance-light hover:bg-dance text-black font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || rating === 0 || contant.trim() === ''}
        >
          {loading ? "ОТПРАВКА..." : "ОТПРАВИТЬ ОТЗЫВ"}
        </motion.button>
      </form>
    </div>
  );
};

export default ReviewForm;