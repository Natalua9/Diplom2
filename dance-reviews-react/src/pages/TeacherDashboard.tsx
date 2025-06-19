import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Upload, Trash2, Check, X, Users, Clock } from "lucide-react"; // Добавлен Clock

// Интерфейсы для типизации данных
interface UserData {
  photo: string | null;
  full_name: string;
  direction_teacher: string;
  phone: string;
  email: string;
  age: string | null; // Может быть YYYY-MM-DD или null
}

interface RecordSlot {
  id: number; // timings.id
  time: string; // HH:mm:ss из timings
  time_record: string; // HH:mm (форматированное)
  date: string; // YYYY-MM-DD (конкретная дата слота)
  status: 'новая' | 'проведена' | 'отменена';
  direction_name: string;
  record_count: number;
  is_past: boolean; // Флаг, что слот (дата+время) в прошлом
}

interface GroupedRecords {
  [dayOfWeekIso: string]: RecordSlot[];
}

interface TeacherApiResponse {
  user_data: {
    id: number;
    full_name: string;
    photo: string | null;
    phone: string;
    email: string;
    age: string | null;
  };
  direction_teacher: string;
  records: GroupedRecords;
  dates: string[]; // Массив дат YYYY-MM-DD для отображения в шапке таблицы
  weekOffset: number;
}


const TeacherDashboard = () => {
  const [userData, setUserData] = useState<UserData>({
    photo: null,
    full_name: '',
    direction_teacher: '',
    phone: '',
    email: '',
    age: ''
  });

  const [weekOffset, setWeekOffset] = useState(0);
  const [datesForHeader, setDatesForHeader] = useState<Date[]>([]); // Даты для шапки таблицы (объекты Date)
  const [records, setRecords] = useState<GroupedRecords>({});
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());

  const getAuthToken = () => localStorage.getItem('token');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  const getPhotoUrl = (photoPath: string | null) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
    return `http://localhost:8000/${cleanPath}`;
  };

  const fetchTeacherData = async (currentOffset: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/teacher?week_offset=${currentOffset}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const data: TeacherApiResponse = await response.json();

      setUserData({
        photo: getPhotoUrl(data.user_data.photo),
        full_name: data.user_data.full_name,
        direction_teacher: data.direction_teacher,
        phone: data.user_data.phone,
        email: data.user_data.email,
        age: data.user_data.age // Уже YYYY-MM-DD или null
      });

      setPhotoTimestamp(Date.now());
      
      // Преобразуем строки дат из API (data.dates) в объекты Date для шапки таблицы
      setDatesForHeader(data.dates.map(dateStr => new Date(dateStr + 'T00:00:00'))); // Указываем время, чтобы избежать проблем с часовыми поясами при создании Date

      setRecords(data.records);
      setWeekOffset(data.weekOffset); // Обновляем weekOffset из ответа, если он там есть

    } catch (error: any) {
      console.error('Error fetching teacher data:', error);
      toast.error(error.message || "Не удалось загрузить данные преподавателя");
      if (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchTeacherData(weekOffset);
  }, [weekOffset]); // Зависимость только от weekOffset, т.к. fetchTeacherData сама его использует


  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('http://localhost:8000/api/add-photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}`, 'Accept': 'application/json' },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка загрузки фото' }));
        throw new Error(errorData.message || `Ошибка загрузки: ${response.statusText}`);
      }

      const data = await response.json();
      const formattedPhotoUrl = getPhotoUrl(data.photo);
      setUserData(prev => ({ ...prev, photo: formattedPhotoUrl }));
      setPhotoTimestamp(Date.now());
      toast.success("Фото успешно загружено");
    } catch (error: any) {
      console.error('Ошибка загрузки фото:', error);
      toast.error(error.message || "Ошибка при загрузке фото");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить фото?')) {
      try {
        const response = await fetch('http://localhost:8000/api/delete-photo', {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          setUserData(prev => ({ ...prev, photo: null }));
          setPhotoTimestamp(Date.now());
          toast.success("Фото удалено");
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Ошибка удаления фото' }));
          throw new Error(errorData.message || "Ошибка при удалении фото");
        }
      } catch (error: any) {
        console.error('Ошибка при удалении фото:', error);
        toast.error(error.message || "Ошибка при удалении фото");
      }
    }
  };

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/update_teacher_data', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          full_name: userData.full_name,
          phone: userData.phone,
          email: userData.email,
          age: userData.age // userData.age уже должен быть в формате YYYY-MM-DD или null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat() as string[];
          errorMessages.forEach(message => toast.error(message));
          throw new Error(errorMessages[0] || 'Ошибка валидации данных');
        }
        throw new Error(data.message || 'Ошибка обновления данных');
      }
      toast.success('Профиль успешно обновлен');
    } catch (error: any) {
      console.error('Ошибка обновления профиля:', error);
      // toast.error('Не удалось обновить данные: ' + error.message); // Уже обрабатывается выше
    }
  };

  const handleStatusUpdate = async (timingsId: number, newStatus: 'новая' | 'проведена' | 'отменена', slotDate: string) => {
    try {
      if (newStatus === 'отменена' && !window.confirm('Вы уверены, что хотите отменить это занятие? Статус будет изменен для всех записанных учеников.')) {
        return;
      }

      const response = await fetch(`http://localhost:8000/api/update-status-record-teacher`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: timingsId,
          status: newStatus,
          date: slotDate // Передаем дату слота
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при обновлении статуса');
      }

      if (data.success) {
        toast.success(data.message || `Статус занятия изменен. Обновлено записей: ${data.updated_count || 0}`);
        // Перезагружаем данные, чтобы получить актуальные статусы и флаг is_past
        fetchTeacherData(weekOffset); 
      } else {
        toast.error(data.message || "Ошибка при обновлении статуса");
      }
    } catch (error: any) {
      console.error('Error updating record status:', error);
      toast.error(`Ошибка: ${error.message}`);
    }
  };


  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-2xl text-dance">Загрузка...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-32 pb-16 min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <h1 className="text-3xl md:text-4xl font-serif tracking-wider text-center mb-10 text-dance-dark">
            ЛИЧНЫЙ КАБИНЕТ ПРЕПОДАВАТЕЛЯ
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-dance-light/30">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    {userData.photo ? (
                      <>
                        <Avatar className="w-40 h-40 border-2 border-dance">
                          <AvatarImage
                            src={`${userData.photo}?t=${photoTimestamp}`}
                            alt="Фото преподавателя"
                            onError={(e) => { e.currentTarget.src = "/images/defolt.png"; }}
                          />
                          <AvatarFallback className="text-lg bg-dance-light/20 text-dance-dark">
                            {userData.full_name.split(' ').map(name => name[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={handlePhotoDelete}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors shadow"
                          title="Удалить фото"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
                        <label className="cursor-pointer text-center p-4">
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Добавить фото</span>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                   {uploadingPhoto && <p className="text-sm text-dance">Загрузка фото...</p>}
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Имя</label>
                      <Input
                        value={userData.full_name}
                        onChange={(e) => setUserData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Ваше имя"
                        className="border-gray-300 focus:border-dance focus:ring-dance"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Направление</label>
                      <Input
                        value={userData.direction_teacher}
                        readOnly
                        className="bg-gray-100 border-gray-300 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Телефон</label>
                      <Input
                        value={userData.phone}
                        onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Ваш телефон"
                        className="border-gray-300 focus:border-dance focus:ring-dance"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Ваш email"
                        className="border-gray-300 focus:border-dance focus:ring-dance"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Дата рождения</label>
                      <Input
                        type="date"
                        value={userData.age || ''} // Если null, то пустая строка
                        readOnly
                        className="bg-gray-100 border-gray-300 cursor-not-allowed"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-dance hover:bg-dance-dark text-white mt-2 py-2.5"
                    >
                      Сохранить изменения
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-dance-light/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif text-dance-dark">МОИ ЗАНЯТИЯ</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setWeekOffset(prev => prev - 1)}
                      className="rounded-full border-dance text-dance hover:bg-dance-light/20"
                      title="Предыдущая неделя"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setWeekOffset(prev => prev + 1)}
                      className="rounded-full border-dance text-dance hover:bg-dance-light/20"
                      title="Следующая неделя"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr>
                        {datesForHeader.map((date, index) => (
                          <th
                            key={index}
                            className="border-b-2 border-dance-light py-3 px-1 text-center text-xs sm:text-sm uppercase text-gray-600 font-semibold"
                          >
                            <div className="capitalize">{format(date, 'EEEE', { locale: ru })}</div>
                            <div>{format(date, 'dd.MM')}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* 
                        Предполагаем, что бэкенд присылает слоты для каждого дня недели (ключ dayOfWeekIso), 
                        и они уже отсортированы по времени.
                        Мы не будем создавать строки для каждого часа, а будем рендерить слоты как есть.
                        Если для какого-то времени нет слота, эта ячейка будет "ниже".
                        Чтобы сделать "сетку по часам", нужна другая логика.
                        Текущая логика отображает слоты один под другим для каждого дня.
                        Для табличного вида по часам, нам нужно определить максимальное количество слотов в один день
                        и итерироваться столько раз, сколько строк нужно.
                      */}
                      {/* 
                        Для упрощения и соответствия вашему предыдущему UI, создадим "строки" на основе 
                        максимального количества слотов в любой из дней на текущей неделе.
                        Это не идеально, если слоты не выровнены по часам.
                      */}
                      {(() => {
                        let maxSlotsInDay = 0;
                        if (records && Object.keys(records).length > 0) {
                           Object.values(records).forEach(daySlots => {
                            if (daySlots.length > maxSlotsInDay) {
                              maxSlotsInDay = daySlots.length;
                            }
                          });
                        }
                        if (maxSlotsInDay === 0 && datesForHeader.length > 0) maxSlotsInDay = 1; // Хотя бы одна строка, если нет записей

                        return Array.from({ length: Math.max(maxSlotsInDay, 5) }, (_, rowIndex) => ( // Минимум 5 строк для вида
                          <tr key={rowIndex}>
                            {datesForHeader.map((dateCell, dayIndex) => {
                              const dayOfWeekIso = (dateCell.getDay() === 0 ? 7 : dateCell.getDay()).toString();
                              const daySlots = records[dayOfWeekIso] || [];
                              const record = daySlots[rowIndex]; // Берем слот для текущей "строки"

                              // Определяем, заблокирован ли слот для изменений
                              const isSlotLocked = record ? record.is_past && record.status !== 'новая' : false;
                              // Определяем, является ли слот будущим (для кнопки "Проведено")
                              // Если record.is_past уже учитывает время, то isFutureSlot = !record.is_past
                              // Если record.is_past - это только про день, нужна более точная проверка:
                              let isFutureSlot = false;
                              if (record) {
                                const [hours, minutes] = record.time.split(':').map(Number); // Используем record.time (HH:mm:ss)
                                const slotDateTime = new Date(dateCell);
                                slotDateTime.setHours(hours, minutes, 0, 0);
                                isFutureSlot = slotDateTime > new Date();
                              }


                              return (
                                <td
                                  key={`${rowIndex}-${dayIndex}`}
                                  className="border border-gray-200 h-36 sm:h-40 align-top overflow-hidden"
                                >
                                  <div className="px-1.5 py-1.5 h-full text-xs">
                                    {!record && (
                                      <div className="h-full w-full bg-gray-50/70 rounded-sm"></div>
                                    )}
                                    {record && (
                                      <div className={`h-full rounded-md p-2 flex flex-col justify-between shadow-sm border
                                        ${record.status === 'проведена' ? 'bg-green-50 border-green-300' :
                                          record.status === 'отменена' ? 'bg-red-50 border-red-300' :
                                          record.is_past ? 'bg-yellow-50 border-yellow-300' : // Прошедшие "новые"
                                            'bg-blue-50 border-blue-300' // Будущие "новые"
                                        }`}>
                                        <div>
                                          <div className={`font-bold text-sm mb-1 ${
                                            record.status === 'проведена' ? 'text-green-700' :
                                            record.status === 'отменена' ? 'text-red-700' :
                                            record.is_past ? 'text-yellow-700' :
                                            'text-blue-700'
                                          }`}>{record.time_record}</div>
                                          
                                          <div className="font-medium text-gray-800 mb-0.5 break-words">
                                            {record.direction_name}
                                          </div>
                                          <div className="text-gray-600 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> 1 час
                                          </div>

                                          <div className={`flex items-center justify-center gap-1 mt-2 text-xs rounded px-1.5 py-0.5
                                            ${record.record_count > 0
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            <Users className="w-3 h-3" />
                                            {record.record_count > 0
                                              ? <span>{record.record_count} чел.</span>
                                              : <span>нет записей</span>
                                            }
                                          </div>
                                        </div>

                                        {/* Кнопки управления статусом */}
                                        {record.record_count > 0 && ( // Кнопки только если есть записи студентов
                                          <div className="flex flex-col mt-2 space-y-1">
                                            <Button
                                              size="xs"
                                              onClick={() => handleStatusUpdate(record.id, 'проведена', record.date)}
                                              className={`
                                                ${record.status === 'проведена' ? 'bg-green-500 hover:bg-green-500 text-white' :
                                                  isFutureSlot || isSlotLocked ? 'bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed' :
                                                  'bg-green-400 hover:bg-green-500 text-white'}
                                              `}
                                              disabled={record.status === 'проведена' || isFutureSlot || isSlotLocked}
                                            >
                                              <Check className="w-3 h-3 mr-1" />Проведено
                                            </Button>

                                            <Button
                                              size="xs"
                                              variant="destructive"
                                              onClick={() => handleStatusUpdate(record.id, 'отменена', record.date)}
                                              className={`
                                                ${record.status === 'отменена' ? 'bg-red-500 hover:bg-red-500 opacity-70' : 
                                                  isSlotLocked ? 'bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300' :
                                                  'bg-red-400 hover:bg-red-500 border-red-400 hover:border-red-500'}
                                              `}
                                              disabled={record.status === 'отменена' || isSlotLocked}
                                            >
                                              <X className="w-3 h-3 mr-1" />Отменить
                                            </Button>

                                            {(record.status === 'проведена' || record.status === 'отменена') && (
                                              <Button
                                                size="xs"
                                                variant="outline"
                                                onClick={() => handleStatusUpdate(record.id, 'новая', record.date)}
                                                className={`${isSlotLocked ? 'bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300' : 
                                                              'border-gray-400 text-gray-600 hover:bg-gray-100'}`}
                                                disabled={isSlotLocked}
                                              >
                                                Сбросить
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                         {record.record_count === 0 && record.is_past && record.status === 'проведена' && (
                                            <div className="text-xs text-center mt-2 p-1 bg-green-100 text-green-600 rounded">
                                                Занятие прошло (пустое)
                                            </div>
                                        )}
                                        {record.record_count === 0 && !record.is_past && (
                                            <div className="text-xs text-center mt-2 p-1 bg-blue-100 text-blue-600 rounded">
                                                Ожидает записей
                                            </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
};

export default TeacherDashboard;