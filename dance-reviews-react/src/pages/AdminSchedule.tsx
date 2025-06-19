import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from "../components/Header";
import Footer from '../components/Footer';
import AlertMessage from '../components/admin/AlertMessage';
import DirectionFilter from '../components/admin/DirectionFilter';
import ScheduleTable from '../components/admin/ScheduleTable';
import WeekNavigation from '../components/admin/WeekNavigation';
import AddTimingModal from '../components/admin/AddTimingModal';

// Интерфейс для направлений, приходящих с бэкенда (для фильтра и модалки)
interface DirectionForSelect {
  id: number; // direction.id
  name: string;
  teacher_directions: Array<{ // связи преподаватель-направление
    id: number; // teacher_directions.id
    teacher: {
      id: number; // users.id (преподавателя)
      full_name: string;
    }
  }>;
}

// Интерфейс для данных о занятии (Timings)
export interface Timing {
  id: number; // timings.id
  day_of_week: number; // номер дня недели (1-Пн, ..., 7-Вс), алиас из timings.date
  time: string;
  direction_name: string;
  teacher_name: string;
  id_teacher: number;       // teacher_directions.id
  actual_teacher_id?: number; // users.id (преподавателя)
  direction_id?: number;    // directions.id
  // duration убрано
}

// Интерфейс для информации о датах недели
interface DateInfo {
  rawDate: string;      // 'YYYY-MM-DD'
  dayName: string;      // 'понедельник'
  formattedDate: string;// 'dd.mm'
  isoDayOfWeek: number; // 1 (Пн) - 7 (Вс)
}

const AdminSchedule = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentWeekDates, setCurrentWeekDates] = useState<DateInfo[]>([]);
  const [timings, setTimings] = useState<Timing[]>([]);
  const [directions, setDirections] = useState<DirectionForSelect[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<string>('all'); // 'all' или id направления как строка
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null); // 'YYYY-MM-DD'
  const [alertMessage, setAlertMessage] = useState({ type: '', message: '' });

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/adminTiming?week_offset=${weekOffset}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Ответ не в формате JSON');
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      setCurrentWeekDates(data.dates);
      setDirections(data.directions);
      setTimings(data.timings); // timings теперь содержат day_of_week, без duration
    } catch (error) {
      setAlertMessage({
        type: 'error',
        message: 'Ошибка при загрузке данных расписания'
      });
      console.error('Error fetching schedule data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [weekOffset]);

  // formData для добавления, без duration
  const handleAddTiming = async (formData: { id_teacher: number; time: string; date: string; /* duration убран */ }) => {
    try {
      const response = await fetch('http://localhost:8000/api/timings/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData) // date здесь - это выбранная дата 'YYYY-MM-DD'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при добавлении записи');
      }
      setModalOpen(false);
      toast.success('Запись успешно добавлена');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при добавлении записи');
      console.error('Error adding timing:', error);
    }
  };

  const handleDeleteTiming = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/deleteTiming/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || 'Ошибка при удалении записи');
        } catch (e) {
            throw new Error(errorText || 'Ошибка при удалении записи');
        }
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Неизвестная ошибка при удалении');
      }
      toast.success('Запись успешно удалена');
      fetchData();
    } catch (error: any) {
      console.error('Полная ошибка при удалении:', error);
      toast.error(error.message || 'Ошибка при удалении записи');
    }
  };
  
  const openAddModal = (date: string) => { // date здесь 'YYYY-MM-DD'
    setSelectedDateForModal(date);
    setModalOpen(true);
  };

  return (
    <>
      <Header />
      <div className="w-full pt-20 pb-12">
        <div className="container-custom">
          <div className="mb-8 mt-6">
            <h1 className="text-3xl font-serif">Управление расписанием</h1>
          </div>

          {alertMessage.message && (
            <AlertMessage 
              type={alertMessage.type as 'success' | 'error' | ''} 
              message={alertMessage.message} 
              onDismiss={() => setAlertMessage({ type: '', message: '' })}
            />
          )}

          <DirectionFilter 
            directions={directions} 
            selected={selectedDirection} 
            onSelect={(dirId) => setSelectedDirection(String(dirId))} 
          />

          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            {currentWeekDates.length > 0 ? (
              <ScheduleTable 
                weekDates={currentWeekDates}
                timings={timings}
                onDeleteTiming={handleDeleteTiming}
                onAddTiming={openAddModal}
                selectedDirectionId={selectedDirection === 'all' ? 'all' : parseInt(selectedDirection)}
              />
            ) : (
              <p>Загрузка расписания...</p>
            )}
            <WeekNavigation 
              onPrevious={() => setWeekOffset(prev => prev - 1)}
              onNext={() => setWeekOffset(prev => prev + 1)}
            />
          </div>
        </div>

        {modalOpen && selectedDateForModal && (
      <AddTimingModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDateForModal(null);
        }}
        onSubmit={handleAddTiming}
        selectedDate={selectedDateForModal} // Убедитесь, что это 'YYYY-MM-DD' строка
        directions={directions}
        existingTimings={timings} // <--- ВОТ ЭТО ИЗМЕНЕНИЕ
      />
    )}
      </div>
      <Footer />
    </>
  );
};

export default AdminSchedule;