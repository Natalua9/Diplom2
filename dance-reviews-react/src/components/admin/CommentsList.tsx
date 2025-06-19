
import React from 'react';
import { Check, EyeOff } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  full_name: string;
}

interface Comment {
  id: number;
  contant: string;
  status: string;
  user?: User;
}

interface CommentsListProps {
  comments: Comment[];
  currentPage: number;
  perPage: number;
  onStatusUpdate: (commentId: number, newStatus: string) => void;
}

const CommentsList: React.FC<CommentsListProps> = ({ 
  comments, 
  currentPage, 
  perPage, 
  onStatusUpdate 
}) => {
  return (
    <div className="rounded-md border shadow-sm overflow-hidden mb-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead>Отзыв</TableHead>
            <TableHead>Автор</TableHead>
            <TableHead className="w-64">Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <TableRow key={comment.id || index} className="hover:bg-dance-light/20">
                <TableCell className="text-center font-medium">
                  {(currentPage - 1) * perPage + index + 1}
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="line-clamp-3">{comment.contant}</div>
                </TableCell>
                <TableCell>{comment.user?.full_name}</TableCell>
                <TableCell>
                  <RadioGroup 
                    defaultValue={comment.status} 
                    className="flex flex-row items-center space-y-0 space-x-4"
                    onValueChange={(value) => onStatusUpdate(comment.id, value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="выложить" id={`publish-${comment.id}`} />
                      <Label htmlFor={`publish-${comment.id}`} className="flex items-center">
                        <Check className="w-4 h-4 mr-1.5 text-green-600" />
                        Выложить
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="скрыть" id={`hide-${comment.id}`} />
                      <Label htmlFor={`hide-${comment.id}`} className="flex items-center">
                        <EyeOff className="w-4 h-4 mr-1.5 text-red-600" />
                        Скрыть
                      </Label>
                    </div>
                  </RadioGroup>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Отзывы не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CommentsList;
