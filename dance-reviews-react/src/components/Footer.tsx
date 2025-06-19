
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif mb-4">Танцевальная студия</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Мы помогаем людям всех возрастов раскрыть свой танцевальный потенциал. Присоединяйтесь к нам!
            </p>
            <div className="flex space-x-3">
              <a href="https://instagram.com" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-dance-light hover:text-black transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-dance-light hover:text-black transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-dance-light hover:text-black transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-serif mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">Главная</Link>
              </li>
              <li>
                <Link to="/directions" className="text-gray-400 hover:text-white transition-colors text-sm">Направления</Link>
              </li>
              {/* <li>
                <Link to="/schedule" className="text-gray-400 hover:text-white transition-colors text-sm">Расписание</Link>
              </li>
              <li>
                <Link to="/teachers" className="text-gray-400 hover:text-white transition-colors text-sm">Преподаватели</Link>
              </li> */}
              <li>
                <Link to="/contacts" className="text-gray-400 hover:text-white transition-colors text-sm">Контакты</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-serif mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 text-dance-light flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">г. Уфа, Ленина 5/1</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-dance-light flex-shrink-0" />
                <a href="tel:+74951234567" className="text-gray-400 hover:text-white transition-colors text-sm">+7 (495) 123-45-67</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-dance-light flex-shrink-0" />
                <a href="mailto:info@dancestudio.com" className="text-gray-400 hover:text-white transition-colors text-sm">info@dancestudio.com</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-serif mb-4">Часы работы</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">Пн-Пт: 9:00 - 22:00</li>
              <li className="text-gray-400 text-sm">Сб: 10:00 - 20:00</li>
              <li className="text-gray-400 text-sm">Вс: 10:00 - 18:00</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Танцевальная студия. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
