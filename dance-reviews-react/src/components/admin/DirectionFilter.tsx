import React from 'react';
import { Button } from "@/components/ui/button";

interface Direction {
  id: number; // ID направления
  name: string; // Название направления
  teacher_directions?: Array<any>; // Это поле здесь не используется для фильтра, можно оставить или убрать
}

interface DirectionFilterProps {
  directions: Direction[];
  selected: string; // Ожидаем 'all' или ID направления в виде строки
  onSelect: (directionIdOrAll: string) => void; // Будет передавать 'all' или ID в виде строки
}

const DirectionFilter: React.FC<DirectionFilterProps> = ({ 
  directions, 
  selected, 
  onSelect 
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selected === 'all' ? "default" : "outline"}
        onClick={() => onSelect('all')} // Передаем 'all'
        className="text-sm"
      >
        Все
      </Button>
      
      {directions.map(direction => (
        <Button
          key={direction.id}
          // Сравниваем selected с ID направления (преобразованным в строку)
          variant={selected === String(direction.id) ? "default" : "outline"} 
          onClick={() => onSelect(String(direction.id))} // Передаем ID направления в виде строки
          className="text-sm"
        >
          {direction.name} {/* Отображаем название, но работаем с ID */}
        </Button>
      ))}
    </div>
  );
};

export default DirectionFilter;