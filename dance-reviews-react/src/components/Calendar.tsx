import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Clock, Star } from 'lucide-react';
import { toast } from "sonner";
import axios from 'axios';

// Интерфейсы для данных
interface DateInfo {
  rawDate: string; // 'YYYY-MM-DD'
  dayName: string;
  formattedDate: string; // 'DD.MM'
  isoDayOfWeek: number; // 1 = Понедельник, ..., 7 = Воскресенье
}

interface ScheduleEvent {
  id: number;
  day_of_week: number;
  time: string; // 'HH:MM'
  direction_name: string;
  teacher_name: string;
  duration: string;
  actual_teacher_id: number;
  teacher_rating?: number | null;
}

interface Direction {
  id: number;
  name: string;
}

// Хелпер-функция для получения русского названия дня по isoDayOfWeek (1-7)
const getRussianDayNameByIso = (isoDay: number): string => {
  const isoMap = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  return (isoDay >= 1 && isoDay <= 7) ? isoMap[isoDay - 1] : 'День';
};

// Fallback data
const fallbackCalendarData = {
  directions: [
    { id: 1, name: 'Балет' }, { id: 2, name: 'Pole Dance' },
    { id: 3, name: 'Современный танец' }, { id: 4, name: 'Детские танцы' },
  ],
  dates: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
    .map((day, index) => {
      const d = new Date();
      const dayOffset = d.getDay(); // 0=Вс, 1=Пн ...
      const targetDay = index + 1; // 1=Пн ...
      d.setDate(d.getDate() - (dayOffset === 0 ? 6 : dayOffset - 1) + index);
      return {
        rawDate: d.toISOString().split('T')[0],
        dayName: day,
        formattedDate: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`,
        isoDayOfWeek: targetDay
      };
    }),
  events: [
    { id: 101, day_of_week: 1, time: '10:00', direction_name: 'Балет', teacher_name: 'Анна И.', duration: '1 час', actual_teacher_id: 1, teacher_rating: 4.5 },
    { id: 102, day_of_week: 1, time: '17:00', direction_name: 'Детские танцы', teacher_name: 'Мария С.', duration: '1 час', actual_teacher_id: 2, teacher_rating: 5.0 },
    { id: 103, day_of_week: 2, time: '11:00', direction_name: 'Современный танец', teacher_name: 'Олег Д.', duration: '1 час', actual_teacher_id: 3 },
    { id: 104, day_of_week: 3, time: '19:00', direction_name: 'Pole Dance', teacher_name: 'Елена В.', duration: '1 час', actual_teacher_id: 4, teacher_rating: 4.0 },
  ]
};

const Calendar = () => {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [currentWeek, setCurrentWeek] = useState(0);

  const [dates, setDates] = useState<DateInfo[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registeringEventId, setRegisteringEventId] = useState<number | null>(null);

  // Функция для проверки, прошла ли дата (сравниваем только день, без времени)
  const isDateInPast = useCallback((dateString: string): boolean => {
    if (!dateString) return false;
    // Создаем дату из строки 'YYYY-MM-DD'. JavaScript Date парсит это как UTC,
    // если не указать время. Чтобы избежать проблем с часовыми поясами при сравнении "только даты",
    // лучше создать дату, явно указав полночь по местному времени.
    const [year, month, day] = dateString.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day); // month is 0-indexed

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Текущая дата, начало дня (полночь по местному времени)

    return eventDate < today;
  }, []);


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:8000/api", {
        params: { week_offset: currentWeek },
        headers: { "Accept": "application/json", "Content-Type": "application/json" }
      });

      const data = response.data;

      if (data.dates && Array.isArray(data.dates) && data.dates.every((d: any) => typeof d.isoDayOfWeek === 'number') &&
        Array.isArray(data.schedule) && data.directions &&
        (data.schedule.length === 0 || (data.schedule.length > 0 && typeof data.schedule[0].day_of_week === 'number'))) {

        const processedDates = data.dates.map((apiDate: any) => ({
          ...apiDate,
          dayName: getRussianDayNameByIso(apiDate.isoDayOfWeek)
        }));

        setDates(processedDates);
        setSchedule(data.schedule);
        // Убедимся, что directions это массив объектов, а не строк
        if (data.directions.length > 0 && typeof data.directions[0] === 'string') {
            setDirections(data.directions.map((name: string, index: number) => ({ id: index + 1, name })));
        } else {
            setDirections(data.directions);
        }
      } else {
        console.warn("API returned unexpected data format, using fallback data");
        throw new Error("API returned unexpected data format");
      }
    } catch (err) {
      console.error("Error loading calendar data:", err);
      setError("Не удалось загрузить данные календаря. Отображается расписание по умолчанию.");
      setDates(fallbackCalendarData.dates);
      setDirections(fallbackCalendarData.directions);
      setSchedule(fallbackCalendarData.events.map(event => ({
        ...event,
        actual_teacher_id: event.actual_teacher_id || 0, 
        teacher_rating: event.teacher_rating !== undefined ? event.teacher_rating : null
      })));
    } finally {
      setLoading(false);
    }
  }, [currentWeek]); // fetchData зависит от currentWeek

  useEffect(() => {
    fetchData();
  }, [fetchData]); // useEffect зависит от мемоизированной fetchData

  const registerForClass = async (eventId: number, classDate: string) => {
    // Дополнительная проверка на фронтенде, хотя основная на бэкенде
    if (isDateInPast(classDate)) {
        toast.error("Нельзя записаться на занятие, дата которого уже прошла.");
        return;
    }

    setRegisteringEventId(eventId);
    try {
      const jwtToken = localStorage.getItem("token");
      if (!jwtToken) {
        toast.error("Для записи на занятие необходимо войти в систему.");
        setRegisteringEventId(null);
        return;
      }
      const response = await axios.post(
        `http://localhost:8000/api/record`,
        { id_td: eventId, class_date: classDate },
        { headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${jwtToken}` } }
      );
      toast.success(response.data.message || "Вы успешно записались на занятие!");
    } catch (err: any) {
      console.error("Registration error:", err);
      let errorMessage = "Произошла ошибка при записи на занятие.";
      if (err.response) {
        if (err.response.status === 401) errorMessage = "Ошибка авторизации. Пожалуйста, войдите заново.";
        else if (err.response.status === 429) errorMessage = "Слишком много запросов. Попробуйте позже.";
        // Это должно поймать вашу ошибку с бэкенда: "Нельзя записаться на занятие, дата которого уже прошла."
        else if (err.response.data?.error) errorMessage = err.response.data.error; 
        else if (err.response.data?.message) errorMessage = err.response.data.message; // На случай если ошибка в поле message
        else if (err.response.data?.errors) { // Для ошибок валидации Laravel
            const firstErrorKey = Object.keys(err.response.data.errors)[0];
            if (firstErrorKey && err.response.data.errors[firstErrorKey][0]) {
                 errorMessage = err.response.data.errors[firstErrorKey][0];
            }
        }
      }
      toast.error(errorMessage);
    } finally {
      setRegisteringEventId(null);
    }
  };

  const filteredSchedule = activeCategory === 'Все'
    ? schedule
    : schedule.filter(event => event.direction_name === activeCategory);

  const getEventForCell = (dateCell: DateInfo, rowIndex: number): ScheduleEvent | null => {
    const eventsForDayOfWeek = filteredSchedule.filter(
      event => event.day_of_week === dateCell.isoDayOfWeek
    );
    eventsForDayOfWeek.sort((a, b) => a.time.localeCompare(b.time));
    return eventsForDayOfWeek[rowIndex] || null;
  };

  const numRowsToDisplay = 4;

  return (
    <section className="py-16">
      <div className="container-custom">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl text-gray-300 font-light text-center mb-16"
        >
          Расписание занятий
        </motion.h2>

        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <button
              className={`px-4 py-2 rounded-full text-sm transition-all ${activeCategory === 'Все'
                ? 'bg-dance text-black font-medium'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              onClick={() => setActiveCategory('Все')}
            >
              Все направления
            </button>
            {directions.map((direction) => (
              <button
                key={direction.id}
                className={`px-4 py-2 rounded-full text-sm transition-all ${activeCategory === direction.name
                  ? 'bg-dance text-black font-medium'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                onClick={() => setActiveCategory(direction.name)}
              >
                {direction.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Ошибка! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-dance" />
            <span className="ml-2 text-gray-600">Загрузка расписания...</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="overflow-x-auto pb-4"
          >
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {dates?.length > 0 && dates.map((date) => (
                    <th
                      key={date.rawDate}
                      className="py-4 px-2 text-center text-sm font-medium text-gray-600 border-b border-gray-200 whitespace-nowrap" // Added whitespace-nowrap
                    >
                      <div className="font-medium capitalize">{date.dayName}</div>
                      <div className="text-gray-500">{date.formattedDate}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: numRowsToDisplay }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {dates?.length > 0 && dates.map((dateCell) => {
                      const event = getEventForCell(dateCell, rowIndex);
                      const isPast = event ? isDateInPast(dateCell.rawDate) : false;

                      return (
                        <td key={`${dateCell.rawDate}-${rowIndex}`}
                          className="border border-gray-100 p-2 align-top min-w-[160px] h-40"> {/* Немного увеличены размеры */}
                          <div className="h-full">
                            {event ? (
                              <div className={`p-2.5 text-xs rounded flex flex-col h-full ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-dance-light/40'}`}>
                                <div className={`font-semibold ${isPast ? 'text-gray-600' : 'text-black'}`}>{event.time}</div>
                                <div className={isPast ? 'text-gray-600' : 'text-gray-800'}>{event.direction_name}</div>
                                <div className={`flex items-center ${isPast ? 'text-gray-500' : 'text-gray-600'}`}>
                                  <span>{event.teacher_name}</span>
                                  {event.teacher_rating !== null && event.teacher_rating !== undefined && (
                                    <span className={`ml-1.5 inline-flex items-center text-xs ${isPast ? 'text-yellow-600' : 'text-yellow-500'}`} title={`Рейтинг: ${event.teacher_rating.toFixed(1)} из 5`}>
                                      <Star className={`w-3 h-3 mr-0.5 ${isPast ? 'fill-yellow-500 text-yellow-600' : 'fill-yellow-400 text-yellow-500'}`} />
                                      {event.teacher_rating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                                <div className={`flex items-center mt-1 ${isPast ? 'text-gray-500' : 'text-gray-600'}`}>
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{event.duration || "1 час"}</span>
                                </div>
                                <button
                                  onClick={() => registerForClass(event.id, dateCell.rawDate)}
                                  disabled={isPast || registeringEventId === event.id}
                                  className={`
                                    mt-auto px-3 py-1.5 text-xs font-medium rounded transition-all w-full
                                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                                    ${isPast
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-dance hover:bg-dance-dark text-black focus:ring-dance-dark'
                                    }
                                    ${registeringEventId === event.id ? 'opacity-70 cursor-wait' : ''}
                                  `}
                                >
                                  {registeringEventId === event.id ? (
                                    <span className="flex items-center justify-center">
                                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                      Запись...
                                    </span>
                                  ) : isPast ? "Дата прошла" : "Записаться"}
                                </button>
                              </div>
                            ) : (
                              rowIndex === 0 && <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">Свободно</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentWeek(prev => prev - 1)}
            disabled={loading}
          >
            <ChevronLeft className="w-4 h-4" />
            Предыдущая неделя
          </button>
          <button
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentWeek(prev => prev + 1)}
            disabled={loading}
          >
            Следующая неделя
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Calendar;