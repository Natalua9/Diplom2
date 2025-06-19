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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Предполагается, что у вас есть такой компонент

// Интерфейс для данных статистики преподавателя
interface InstructorStat {
  id: number;
  instructor_name: string;
  lessons_taught: number;
}

// Интерфейсы для пагинации (если API статистики их возвращает)
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

const AdminInstructorStats = () => {
  const [stats, setStats] = useState<InstructorStat[]>([]);
  const [paginationLinks, setPaginationLinks] = useState<PaginationLink[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    lastPage: 1,
    perPage: 10 // Можно настроить другое значение по умолчанию
  });
  const [loading, setLoading] = useState(true);
  
  // Состояние для фильтров
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // +1 так как getMonth() 0-11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const monthOptions = [
    { value: 1, label: 'Январь' }, { value: 2, label: 'Февраль' }, { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' }, { value: 5, label: 'Май' }, { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' }, { value: 8, label: 'Август' }, { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' }, { value: 11, label: 'Ноябрь' }, { value: 12, label: 'Декабрь' },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i); // Последние 5 лет, например

  const fetchStats = async (url?: string) => {
    setLoading(true);
    // Если URL для пагинации не передан, формируем его с фильтрами
    const baseUrl = 'http://localhost:8000/api/admin/instructor-stats';
    const requestUrl = url || `${baseUrl}?month=${selectedMonth}&year=${selectedYear}&page=${paginationInfo.currentPage}`;
    
    try {
      const response = await fetch(requestUrl);
      const data = await response.json();

      if (data?.data) {
        setStats(data.data);
        // Обновление информации о пагинации, если API её возвращает
        if (data.current_page && data.last_page && data.per_page) {
            setPaginationInfo({
                currentPage: data.current_page,
                lastPage: data.last_page,
                perPage: data.per_page
            });

            const links = [
            { url: data.first_page_url, label: '«', active: false },
            ...Array.from({ length: data.last_page }, (_, i) => ({
                url: `${data.path}?month=${selectedMonth}&year=${selectedYear}&page=${i + 1}`, // Добавляем фильтры в ссылки пагинации
                label: String(i + 1),
                active: data.current_page === i + 1
            })),
            { url: data.last_page_url, label: '»', active: false }
            ];
            setPaginationLinks(links);
        } else {
            // Если API не возвращает пагинацию для этого эндпоинта, сбрасываем
            setPaginationLinks([]);
            setPaginationInfo(prev => ({ ...prev, currentPage: 1, lastPage: 1 }));
        }

      } else {
        setStats([]); // Если данных нет
        setPaginationLinks([]);
        setPaginationInfo(prev => ({ ...prev, currentPage: 1, lastPage: 1 }));
      }
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      setStats([]);
      setPaginationLinks([]);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при изменении фильтров или страницы
  useEffect(() => {
    fetchStats(); // Передаем undefined, чтобы fetchStats сам построил URL с текущими фильтрами и страницей
  }, [selectedMonth, selectedYear, paginationInfo.currentPage]); // Зависимость от currentPage для пагинации

  const handlePageChange = (url: string | null) => {
    if (url) {
      // Извлекаем номер страницы из URL, чтобы обновить currentPage
      const pageMatch = url.match(/page=(\d+)/);
      if (pageMatch && pageMatch[1]) {
        setPaginationInfo(prev => ({ ...prev, currentPage: parseInt(pageMatch[1], 10) }));
      } else {
        // Если URL не содержит параметра page (например, первая страница), считаем её первой
        setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
      }
      // fetchStats будет вызван через useEffect из-за изменения paginationInfo.currentPage
    }
  };
  
  const handleMonthChange = (value: string) => {
    setSelectedMonth(Number(value));
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 })); // Сброс на первую страницу при смене фильтра
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(Number(value));
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 })); // Сброс на первую страницу при смене фильтра
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
          <h1 className="text-3xl md:text-4xl font-serif text-center">СТАТИСТИКА ПРЕПОДАВАТЕЛЕЙ</h1>
        </div>
      </div>

      <main className="container-custom py-10">
        {/* Фильтры */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="month-select" className="font-medium">Месяц:</label>
            <Select value={String(selectedMonth)} onValueChange={handleMonthChange}>
              <SelectTrigger id="month-select" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Выберите месяц" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(month => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="year-select" className="font-medium">Год:</label>
            <Select value={String(selectedYear)} onValueChange={handleYearChange}>
              <SelectTrigger id="year-select" className="w-full sm:w-[120px]">
                <SelectValue placeholder="Выберите год" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-dance-dark" />
          </div>
        ) : (
          <>
            {stats.length > 0 ? (
              <div className="rounded-md border shadow-sm overflow-hidden mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">#</TableHead>
                      <TableHead>ФИО Преподавателя</TableHead>
                      <TableHead className="text-center">Количество проведенных занятий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.map((stat, index) => (
                      <TableRow key={stat.id} className="hover:bg-dance-light/20">
                        <TableCell className="text-center font-medium">
                          {(paginationInfo.currentPage - 1) * paginationInfo.perPage + index + 1}
                        </TableCell>
                        <TableCell>{stat.instructor_name}</TableCell>
                        <TableCell className="text-center">{stat.lessons_taught}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-500">Нет данных за выбранный период.</p>
            )}

            {paginationLinks.length > 0 && stats.length > 0 && paginationInfo.lastPage > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    {paginationLinks.map((link, index) => {
                      if (index === 0) { // Previous
                        return (
                          <PaginationItem key={`prev-${index}`}>
                            <PaginationPrevious
                              onClick={() => handlePageChange(link.url)}
                              className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        );
                      } else if (index === paginationLinks.length - 1) { // Next
                        return (
                          <PaginationItem key={`next-${index}`}>
                            <PaginationNext
                              onClick={() => handlePageChange(link.url)}
                              className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        );
                      } else { // Page numbers
                        return (
                          <PaginationItem key={`${link.label}-${index}`}>
                            <PaginationLink
                              isActive={link.active}
                              onClick={() => handlePageChange(link.url)}
                              className="cursor-pointer"
                            >
                              {link.label.replace('«', '').replace('»', '')}
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

export default AdminInstructorStats;