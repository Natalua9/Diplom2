
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; 

// Интерфейсы для данных от API
interface UserInfo {
  id: number;
  full_name: string;
  photo?: string; // Фотография пользователя/преподавателя
}

interface ReviewData {
  id: number;
  contant: string; 
  rating: number;
  user?: UserInfo;    // Автор комментария (клиент)
  teacher?: UserInfo; // Преподаватель, к которому относится отзыв
 
}

const fallbackReviews: ReviewData[] = [
  {
    id: 1,
    contant: "Студия помогла мне раскрыть свой танцевальный потенциал. Профессиональные преподаватели и отличная атмосфера!",
    user: { id: 101, full_name: "Анна К." },
    teacher: { id: 201, full_name: "Екатерина Смирнова" },
    rating: 5
  },
  {
    id: 2,
    contant: "Занимаюсь балетом уже год. Результаты превзошли все ожидания. Рекомендую всем, кто хочет научиться танцевать!",
    user: { id: 102, full_name: "Сергей М." },
    teacher: { id: 202, full_name: "Иван Петров" },
    rating: 5
  },
  {
    id: 3,
    contant: "Прекрасный зал, внимательные преподаватели. Мой ребенок в восторге от занятий детскими танцами.",
    user: { id: 103, full_name: "Ольга П." },
    // Преподаватель может отсутствовать, если отзыв общий
    rating: 4
  },
  {
    id: 4,
    contant: "Отличный выбор направлений, каждый найдет что-то для себя. Дружелюбный персонал.",
    user: { id: 104, full_name: "Дмитрий В." },
    rating: 5
  }
];

const ReviewsBlock = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:8000/api/');
        
        if (response.data && Array.isArray(response.data.comments)) {
          setReviews(response.data.comments);
        } else {
          console.warn("API did not return 'comments' array, using fallback.");
          setReviews(fallbackReviews); 
        }
      } catch (err: any) {
        console.error("Error loading reviews:", err);
        setError("Не удалось загрузить отзывы. Отображаются примеры.");
        setReviews(fallbackReviews);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isAutoplay && reviews.length > 0) {
      intervalId = setInterval(() => {
        setCurrentReviewIndex(prev => (prev + 1) % reviews.length);
      }, 7000); // Увеличила интервал для лучшего восприятия
    }
    return () => clearInterval(intervalId);
  }, [isAutoplay, reviews.length]);

  const handlePrevReview = () => {
    if (reviews.length === 0) return;
    setIsAutoplay(false);
    setCurrentReviewIndex(prev => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNextReview = () => {
    if (reviews.length === 0) return;
    setIsAutoplay(false);
    setCurrentReviewIndex(prev => (prev + 1) % reviews.length);
  };

  const goToReview = (index: number) => {
    setIsAutoplay(false);
    setCurrentReviewIndex(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'fill-yellow-400 text-yellow-500' : 'fill-gray-300/50 text-gray-400/50'}`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-20 bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(/images/Image.png)' }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-light mb-12 text-white/90">Отзывы</h2>
          <p>Загрузка отзывов...</p>
        </div>
      </section>
    );
  }
  
  if (error && reviews.length === 0) { // Показываем ошибку только если нет fallback данных
     return (
      <section className="py-20 bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(/images/Image.png)' }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-light mb-12 text-white/90">Отзывы</h2>
          <p className="text-red-400">{error}</p>
          <p className="mt-2 text-sm">Не удалось связаться с сервером. Попробуйте обновить страницу позже.</p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-20 bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(/images/Image.png)' }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-light mb-12 text-white/90">Отзывы</h2>
          <p>Пока нет отзывов. Будьте первым!</p>
        </div>
      </section>
    );
  }

  const currentReviewData = reviews[currentReviewIndex];

  return (
    <section className="py-16 md:py-20 relative bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(/images/Image.png)' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div> {/* Усилено затемнение и добавлен блюр для читаемости */}
      
      <div className="container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-10 md:mb-16 text-white/90 tracking-tight">
            Что говорят наши ученики
          </h2>
          
          {/* Сообщение об ошибке, если отзывы fallback */}
          {error && reviews === fallbackReviews && (
            <div className="mb-6 text-sm text-yellow-300 bg-yellow-800/30 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="relative px-8 sm:px-12"> {/* Отступы для кнопок */}
            <button 
              onClick={handlePrevReview}
              className="absolute left-0 top-1/2 -translate-y-1/2 transform w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Предыдущий отзыв"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            <div className="min-h-[220px] md:min-h-[250px] flex items-center justify-center overflow-hidden"> {/* overflow-hidden для AnimatePresence */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentReviewIndex} // Ключ по индексу для корректной анимации
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="text-center w-full px-2" // px-2 чтобы текст не прилипал к краям при очень узком экране
                >
                  <div className="mb-4 flex justify-center space-x-1">
                    {renderStars(currentReviewData.rating)}
                  </div>
                  <p className="text-lg md:text-xl mb-5 italic leading-relaxed text-white/95">
                    "{currentReviewData.contant}"
                  </p>
                  <div className="text-sm text-white/80">
                    <p className="font-medium">
                      {currentReviewData.user?.full_name || 'Анонимный ученик'}
                    </p>
                    {currentReviewData.teacher?.full_name && (
                      <p className="mt-1 text-xs opacity-90">
                        Отзыв о преподавателе: <span className="font-semibold">{currentReviewData.teacher.full_name}</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <button 
              onClick={handleNextReview}
              className="absolute right-0 top-1/2 -translate-y-1/2 transform w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Следующий отзыв"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          
          {reviews.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2.5">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToReview(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ease-out focus:outline-none
                    ${index === currentReviewIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60 w-2.5'}`}
                  aria-label={`Перейти к отзыву ${index + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsBlock;
