import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Mail, Lock, User, Phone, Calendar, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SignUp = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: '',
    age: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Функция для перевода сообщений об ошибках на русский
  const translateErrorMessage = (field, message) => {
    // Словарь перевода полей
    const fieldTranslations = {
      'full_name': 'ФИО',
      'email': 'Email',
      'phone': 'Телефон',
      'age': 'Дата рождения',
      'password': 'Пароль',
      'gender': 'Пол'
    };
    
    // Словарь перевода типичных ошибок
    const errorPatterns = {
      'The full_name field is required': 'Поле ФИО обязательно для заполнения',
      'The full_name must be a string': 'ФИО должно быть строкой',
      'The full_name must not be greater than 255 characters': 'ФИО не должно превышать 255 символов',
      
      'The email field is required': 'Поле Email обязательно для заполнения',
      'The email must be a valid email address': 'Указан некорректный Email адрес',
      'The email has already been taken': 'Данный Email уже зарегистрирован в системе',
      
      'The phone field is required': 'Поле Телефон обязательно для заполнения',
      'The phone must be between 10 and 11 digits': 'Номер телефона должен содержать от 10 до 11 цифр',
      
      'The age field is required': 'Поле даты рождения обязательно для заполнения',
      'The age is not a valid date': 'Указан некорректный формат даты',
      'The age must be a date before today': 'Дата рождения должна быть раньше текущей даты',
      
      'The password field is required': 'Поле Пароль обязательно для заполнения',
      'The password must be at least 6 characters': 'Пароль должен содержать минимум 6 символов',
      
      'The gender field is required': 'Пожалуйста, выберите пол'
    };

    // Проверяем, есть ли точное совпадение в словаре
    if (errorPatterns[message]) {
      return errorPatterns[message];
    }
    
    // Если точного совпадения нет, пробуем составить сообщение из шаблонных частей
    if (message.includes('field is required')) {
      return `Поле ${fieldTranslations[field] || field} обязательно для заполнения`;
    }
    
    if (message.includes('must be a valid email')) {
      return 'Указан некорректный Email адрес';
    }
    
    if (message.includes('has already been taken')) {
      return `${fieldTranslations[field] || field} уже используется`;
    }
    
    if (message.includes('must be at least')) {
      const minLength = message.match(/\d+/);
      return `${fieldTranslations[field] || field} должен содержать минимум ${minLength ? minLength[0] : '6'} символов`;
    }
    
    if (message.includes('digits')) {
      return `${fieldTranslations[field] || field} должен содержать только цифры`;
    }
    
    if (message.includes('digits_between')) {
      return `${fieldTranslations[field] || field} должен содержать от 10 до 11 цифр`;
    }
    
    if (message.includes('before')) {
      return `${fieldTranslations[field] || field} должна быть раньше текущей даты`;
    }

    // Если не нашли подходящего перевода, возвращаем оригинальное сообщение, 
    // но подставляем переведенное название поля
    const translatedField = fieldTranslations[field] || field;
    return message.replace(field, translatedField);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("Отправляемые данные:", formData);

    try {
      const response = await axios.post("http://localhost:8000/api/signup", formData);
      console.log("Ответ сервера:", response.data);
      
      toast.success("Регистрация успешна! Теперь вы можете войти в систему.");
      navigate('/signin');
    } catch (error) {
      console.error("Ошибка при регистрации:", error.response?.data);
      
      // Обработка ошибок валидации (422)
      if (error.response && error.response.status === 422 && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        
        // Собираем все ошибки в одну строку
        let errorMessage = "Пожалуйста, исправьте следующие ошибки:\n";
        
        for (const field in validationErrors) {
          if (validationErrors[field] && validationErrors[field].length > 0) {
            for (let i = 0; i < validationErrors[field].length; i++) {
              // Переводим каждое сообщение об ошибке на русский
              const translatedMessage = translateErrorMessage(field, validationErrors[field][i]);
              errorMessage += `• ${translatedMessage}\n`;
            }
          }
        }
        
        toast.error(errorMessage);
      } else {
        // Общая ошибка
        const errorMsg = error.response?.data?.error || "Произошла ошибка при регистрации";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
    >
      <Header />
      <main className="py-12 min-h-[80vh] bg-gray-50 flex-grow">
        <div className="container-custom max-w-md mx-auto py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif uppercase mb-2">Регистрация</h1>
          </div>
          
          <div className="bg-white p-8 rounded-sm shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="ФИО"
                    className="w-full border border-gray-200 p-3 pl-12 rounded-sm focus:outline-none focus:ring-1 focus:ring-dance"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Телефон"
                    className="w-full border border-gray-200 p-3 pl-12 rounded-sm focus:outline-none focus:ring-1 focus:ring-dance"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full border border-gray-200 p-3 pl-12 rounded-sm focus:outline-none focus:ring-1 focus:ring-dance"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <div className="w-full border border-gray-200 p-3 pl-12 rounded-sm flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="женщина"
                        onChange={handleChange}
                        required
                        className="mr-2"
                      />
                      <span>Женщина</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="мужчина"
                        onChange={handleChange}
                        required
                        className="mr-2"
                      />
                      <span>Мужчина</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full border border-gray-200 p-3 pl-12 rounded-sm focus:outline-none focus:ring-1 focus:ring-dance"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Пароль"
                    className="w-full border border-gray-200 p-3 pl-12 rounded-sm focus:outline-none focus:ring-1 focus:ring-dance"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-[#FDD8D6] hover:bg-[#adadad] text-black font-medium transition-colors ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'РЕГИСТРАЦИЯ...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Уже есть аккаунт? <Link to="/signin" className="text-[#f8c7c7] hover:text-[#C8C8C8] transition-all">Войти</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default SignUp;