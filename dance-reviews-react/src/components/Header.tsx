import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, X, LogOut, UserCircle } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');

      if (token && userJson) {
        try {
          const userData = JSON.parse(userJson);
          setUser(userData);
          setIsLoggedIn(true);
          setUserRole(userData.role || 'user');
        } catch (e) {
          console.error('Error parsing user data:', e);
          resetAuthState();
        }
      } else {
        resetAuthState();
      }
    };

    const resetAuthState = () => {
      setUser(null);
      setIsLoggedIn(false);
      setUserRole('');
    };

    checkAuthStatus();

    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole('');
    setUser(null);
    window.location.href = '/';
  };

  const renderNavLinks = (isMobile = false) => {
    const linkClassName = isMobile
      ? "text-lg font-medium"
      : "text-sm font-medium opacity-80 hover:opacity-100 transition-opacity";

    const activeLinkClassName = isMobile
      ? ""
      : "opacity-100";

    return (
      <>
        {(!isLoggedIn || userRole === 'user' || userRole === 'teacher') && (
          <>
            <Link
              to="/"
              onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
              className={`${linkClassName} ${location.pathname === '/' ? activeLinkClassName : ''}`}
            >
              Главная
            </Link>
            <Link
              to="/directions"
              onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
              className={`${linkClassName} ${location.pathname === '/directions' ? activeLinkClassName : ''}`}
            >
              Направления
            </Link>
            <Link
              to="/contacts"
              onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
              className={`${linkClassName} ${location.pathname === '/contacts' ? activeLinkClassName : ''}`}
            >
              Контакты
            </Link>
          </>
        )}

        {isLoggedIn && userRole === 'user' && (
          <Link
            to="/dashboard"
            onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
            className={`${linkClassName} ${location.pathname === '/dashboard' ? activeLinkClassName : ''}`}
          >
            Личный кабинет
          </Link>
        )}

        {isLoggedIn && userRole === 'teacher' && (
          <Link
            to="/teacher-dashboard"
            onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
            className={`${linkClassName} ${location.pathname === '/teacher-dashboard' ? activeLinkClassName : ''}`}
          >
            Личный кабинет преподавателя
          </Link>
        )}
      </>
    );
  };

  const renderAdminLinks = (isMobile = false) => {
    if (!isLoggedIn || userRole !== 'admin') return null;

    const linkClassName = isMobile
      ? "text-lg font-medium"
      : "text-sm font-medium opacity-80 hover:opacity-100 transition-opacity";

    const adminLinks = [
      { to: "/admin/users", label: "Пользователи" },
      { to: "/admin/directions", label: "Управление направлениями" },
      { to: "/admin/comments", label: "Отзывы" },
      { to: "/admin/schedule", label: "Расписание" },
      { to: "/admin/teachers", label: "Преподаватели" },
      { to: "/admin/instructor-stats", label: "Статистика преподавателей" }

    ];

    return (
      <>
        {isMobile && <hr className="border-gray-200" />}
        {isMobile && <div className="text-lg font-medium text-gray-500">Администрирование:</div>}

        {adminLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
            className={`${linkClassName} ${location.pathname === link.to ? 'opacity-100' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </>
    );
  };

  const renderMobileUserInfo = () => {
    if (!isLoggedIn) return null;

    return (
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-dance-light rounded-full flex items-center justify-center">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <UserCircle className="w-10 h-10 text-white" />
          )}
        </div>
        <div>
          <span className="text-base font-medium">{user?.full_name || 'Пользователь'}</span>
          <p className="text-sm text-gray-500">{userRole}</p>
        </div>
      </div>
    );
  };

  return (
    <header
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${scrolled
          ? 'py-3 bg-white/90 backdrop-blur-md shadow-sm'
          : 'py-4 bg-white/80'
        }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-serif tracking-wider">
            DanceStudio
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {renderNavLinks()}
            {renderAdminLinks()}
          </nav>

          <div className="flex items-center space-x-4">
            {/* {(!isLoggedIn || userRole === 'user' || userRole === 'teacher') && (
              <Search className="w-5 h-5 opacity-60 cursor-pointer hover:opacity-100 transition-opacity hidden md:block" />
            )} */}

            {isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-dance-light rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                  {userRole === 'user' && (
                    <Link
                      to="/dashboard"
                      className="text-sm font-medium max-w-[150px] truncate hover:underline"
                    >
                      {user?.full_name || 'Пользователь'}
                    </Link>
                  )}
                  {userRole === 'teacher' && (
                    <Link
                      to="/teacher-dashboard"
                      className="text-sm font-medium max-w-[150px] truncate hover:underline"
                    >
                      {user?.full_name || 'Преподаватель'}
                    </Link>
                  )}
                   {userRole === 'admin' && (
                    <Link
                      to="/admin/users"
                      className="text-sm font-medium max-w-[150px] truncate hover:underline"
                    >
                      { 'Админ'}
                    </Link>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm font-medium py-2 px-4 rounded border border-red-200 bg-red-100 hover:bg-red-200 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти</span>
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="text-sm font-medium py-2 px-4 rounded border border-dance bg-dance-light/50 hover:bg-dance-light transition-all hidden md:block"
              >
                Войти
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-dance-light/20 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
      >
        <div className="container-custom pt-24 pb-6">
          <nav className="flex flex-col space-y-6">
            {renderMobileUserInfo()}
            {renderNavLinks(true)}
            {renderAdminLinks(true)}

            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-red-500 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Выйти
              </button>
            ) : (
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-dance-dark"
              >
                Войти
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;