
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface WeekNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({ 
  onPrevious, 
  onNext 
}) => {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Предыдущая неделя
      </Button>
      <Button
        variant="outline"
        onClick={onNext}
        className="flex items-center gap-2"
      >
        Следующая неделя
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekNavigation;
