import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

interface Direction {
  id: number;
  name: string;
  teacher_directions: Array<{
    id: number;
    teacher: {
      id: number;
      full_name: string;
    }
  }>;
}

interface Timing {
  id: number;
  date: string;
  time: string;
  direction_name: string;
  teacher_name: string;
  id_teacher: number;
}

interface AddTimingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  selectedDate: string | null;
  directions: Direction[];
  existingTimings: Timing[];
}

const AddTimingModal: React.FC<AddTimingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  directions,
  existingTimings
}) => {
  const [formData, setFormData] = useState({
    direction_id: '',  // Это id_td на бэкенде
    id_teacher: '',
    time: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Доступные временные слоты (с 8:00 до 19:00)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Сбрасываем форму при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setFormData({
        direction_id: '',
        id_teacher: '',
        time: '',
      });
      setError(null);
    }
  }, [isOpen]);

  // Находим выбранное направление, чтобы получить его преподавателей
  const selectedDirection = directions.find(
    d => d.id.toString() === formData.direction_id
  );

  // Находим выбранного преподавателя
  const selectedTeacherDirection = selectedDirection?.teacher_directions.find(
    td => td.id.toString() === formData.id_teacher
  );
  const selectedTeacherId = selectedTeacherDirection?.teacher.id;

  // Проверка занятости преподавателя
  const isTeacherBusy = (teacherId: number | undefined, time: string): boolean => {
    if (!teacherId || !selectedDate || !time) return false;
    
    return existingTimings.some(timing => 
      timing.date === selectedDate && 
      timing.time === time && 
      timing.id_teacher === teacherId
    );
  };

  // Получаем занятые временные слоты для выбранного преподавателя
  const getBusyTimeSlots = (): string[] => {
    if (!selectedTeacherId || !selectedDate) return [];
    
    return existingTimings
      .filter(timing => timing.date === selectedDate && timing.id_teacher === selectedTeacherId)
      .map(timing => timing.time);
  };

  const busyTimeSlots = getBusyTimeSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка занятости преподавателя
    if (selectedTeacherId && isTeacherBusy(selectedTeacherId, formData.time)) {
      setError(`Преподаватель ${selectedTeacherDirection?.teacher.full_name} уже занят в ${formData.time}`);
      return;
    }

    setError(null);
    onSubmit({
      ...formData,
      date: selectedDate
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Создать запись</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="bg-red-50 border-red-200 text-red-800 mt-2">
            <div className="flex justify-between items-center">
              <AlertDescription>{error}</AlertDescription>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="h-6 w-6 p-0"
              >
                <X size={16} />
              </Button>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="direction">Направление</Label>
              <Select
                value={formData.direction_id}
                onValueChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    direction_id: value,
                    id_teacher: '' // Сбрасываем преподавателя при смене направления
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите направление" />
                </SelectTrigger>
                <SelectContent>
                  {directions.map(direction => (
                    <SelectItem
                      key={direction.id}
                      value={direction.id.toString()}
                    >
                      {direction.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher">Преподаватель</Label>
              <Select
                value={formData.id_teacher}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    id_teacher: value,
                    time: '' // Сбрасываем время при смене преподавателя
                  }));
                  setError(null); // Сбрасываем ошибку при смене преподавателя
                }}
                disabled={!formData.direction_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    formData.direction_id
                      ? "Выберите преподавателя"
                      : "Сначала выберите направление"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {selectedDirection?.teacher_directions
                    .filter(td => td.teacher !== null) // <--- ДОБАВИТЬ ЭТУ СТРОКУ
                    .map(td => (
                      <SelectItem
                        key={td.id}
                        value={td.id.toString()}
                      >
                        {td.teacher.full_name} {/* Теперь td.teacher гарантированно не null */}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    time: value
                  }));
                  
                  // Проверяем занятость преподавателя при выборе времени
                  if (selectedTeacherId && isTeacherBusy(selectedTeacherId, value)) {
                    setError(`Преподаватель ${selectedTeacherDirection?.teacher.full_name} уже занят в ${value}`);
                  } else {
                    setError(null);
                  }
                }}
                disabled={!formData.id_teacher}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    formData.id_teacher
                      ? "Выберите время"
                      : "Сначала выберите преподавателя"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => {
                    const isBusy = busyTimeSlots.includes(time);
                    return (
                      <SelectItem
                        key={time}
                        value={time}
                        disabled={isBusy}
                        className={isBusy ? "text-gray-400" : ""}
                      >
                        {time} {isBusy ? "(занято)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="submit"
              className="bg-dance-light hover:bg-dance-dark text-black w-full"
              disabled={!formData.direction_id || !formData.id_teacher || !formData.time || error !== null}
            >
              СОЗДАТЬ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTimingModal;