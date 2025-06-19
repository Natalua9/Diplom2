
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Trash2, Pencil, Plus } from 'lucide-react';
import Header from "@/components/Header";
import Footer from '@/components/Footer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Direction {
  id: number;
  name: string;
  description: string;
  photo: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

const AdminDirection = () => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationLinks, setPaginationLinks] = useState<PaginationLink[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editDirection, setEditDirection] = useState<Direction | null>(null);

  const fetchDirections = async (url = 'http://localhost:8000/api/admin/adminDirection') => {
    try {
      setIsLoading(true);
      const response = await fetch(url);
      const data = await response.json();

      if (data?.data && Array.isArray(data.data)) {
        setDirections(data.data);
        // Create pagination links
        const links = [
          {
            url: data.first_page_url,
            label: '«',
            active: false
          },
          ...Array.from({ length: data.last_page }, (_, i) => ({
            url: `${data.path}?page=${i + 1}`,
            label: String(i + 1),
            active: data.current_page === i + 1
          })),
          {
            url: data.last_page_url,
            label: '»',
            active: false
          }
        ];
        setPaginationLinks(links);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      setError('Failed to load directions');
      toast.error("Не удалось загрузить направления");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDirections();
  }, []);

  const handleAddDirection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/addDirection', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setShowAddModal(false);
        toast.success("Направление успешно добавлено");
        fetchDirections();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Ошибка при добавлении направления");
      }
    } catch (error) {
      console.error('Error adding direction:', error);
      toast.error("Ошибка при добавлении направления");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDirection = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это направление?')) {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token'); // Получаем токен из localStorage
  
        const response = await fetch(`http://localhost:8000/api/delete_direction/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` // Добавляем токен
          }
        });
  
        if (response.ok) {
          toast.success("Направление успешно удалено");
          fetchDirections();
        } else {
          const errorText = await response.text();
          console.error('Failed to delete direction:', errorText);
          toast.error("Ошибка при удалении направления");
        }
      } catch (error) {
        console.error('Error deleting direction:', error);
        toast.error("Ошибка при удалении направления");
      } finally {
        setIsLoading(false);
      }
    }
  };
  

  const openEditModal = (direction: Direction) => {
    setEditDirection(direction);
    setShowEditModal(true);
  };

  const handleEditDirection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/updateDirection/', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setEditDirection(null);
        toast.success("Направление успешно обновлено");
        fetchDirections();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Ошибка при обновлении направления");
      }
    } catch (error) {
      console.error('Error updating direction:', error);
      toast.error("Ошибка при обновлении направления");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (url: string | null) => {
    if (url) {
      fetchDirections(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <div className="py-6 bg-dance-light mt-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-serif text-center mb-4 md:mb-0">УПРАВЛЕНИЕ НАПРАВЛЕНИЯМИ</h1>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-dance hover:bg-dance-dark text-black"
            >
              <Plus size={18} /> ДОБАВИТЬ НАПРАВЛЕНИЕ
            </Button>
          </div>
        </div>
      </div>
      
      <main className="container-custom py-10">
        {isLoading && !directions.length ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-dance-dark" />
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        ) : (
          <>
            <div className="rounded-md border shadow-sm overflow-hidden mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">#</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Фото</TableHead>
                    <TableHead className="w-24 text-center">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {directions.map((direction, index) => (
                    <TableRow key={direction.id} className="hover:bg-dance-light/20">
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>{direction.name}</TableCell>
                      <TableCell>
                        {direction.description.length > 100 
                          ? `${direction.description.substring(0, 100)}...` 
                          : direction.description}
                      </TableCell>
                      <TableCell>
                        <div className="relative w-24 h-24 overflow-hidden rounded-md">
                          <img
                            src={`http://localhost:8000/${direction.photo}`}
                            alt={direction.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteDirection(direction.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(direction)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {paginationLinks.length > 0 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    {paginationLinks.map((link, index) => {
                      if (index === 0) {
                        return (
                          <PaginationItem key={index}>
                            <PaginationPrevious
                              onClick={() => handlePageChange(link.url)}
                              className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        );
                      } else if (index === paginationLinks.length - 1) {
                        return (
                          <PaginationItem key={index}>
                            <PaginationNext
                              onClick={() => handlePageChange(link.url)}
                              className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        );
                      } else {
                        return (
                          <PaginationItem key={index}>
                            <PaginationLink
                              isActive={link.active}
                              onClick={() => handlePageChange(link.url)}
                              className="cursor-pointer"
                            >
                              {link.label}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    })}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
        
        {/* Add Direction Dialog */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Создать новое направление</DialogTitle>
              <DialogDescription>
                Заполните форму для добавления нового танцевального направления
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddDirection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Введите название направления"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Введите описание направления"
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photo">Изображение</Label>
                <Input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setSelectedFile(files[0]);
                    }
                  }}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  className="bg-dance hover:bg-dance-dark text-black"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Создание...</>
                  ) : (
                    "СОЗДАТЬ"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Direction Dialog */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-md">
            {editDirection && (
              <>
                <DialogHeader>
                  <DialogTitle>Редактирование направления</DialogTitle>
                  <DialogDescription>
                    Измените информацию о танцевальном направлении
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleEditDirection} className="space-y-4">
                  <input type="hidden" name="id" value={editDirection.id} />
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Название</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={editDirection.name}
                      placeholder="Введите название направления"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Описание</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      defaultValue={editDirection.description}
                      placeholder="Введите описание направления"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-photo">Текущее изображение</Label>
                    {editDirection.photo && (
                      <div className="mt-2 mb-4">
                        <img
                          src={`http://localhost:8000/${editDirection.photo}`}
                          alt="Фото направления"
                          className="max-h-32 rounded-md"
                        />
                      </div>
                    )}
                    <Input
                      id="edit-photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-500">
                      Оставьте пустым, чтобы сохранить текущее изображение
                    </p>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowEditModal(false)}
                    >
                      Отмена
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-dance hover:bg-dance-dark text-black"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение...</>
                      ) : (
                        "СОХРАНИТЬ"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </motion.div>
  );
};

export default AdminDirection;
