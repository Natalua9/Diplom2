import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  attended_lessons: number;
  cancelled_lessons: number;
  registration_date: string;
  last_lesson_date: string | null;
}

interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  perPage: number;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Функция для форматирования даты в удобочитаемый формат
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Не посещал еще ни одного занятия';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  });
};

const AdminPerson = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [paginationLinks, setPaginationLinks] = useState<PaginationLink[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    lastPage: 1,
    perPage: 5
  });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (url = 'http://localhost:8000/api/admin/adminPerson') => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data?.data) {
        setUsers(data.data);
        setPaginationInfo({
          currentPage: data.current_page,
          lastPage: data.last_page,
          perPage: data.per_page
        });

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
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (url: string | null) => {
    if (url) {
      fetchUsers(url);
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
          <h1 className="text-3xl md:text-4xl font-serif text-center">УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</h1>
        </div>
      </div>

      <main className="container-custom py-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-dance-dark" />
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
                    <TableHead>Возраст</TableHead>
                    <TableHead>Посещено занятий</TableHead>
                    <TableHead>Отменено занятий</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead>Последнее посещение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id || index} className="hover:bg-dance-light/20">
                      <TableCell className="text-center font-medium">
                        {(paginationInfo.currentPage - 1) * paginationInfo.perPage + index + 1}
                      </TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.age} лет</TableCell>
                      <TableCell>{user.attended_lessons}</TableCell>
                      <TableCell>{user.cancelled_lessons}</TableCell>
                      <TableCell>{formatDate(user.registration_date)}</TableCell>
                      <TableCell>{formatDate(user.last_lesson_date)}</TableCell>
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
                              {link.label.replace('&laquo;', '').replace('&raquo;', '')}
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
      </main>

      <Footer />
    </motion.div>
  );
};

export default AdminPerson;