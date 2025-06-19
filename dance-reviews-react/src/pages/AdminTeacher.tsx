import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Trash2, Pencil, Plus, Search, X, Filter } from 'lucide-react'; // Trash2 might not be needed if fully replaced
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Badge
} from "@/components/ui/badge";

interface Teacher {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string; // Used for defaultValue in edit form for birth date.
  photo: string;
  age: string; // In the table, this is labelled "Дата рождения". In forms, input `name="age"` is for birth date.
  gender: string;
  teacher_directions?: TeacherDirection[];
  job_status_name?: string; // NEW: e.g., "работает", "уволен"
}

interface TeacherDirection {
  direction: {
    id: number;
    name: string;
  };
}

interface Direction {
  id: number;
  name: string;
}

interface PaginationLinkFE { // Renamed to avoid conflict with component
  url: string | null;
  label: string;
  active: boolean;
}

const AdminTeacher = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationLinks, setPaginationLinks] = useState<PaginationLinkFE[]>([]);
  // selectedFile is not used, can be removed if not planned for future use
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [selectedDirections, setSelectedDirections] = useState<number[]>([]);
  const [addDirections, setAddDirections] = useState<number[]>([]);
  const [addPhoto, setAddPhoto] = useState<File | null>(null);
  const [editPhoto, setEditPhoto] = useState<File | null>(null);

  // Поиск и фильтрация
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDirections, setFilterDirections] = useState<number[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const fetchDirections = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/directions');
      const data = await response.json();

      if (data?.directions && Array.isArray(data.directions)) {
        setDirections(data.directions);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      toast.error("Не удалось загрузить направления");
    }
  };

  const fetchTeachers = async (url = 'http://localhost:8000/api/admin/teachers', params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      setNoResults(false);

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(`${key}[]`, item.toString()));
        } else if (value) {
          searchParams.append(key, value.toString());
        }
      });

      const finalUrl = searchParams.toString()
        ? `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`
        : url;

      const response = await fetch(finalUrl);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data?.teachers?.data) {
        setTeachers(data.teachers.data);
        if (data.teachers.data.length === 0) {
          setNoResults(true);
        }
        if (data.teachers.links) {
          setPaginationLinks(data.teachers.links);
        } else {
          setPaginationLinks([]);
        }
      } else {
        setTeachers([]);
        setPaginationLinks([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to load teachers');
      setTeachers([]);
      setPaginationLinks([]);
      toast.error("Не удалось загрузить преподавателей");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchDirections();
  }, []);

  const applyFilters = () => {
    fetchTeachers('http://localhost:8000/api/admin/teachers', {
      search: searchTerm,
      directions: filterDirections.length > 0 ? filterDirections : undefined
    });
    setIsFiltering(filterDirections.length > 0 || !!searchTerm);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDirections([]);
    setIsFiltering(false);
    fetchTeachers();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilterDirection = (directionId: number) => {
    setFilterDirections(prev =>
      prev.includes(directionId)
        ? prev.filter(id => id !== directionId)
        : [...prev, directionId]
    );
  };

  const validateAge = (birthDateStr: string): boolean => {
    if (!birthDateStr) return false;
    const today = new Date();
    const birthDateObj = new Date(birthDateStr);

    if (isNaN(birthDateObj.getTime())) return false; // Invalid date

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const handleAddTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const birthDate = formData.get('age') as string; // 'age' field is used for birth date

    if (!validateAge(birthDate)) {
      toast.error("Преподаватель должен быть старше 18 лет");
      return;
    }

    formData.append('directions', JSON.stringify(addDirections));
    if (addPhoto) {
      formData.set('photo', addPhoto); // Use set to replace if already exists
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/signupTeacher', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      const responseText = await response.text();
      console.log('Full server response (add teacher):', responseText);

      if (response.ok) {
        // const data = JSON.parse(responseText); // data might not be used
        setShowAddModal(false);
        toast.success("Преподаватель успешно добавлен");
        fetchTeachers();
        setAddDirections([]);
        setAddPhoto(null);
        (e.target as HTMLFormElement).reset(); // Reset form fields
      } else {
        try {
          const errorData = JSON.parse(responseText);
          toast.error(errorData.message || errorData.error || "Ошибка при добавлении преподавателя");
          console.error('Error details (add teacher):', errorData);
        } catch {
          toast.error("Неизвестная ошибка сервера при добавлении преподавателя");
          console.error('Unparseable error response (add teacher):', responseText);
        }
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast.error("Ошибка при добавлении преподавателя");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTeacher) return;

    const formData = new FormData(e.currentTarget);
    const birthDate = formData.get('age') as string; // 'age' field is used for birth date

    if (!validateAge(birthDate)) {
      toast.error("Преподаватель должен быть старше 18 лет");
      return;
    }

    formData.append('directions', JSON.stringify(selectedDirections));
    formData.append('id', editTeacher.id.toString()); // Ensure ID is sent

    // Backend expects 'age' for birth_date, so if it's not changed, it's already in formData
    // If 'photo' is not changed, we don't want to send an empty 'photo' field
    // if (!editPhoto && formData.has('photo') && !(formData.get('photo') as File)?.name) {
    //   formData.delete('photo'); // If no new photo and placeholder File object, remove
    // } else 
    if (editPhoto) {
      formData.set('photo', editPhoto); // Use set to replace if already exists
    } else {
      const photoInput = e.currentTarget.elements.namedItem('photo') as HTMLInputElement;
      if (photoInput && (!photoInput.files || photoInput.files.length === 0)) {
        formData.delete('photo');
      }
    }


    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      // Ensure this endpoint can handle FormData and updates, including partial (e.g., no photo change)
      const response = await fetch('http://localhost:8000/api/admin/addDirectionTeacher', { // This endpoint might need to be more generic like /api/admin/teachers/{id} with PUT/POST
        method: 'POST', // Often, updates are PUT or POST with a _method field for FormData
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // 'X-HTTP-Method-Override': 'PUT' // If backend expects PUT for updates with FormData
        },
        body: formData
      });

      const responseText = await response.text();
      console.log('Full edit response:', responseText);

      if (response.ok) {
        // const responseData = JSON.parse(responseText); // data might not be used
        setShowEditModal(false);
        setEditTeacher(null);
        setEditPhoto(null);
        toast.success("Преподаватель успешно обновлен");
        fetchTeachers();
      } else {
        try {
          const errorData = JSON.parse(responseText);
          toast.error(errorData.message || errorData.error || "Ошибка при обновлении преподавателя");
          console.error('Full error details (edit teacher):', errorData);
        } catch {
          toast.error("Неизвестная ошибка сервера при обновлении преподавателя");
          console.error('Unparseable error response (edit teacher):', responseText);
        }
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast.error("Ошибка при обновлении преподавателя");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTeacherStatus = async (id: number, currentStatus?: string) => {
    const actionText = currentStatus === 'уволен' ? 'восстановить' : 'уволить';
    const confirmationMessage = `Вы уверены, что хотите ${actionText} этого преподавателя?`;

    if (window.confirm(confirmationMessage)) {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:8000/api/delete_teacher/${id}`, {
          method: 'DELETE', // Or POST, as per your backend route for this action
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const responseData = await response.json();

        if (response.ok) {
          toast.success(responseData.message || `Статус преподавателя успешно изменен.`);
          fetchTeachers(); // Refresh the list
        } else {
          const errorText = responseData.message || responseData.error || "Ошибка при изменении статуса преподавателя";
          console.error('Failed to toggle teacher status:', responseData);
          toast.error(errorText);
        }
      } catch (error) {
        console.error('Error toggling teacher status:', error);
        toast.error("Ошибка при изменении статуса преподавателя");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditModal = (teacher: Teacher) => {
    setEditTeacher(teacher);
    const currentDirectionIds = teacher.teacher_directions?.map(td => td.direction.id) || [];
    setSelectedDirections(currentDirectionIds);
    setShowEditModal(true);
    setEditPhoto(null);
  };

  const handlePageChange = (url: string | null) => {
    if (url) {
      const params: Record<string, any> = {};
      const existingUrlParams = new URLSearchParams(url.split('?')[1] || '');
      existingUrlParams.forEach((value, key) => {
        if (key.endsWith('[]')) {
          const actualKey = key.slice(0, -2);
          if (!params[actualKey]) params[actualKey] = [];
          params[actualKey].push(value);
        } else {
          params[key] = value;
        }
      });

      if (searchTerm) {
        params['search'] = searchTerm;
      } else {
        delete params['search']; // Remove if searchTerm is empty but was in URL
      }

      if (filterDirections.length > 0) {
        params['directions'] = filterDirections;
      } else {
        delete params['directions']; // Remove if filterDirections is empty but was in URL
      }
      fetchTeachers(url.split('?')[0], params);
    }
  };

  const handleDirectionChange = (directionId: number, isAdd: boolean = false) => {
    if (isAdd) {
      setAddDirections(prev =>
        prev.includes(directionId)
          ? prev.filter(id => id !== directionId)
          : [...prev, directionId]
      );
    } else {
      setSelectedDirections(prev =>
        prev.includes(directionId)
          ? prev.filter(id => id !== directionId)
          : [...prev, directionId]
      );
    }
  };

  const handleAddPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAddPhoto(e.target.files[0]);
    } else {
      setAddPhoto(null);
    }
  };

  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditPhoto(e.target.files[0]);
    } else {
      setEditPhoto(null);
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
            <h1 className="text-3xl md:text-4xl font-serif text-center mb-4 md:mb-0">УПРАВЛЕНИЕ ПРЕПОДАВАТЕЛЯМИ</h1>
            <Button
              onClick={() => {
                setShowAddModal(true);
                setAddDirections([]); // Reset for new add modal
                setAddPhoto(null);
              }}
              className="flex items-center gap-2 bg-dance hover:bg-dance-dark text-black"
            >
              <Plus size={18} /> ДОБАВИТЬ ПРЕПОДАВАТЕЛЯ
            </Button>
          </div>
        </div>
      </div>

      <main className="container-custom py-10">
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="relative">
              <Label htmlFor="search-term" className="sr-only">Поиск</Label>
              <Input
                id="search-term"
                type="text"
                placeholder="Поиск по ФИО или email"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pr-10"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => { setSearchTerm(''); applyFilters(); }} // Apply filter after clearing search
                  aria-label="Очистить поиск"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span>Направления</span>
                    </div>
                    {filterDirections.length > 0 && (
                      <Badge
                        className="ml-2 bg-dance text-black hover:bg-dance-dark"
                      >
                        {filterDirections.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <div className="p-4 space-y-2">
                    <h4 className="font-medium mb-2 text-sm">Выберите направления</h4>
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                      {directions.map((direction) => (
                        <div key={direction.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-direction-${direction.id}`}
                            checked={filterDirections.includes(direction.id)}
                            onCheckedChange={() => toggleFilterDirection(direction.id)}
                          />
                          <Label
                            htmlFor={`filter-direction-${direction.id}`}
                            className="cursor-pointer text-sm font-normal flex-1"
                          >
                            {direction.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-2 border-t flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterDirections([])}
                      disabled={filterDirections.length === 0}
                    >
                      Сбросить
                    </Button>
                    {/* Apply button in popover might be redundant if main "Найти" button is used */}
                    {/* <Button
                      size="sm"
                      className="bg-dance hover:bg-dance-dark text-black"
                      onClick={applyFilters} // Or close popover and let main button handle it
                    >
                      Применить
                    </Button> */}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-dance hover:bg-dance-dark text-black flex items-center gap-2"
                onClick={applyFilters}
                disabled={isLoading}
              >
                <Search size={16} /> {isLoading && searchTerm ? 'Поиск...' : 'Найти'}
              </Button>
              {(searchTerm || isFiltering) && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex items-center gap-1"
                  disabled={isLoading}
                >
                  <X size={16} /> Сбросить
                </Button>
              )}
            </div>
          </div>

          {(isFiltering || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1 bg-gray-100 text-gray-700">
                  Поиск: {searchTerm}
                  <button type="button" onClick={() => { setSearchTerm(''); fetchTeachers('http://localhost:8000/api/admin/teachers', { directions: filterDirections }); setIsFiltering(filterDirections.length > 0); }} aria-label="Убрать поиск">
                    <X size={14} className="ml-1" />
                  </button>
                </Badge>
              )}

              {filterDirections.map(dirId => {
                const direction = directions.find(d => d.id === dirId);
                return direction ? (
                  <Badge
                    key={dirId}
                    variant="outline"
                    className="flex items-center gap-1 bg-gray-100 text-gray-700"
                  >
                    {direction.name}
                    <button type="button" onClick={() => { toggleFilterDirection(dirId); fetchTeachers('http://localhost:8000/api/admin/teachers', { search: searchTerm, directions: filterDirections.filter(id => id !== dirId) }); setIsFiltering(searchTerm || filterDirections.length > 1); }} aria-label={`Убрать фильтр ${direction.name}`}>
                      <X size={14} className="ml-1" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        {isLoading && teachers.length === 0 ? ( // Show loader only if no data is displayed yet
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-dance-dark" />
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        ) : noResults ? ( // noResults implies teachers.length === 0 from fetchTeachers
          <div className="text-center p-12 bg-gray-50 rounded-md">
            <div className="text-lg font-medium text-gray-600 mb-2">Нет результатов</div>
            <p className="text-gray-500">
              По вашему запросу не найдено преподавателей. Попробуйте изменить параметры поиска или сбросить фильтры.
            </p>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="mt-4 flex items-center gap-1 mx-auto"
            >
              <X size={16} /> Сбросить фильтры
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-md border shadow-sm overflow-hidden mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">#</TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Почта</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Дата рождения</TableHead>
                    <TableHead>Фото</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Направления</TableHead>
                    <TableHead className="w-48 text-center">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher, index) => (
                    <TableRow key={teacher.id} className={`hover:bg-dance-light/20 ${teacher.job_status_name === 'уволен' ? 'opacity-60 bg-gray-50' : ''}`}>
                      <TableCell className="text-center font-medium">{index + 1 + ((parseInt(paginationLinks.find(l => l.active)?.label ?? "1") - 1) * 10)}</TableCell> {/* Simple pagination based index or more complex if per_page is available */}
                      <TableCell>{teacher.full_name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone}</TableCell>
                      <TableCell>{teacher.age}</TableCell> {/* Assuming teacher.age contains birth date string */}
                      <TableCell>
                        <div className="relative w-20 h-20 overflow-hidden rounded-md">
                          {teacher.photo ? (
                            <img
                              src={`http://localhost:8000/${teacher.photo}`}
                              alt={teacher.full_name}
                              className="object-cover w-full h-full"
                              onError={(e) => (e.currentTarget.src = "/placeholder-image.webp")} // Fallback
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                              Нет фото
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacher.job_status_name ? (
                          <Badge
                            variant={teacher.job_status_name === 'уволен' ? 'destructive' : 'default'}
                            className={
                              teacher.job_status_name === 'уволен'
                                ? 'bg-red-100 text-red-700 border-red-300'
                                : 'bg-green-100 text-green-700 border-green-300'
                            }
                          >
                            {teacher.job_status_name.charAt(0).toUpperCase() + teacher.job_status_name.slice(1)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">—</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {teacher.teacher_directions && teacher.teacher_directions.length > 0
                          ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {teacher.teacher_directions.map(td => (
                                <Badge
                                  key={td.direction.id}
                                  className="bg-dance/20 text-black hover:bg-dance/30 font-normal"
                                >
                                  {td.direction.name}
                                </Badge>
                              ))}
                            </div>
                          )
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleTeacherStatus(teacher.id, teacher.job_status_name)}
                            className={`
    ${teacher.job_status_name === 'уволен'
                                ? "border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 focus:ring-green-500"
                                : "border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-red-500"}
    disabled:opacity-50
  `}
                            disabled={isLoading}
                          >
                            {teacher.job_status_name === 'уволен' ? 'Восстановить' : 'Уволить'}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(teacher)}
                            disabled={isLoading}
                            aria-label="Редактировать преподавателя"
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

            {paginationLinks && paginationLinks.length > 3 && ( // Show pagination if more than prev/next + 1 page
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    {paginationLinks.map((link, index) => {
                      if (link.label.includes('Previous') || link.label.includes('«')) {
                        return (
                          <PaginationItem key={`prev-${index}`}>
                            <PaginationPrevious
                              onClick={() => handlePageChange(link.url)}
                              className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              aria-disabled={!link.url}
                            />
                          </PaginationItem>
                        );
                      } else if (link.label.includes('Next') || link.label.includes('»')) {
                        return (
                          <PaginationItem key={`next-${index}`}>
                            <PaginationNext
                              onClick={() => handlePageChange(link.url)}
                              className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              aria-disabled={!link.url}
                            />
                          </PaginationItem>
                        );
                      } else if (!isNaN(Number(link.label))) { // Check if label is a number
                        return (
                          <PaginationItem key={`page-${link.label}-${index}`}>
                            <PaginationLink
                              isActive={link.active}
                              onClick={() => handlePageChange(link.url)}
                              className={link.url ? "cursor-pointer" : "pointer-events-none opacity-50"}
                              aria-current={link.active ? "page" : undefined}
                            >
                              {link.label}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null; // For "..." or other non-standard links
                    })}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Add Teacher Dialog */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Создать нового преподавателя</DialogTitle>
              <DialogDescription>
                Заполните форму для добавления нового преподавателя.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTeacher} className="space-y-4 max-h-[65vh] overflow-y-auto pr-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">ФИО</Label>
                <Input id="full_name" name="full_name" placeholder="Иванов Иван Иванович" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Почта</Label>
                <Input id="email" name="email" type="email" placeholder="teacher@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" name="phone" placeholder="+7 (999) 123-45-67" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age_add_form">Дата рождения</Label> {/* 'age' is the name attribute */}
                <Input id="age_add_form" name="age" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender_add_form">Пол</Label>
                <Select name="gender" required>
                  <SelectTrigger id="gender_add_form">
                    <SelectValue placeholder="Выберите пол" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="мужчина">Мужчина</SelectItem>
                    <SelectItem value="женщина">Женщина</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input id="password" name="password" type="password" placeholder="Минимум 6 символов" required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-photo">Фотография</Label>
                <Input id="add-photo" name="photo" type="file" accept="image/*" onChange={handleAddPhotoChange} />
                {addPhoto && <p className="text-xs text-gray-500 mt-1">Выбрано: {addPhoto.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Направления</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border p-2 rounded-md">
                  {directions.map((direction) => (
                    <div key={`add-dir-${direction.id}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`add-direction-${direction.id}`}
                        checked={addDirections.includes(direction.id)}
                        onCheckedChange={() => handleDirectionChange(direction.id, true)}
                      />
                      <Label htmlFor={`add-direction-${direction.id}`} className="font-normal text-sm cursor-pointer">
                        {direction.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Отмена</Button>
                <Button type="submit" className="bg-dance hover:bg-dance-dark text-black" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Создание...</> : "СОЗДАТЬ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Teacher Dialog */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-md">
            {editTeacher && (
              <>
                <DialogHeader>
                  <DialogTitle>Редактирование преподавателя</DialogTitle>
                  <DialogDescription>Измените информацию о преподавателе: {editTeacher.full_name}</DialogDescription>
                </DialogHeader>
               <form onSubmit={handleEditTeacher} className="space-y-4 max-h-[65vh] overflow-y-auto pr-4">
                  {/* <input type="hidden" name="id" value={editTeacher.id} /> Included in formData.append in handler */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-full_name">ФИО</Label>
                    <Input id="edit-full_name" name="full_name" defaultValue={editTeacher.full_name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Почта</Label>
                    <Input id="edit-email" name="email" type="email" defaultValue={editTeacher.email} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Телефон</Label>
                    <Input id="edit-phone" name="phone" defaultValue={editTeacher.phone} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-birth_date_form">Дата рождения</Label> {/* 'age' is the name attribute */}
                    <Input id="edit-birth_date_form" name="age" type="date" defaultValue={editTeacher.age} required /> {/* Using teacher.age as it contains birth date */}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-photo">Фото</Label>
                    {editTeacher.photo && !editPhoto && (
                      <div className="mt-1 mb-2">
                        <img src={`http://localhost:8000/${editTeacher.photo}`} alt="Текущее фото" className="max-h-24 rounded-md border" />
                      </div>
                    )}
                    {editPhoto && (
                      <div className="mt-1 mb-2">
                        <img src={URL.createObjectURL(editPhoto)} alt="Новое фото" className="max-h-24 rounded-md border" />
                      </div>
                    )}
                    <Input id="edit-photo" name="photo" type="file" accept="image/*" onChange={handleEditPhotoChange} />
                    <p className="text-xs text-gray-500">Оставьте пустым, чтобы сохранить текущее фото.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Направления</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border p-2 rounded-md">
                      {directions.map((direction) => (
                        <div key={`edit-dir-${direction.id}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-direction-${direction.id}`}
                            checked={selectedDirections.includes(direction.id)}
                            onCheckedChange={() => handleDirectionChange(direction.id, false)}
                          />
                          <Label htmlFor={`edit-direction-${direction.id}`} className="font-normal text-sm cursor-pointer">
                            {direction.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Отмена</Button>
                    <Button type="submit" className="bg-dance hover:bg-dance-dark text-black" disabled={isLoading}>
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение...</> : "СОХРАНИТЬ"}
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

export default AdminTeacher;