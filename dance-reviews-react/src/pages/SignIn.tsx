import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Используем относительный путь вместо полного URL
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка авторизации');
      }
      
      // Сохраняем токен и другие данные
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Важно: Сохраняем роль отдельно для легкого доступа в Header
      localStorage.setItem('role', data.user.role);
      
      toast({
        title: "Успешный вход",
        description: "Вы успешно вошли в систему"
      });
      
      // Редирект в зависимости от роли
      if (data.user.role === "admin") {
        navigate("/admin/users");
      } else if (data.user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      toast({
        title: "Ошибка входа",
        description: error.message || "Неверный email или пароль",
        variant: "destructive"
      });
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
            <h1 className="text-3xl font-serif uppercase mb-2">Авторизация</h1>
          </div>
          
          <div className="bg-white p-8 rounded-sm shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {loading ? 'ВХОД...' : 'ВОЙТИ'}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Нет аккаунта? <Link to="/signup" className="text-[#f8c7c7] hover:text-[#C8C8C8] transition-all">Зарегистрируйтесь</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default SignIn;