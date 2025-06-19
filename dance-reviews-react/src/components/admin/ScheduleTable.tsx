import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Timing } from './AdminSchedule'; // Предполагается, что Timing здесь определен

// Интерфейс DateInfo остается тем же
interface DateInfo {
  rawDate: string;
  dayName: string;         // Это поле будет содержать русское название дня
  formattedDate: string;
  isoDayOfWeek: number;    // 1 = Понедельник, ..., 7 = Воскресенье
}

interface ScheduleTableProps {
  weekDates: DateInfo[];   // Массив с информацией о днях недели
  timings: Timing[];
  onDeleteTiming: (id: number) => void;
  onAddTiming: (date: string) => void;
  selectedDirectionId: number | 'all';
}

// Хелпер-функция для получения русского названия дня по isoDayOfWeek (1-7)
// Эту функцию можно вынести в отдельный утилитный файл, если она используется в нескольких местах
const getRussianDayNameByIso = (isoDay: number): string => {
  const isoMap = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье'
  ];
  if (isoDay >= 1 && isoDay <= 7) {
    return isoMap[isoDay - 1];
  }
  console.warn(`Получен некорректный isoDayOfWeek: ${isoDay} для ScheduleTable.`);
  return 'День'; // Резервное значение на случай некорректного isoDay
};

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  weekDates: initialWeekDates, // Переименовываем входящий проп для ясности
  timings,
  onDeleteTiming,
  onAddTiming,
  selectedDirectionId,
}) => {

  // Обрабатываем weekDates, чтобы гарантировать русские названия дней недели
  // Это создаст новый массив, не изменяя оригинальный проп, если он используется где-то еще.
  const weekDates = initialWeekDates.map(dateInfo => ({
    ...dateInfo, // Копируем все существующие поля
    dayName: getRussianDayNameByIso(dateInfo.isoDayOfWeek) // Перезаписываем dayName русским значением
  }));

  // Функция для проверки, соответствует ли занятие выбранному фильтру направления
  const checkDirectionFilter = (timing: Timing): boolean => {
    if (selectedDirectionId === 'all') {
      return true;
    }
    if (typeof selectedDirectionId === 'number') {
      // Для отладки, можно убрать в продакшене
      // console.log(
      //   `Фильтр ID: ${selectedDirectionId}, Занятие ID: ${timing.id}, ` +
      //   `timing.direction_id: ${timing.direction_id} (тип: ${typeof timing.direction_id}), ` +
      //   `selectedDirectionId: ${selectedDirectionId} (тип: ${typeof selectedDirectionId})`
      // );
      return typeof timing.direction_id === 'number' && timing.direction_id === selectedDirectionId;
    }
    // Если selectedDirectionId это NaN или что-то неожиданное (не 'all' и не число)
    if (isNaN(selectedDirectionId as number) && selectedDirectionId !== 'all') {
      return true; // Обработка NaN как "показать все"
    }
    return false;
  };

  // Функция для фильтрации и получения конкретного события для ячейки
  const getEventForCell = (dayIso: number, rowIndex: number): Timing | null => {
    const filteredEvents = timings.filter(timing => {
      const isCorrectDay = timing.day_of_week === dayIso;
      const isCorrectDirection = checkDirectionFilter(timing);
      return isCorrectDay && isCorrectDirection;
    });

    filteredEvents.sort((a, b) => a.time.localeCompare(b.time));
    return filteredEvents[rowIndex] || null;
  };

  // Определяем максимальное количество строк для отображения
  let maxEventsInAnyCell = 0;
  if (weekDates.length > 0) {
    weekDates.forEach(dateInfo => {
      const eventsInThisCellCount = timings.filter(t => {
        const isCorrectDay = t.day_of_week === dateInfo.isoDayOfWeek;
        const isCorrectDirection = checkDirectionFilter(t);
        return isCorrectDay && isCorrectDirection;
      }).length;
      
      if (eventsInThisCellCount > maxEventsInAnyCell) {
        maxEventsInAnyCell = eventsInThisCellCount;
      }
    });
  }
  // Отображаем как минимум 1 строку, и добавляем 1 строку для кнопки "Добавить", если есть события
  const numRows = Math.max(1, maxEventsInAnyCell + (maxEventsInAnyCell > 0 ? 1 : 0) );


  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {/* Используем обработанный weekDates с русскими названиями */}
            {weekDates.map(dateInfo => (
              <th
                key={dateInfo.rawDate}
                className="p-3 text-center border bg-gray-50 min-w-[170px]"
              >
                {/* dateInfo.dayName теперь всегда будет на русском */}
                <div className="font-medium capitalize">{dateInfo.dayName}</div>
                <div className="text-gray-500">{dateInfo.formattedDate}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: numRows }).map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {weekDates.map(dateInfo => {
                const event = getEventForCell(dateInfo.isoDayOfWeek, rowIndex);
                
                const totalEventsInThisColumnFiltered = timings.filter(t => {
                    const isCorrectDay = t.day_of_week === dateInfo.isoDayOfWeek;
                    const isCorrectDirection = checkDirectionFilter(t); // Учитываем фильтр по направлению
                    return isCorrectDay && isCorrectDirection;
                }).length;
                
                // Кнопка "Добавить" показывается, если для текущей ячейки (rowIndex) нет события,
                // и rowIndex соответствует следующей свободной строке после всех событий в этом столбце (с учетом фильтра)
                const showAddButtonInCell = (event === null && rowIndex === totalEventsInThisColumnFiltered);

                return (
                  <td
                    key={`${dateInfo.rawDate}-cell-${rowIndex}`}
                    className="p-2 border align-top min-w-[170px] h-[110px]" // Задаем минимальную высоту ячейки
                  >
                    {event ? (
                      <Card className="p-3 h-full flex flex-col justify-between bg-dance-light/50 border-dance">
                        <div>
                          <div className="font-bold text-sm">{event.time}</div>
                          <div className="text-xs mt-0.5">{event.direction_name}</div>
                          <div className="text-gray-600 text-xs mt-0.5">{event.teacher_name}</div>
                        </div>
                        <div className="flex justify-end items-center mt-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteTiming(event.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ) : showAddButtonInCell ? (
                      <div className="h-full flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddTiming(dateInfo.rawDate)}
                          className="hover:bg-dance-light text-dance border-dance-light" // Добавил border для консистентности
                        >
                          <Plus className="h-4 w-4 mr-1" /> Добавить
                        </Button>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;