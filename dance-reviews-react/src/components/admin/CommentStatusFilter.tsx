
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CommentStatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

const CommentStatusFilter: React.FC<CommentStatusFilterProps> = ({ 
  value, 
  onValueChange 
}) => {
  return (
    <Select
      value={value || "all"}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder="Все отзывы" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все отзывы</SelectItem>
        <SelectItem value="выложить">Выложенные</SelectItem>
        <SelectItem value="скрыть">Скрытые</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CommentStatusFilter;
