// --- START OF FILE UserDashboard.tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalendarDays, CreditCard, Check, X, ChevronLeft, ChevronRight, User, Clock, MessageSquare, Eye, ShoppingBag } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm'; // Убедитесь, что ReviewFormProps обновлены

const russianDayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const formatDateInRussian = (dateString?: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    } catch (e) {
        return '';
    }
};

const isPastLesson = (dateString?: string, timeString?: string): boolean => {
    if (!dateString || !timeString) return false;
    try {
        const now = new Date();
        const date = new Date(dateString);
        const [hours, minutes] = timeString.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return false;
        date.setHours(hours, minutes, 0, 0);
        return date < now;
    } catch (e) {
        return false;
    }
};

interface UserData {
    full_name?: string;
    phone?: string;
    email?: string;
    age?: string; // Предполагаем, что дата рождения приходит как строка YYYY-MM-DD
    photo?: string;
}

interface EventRecord {
    id: number;
    time_record: string;
    status: 'новая' | 'проведена' | 'отменена'; // Добавьте все возможные статусы
    teacher?: {
        id: number;
        full_name?: string;
    };
    direction?: {
        name?: string;
    };
    // ... другие поля, если есть
}

interface DayRecord {
    [dayOfWeekIso: number]: EventRecord[];
}

interface DateInfo {
    dayOfWeekIso: number;
    dayName: string;
    date: string; // Форматированная дата DD.MM.YYYY
    rawDate: string; // Дата в формате YYYY-MM-DD
}

interface UserComment {
    id: number;
    id_teacher: number;
    id_user: number;
    id_record: number | null; // Ключевое поле для связи с занятием
    contant: string;
    rating: number | string;
    created_at: string;
}

interface Notification {
    id: number;
    content: string;
    // ... другие поля уведомления
}

interface Subscription {
    id: number;
    direction_name: string;
    count_lessons: number;
    status: 'активный' | 'неактивный';
    created_at: string;
    expires_at_formatted?: string;
    // ... другие поля абонемента
}

interface Direction {
    id: number;
    name: string;
}


const UserDashboard = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [records, setRecords] = useState<DayRecord>({});
    const [dates, setDates] = useState<DateInfo[]>([]);
    const [weekOffset, setWeekOffset] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const [reviewTarget, setReviewTarget] = useState<{ teacherId: number | null, recordIdForContext: number | null }>({ teacherId: null, recordIdForContext: null });
    const [userComments, setUserComments] = useState<UserComment[]>([]);
    const [viewingComment, setViewingComment] = useState<UserComment | null>(null);
    const [activeTab, setActiveTab] = useState('schedule');

    const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
    const [availableDirections, setAvailableDirections] = useState<Direction[]>([]);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedDirectionId, setSelectedDirectionId] = useState<string>('');
    const [selectedLessonCount, setSelectedLessonCount] = useState<string>('4');
    const [isSubmittingSubscription, setIsSubmittingSubscription] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);


    const fetchUserComments = useCallback(async (token: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/user/comments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Не удалось загрузить комментарии' }));
                throw new Error(errorData.message || 'Не удалось загрузить комментарии');
            }
            const data = await response.json();
            setUserComments((data.comments || []) as UserComment[]);
            // console.log("User comments fetched and set:", data.comments);
        } catch (error: any) {
            console.error('Ошибка при загрузке комментариев:', error);
            toast({ title: "Ошибка комментариев", description: error.message, variant: "destructive" });
        }
    }, [toast]);


    const fetchData = useCallback(async () => {
        setIsLoadingData(true);
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/signin';
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/personal?week_offset=${weekOffset}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/signin';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
                throw new Error(errorData.message || 'Network response was not ok');
            }

            const data = await response.json();

            if (data.dates && Array.isArray(data.dates)) {
                const updatedDates = data.dates.map((dateItem: any): DateInfo => {
                    const displayDate = new Date(dateItem.date); // dateItem.date должен быть в YYYY-MM-DD
                    const day = displayDate.getDate().toString().padStart(2, '0');
                    const month = (displayDate.getMonth() + 1).toString().padStart(2, '0');
                    const year = displayDate.getFullYear();
                    const dayIndex = displayDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
                    const russianIndex = dayIndex === 0 ? 6 : dayIndex - 1;
                    return {
                        dayOfWeekIso: dateItem.dayOfWeekIso, // Предполагаем, что бэкенд это возвращает
                        dayName: russianDayNames[russianIndex],
                        date: `${day}.${month}.${year}`,
                        rawDate: dateItem.date
                    };
                });
                setDates(updatedDates);
            } else {
                setDates([]);
            }

            setUserData(data.user || null);
            setRecords(data.records || {});
            setNotifications(data.notifications || []);
            setUserSubscriptions(data.subscriptions || []);
            setAvailableDirections(data.available_directions || []);

            // Загружаем комментарии ПОСЛЕ основных данных
            await fetchUserComments(token);

        } catch (error: any) {
            console.error('Ошибка запроса основных данных:', error);
            toast({ title: "Ошибка данных", description: error.message || "Не удалось загрузить данные кабинета.", variant: "destructive" });
        } finally {
            setIsLoadingData(false);
        }
    }, [weekOffset, toast, fetchUserComments]);

    useEffect(() => {
        fetchData();
    }, [fetchData]); // fetchData теперь обернут в useCallback

    const getReviewForRecord = useCallback((recordId?: number): UserComment | null => {
        if (typeof recordId !== 'number' || !userComments || userComments.length === 0) {
            return null;
        }
        // Убедимся, что сравнение идет чисел с числами
        return userComments.find(comment => typeof comment.id_record === 'number' && comment.id_record === recordId) || null;
    }, [userComments]);

    const handleViewSpecificComment = (comment: UserComment) => {
        setViewingComment(comment);
    };

    const openReviewForm = (teacherId: number, recordId: number) => {
        setReviewTarget({ teacherId, recordIdForContext: recordId });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // ... (код без изменений, но убедитесь, что userData не null)
        if (!userData) return;
        const token = localStorage.getItem('token');
        // ... остальной код ...
         setErrorMessages([]);
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:8000/api/update_user_data', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/signin';
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    const errorArray = Object.values(data.errors).flat() as string[];
                    setErrorMessages(errorArray);
                    toast({
                        title: "Ошибка валидации",
                        description: errorArray[0] || "Проверьте правильность введенных данных",
                        variant: "destructive",
                    });
                    return;
                }
                throw new Error(data.message || 'Ошибка обновления данных');
            }

            toast({
                title: "Успешно",
                description: "Данные успешно обновлены",
            });
            setSuccessMessage('Данные успешно обновлены');
            // Не нужно вызывать fetchData() здесь, если только не изменились данные, влияющие на userComments или records
            // Если изменилось только имя пользователя, например, то полный fetchData не обязателен.
            // Но для простоты можно оставить, если это не вызывает проблем с производительностью.
            const updatedUserData = { ...userData, ...data.user }; // Если бэк возвращает обновленного юзера
            setUserData(updatedUserData);


        } catch (error: any) {
            setErrorMessages([error.message]);
            toast({
                title: "Ошибка",
                description: error.message || "Ошибка обновления данных",
                variant: "destructive",
            });
        }
    };

    const handleConfirmNotification = async (notificationId: number) => {
        // ... (код без изменений)
         const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:8000/api/notification-read', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: notificationId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Ошибка подтверждения уведомления и нет JSON тела' }));
                throw new Error(errorData.message || 'Ошибка подтверждения уведомления');
            }
            toast({ title: "Успешно", description: "Уведомление подтверждено" });
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        } catch (error: any) {
            toast({ title: "Ошибка", description: error.message || "Ошибка подтверждения уведомления", variant: "destructive" });
        }
    };

    const handleCancelEvent = async (eventId: number) => {
        // ... (код без изменений, но после успеха вызывайте fetchData для обновления статуса)
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:8000/api/update-status-record', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: eventId, status: 'отменена' })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Ошибка отмены записи');
            }
            await fetchData(); // Обновляем все данные, включая записи
            toast({ title: "Успешно", description: data.message || "Запись отменена" });
        } catch (error: any) {
            toast({
                title: "Ошибка",
                description: error.message || "Не удалось отменить запись",
                variant: "destructive"
            });
        }
    };
    
    const handleReviewSubmitted = useCallback(async () => {
        setReviewTarget({ teacherId: null, recordIdForContext: null });
        const token = localStorage.getItem('token');
        if (token) {
            await fetchUserComments(token); // Повторно загружаем только комментарии
        }
        toast({ title: "Отзыв отправлен", description: "Спасибо за ваш отзыв!" });
    }, [fetchUserComments, toast]);

    const renderRating = (rating: number | string) => {
        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) return "Рейтинг не указан";
        return "★".repeat(numRating) + "☆".repeat(5 - numRating);
    };

    const handlePurchaseSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
        // ... (код без изменений, но после успеха вызывайте fetchData для обновления абонементов)
         e.preventDefault();
        if (!selectedDirectionId) {
            toast({ title: "Ошибка", description: "Пожалуйста, выберите направление.", variant: "destructive" });
            return;
        }
        setIsSubmittingSubscription(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:8000/api/subscriptions/purchase', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_direction: selectedDirectionId,
                    count_lessons: selectedLessonCount,
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    const errorMsg = Object.values(data.errors).flat().join(' ');
                    toast({ title: "Ошибка валидации", description: errorMsg, variant: "destructive" });
                } else {
                    toast({ title: "Ошибка", description: data.message || "Не удалось оформить абонемент.", variant: "destructive" });
                }
                throw new Error(data.message || 'Ошибка оформления абонемента');
            }

            toast({ title: "Успешно!", description: data.message });
            // Обновляем данные, чтобы получить новый список абонементов
            await fetchData(); 
            setShowSubscriptionModal(false);
            setSelectedDirectionId('');
        } catch (error: any) {
            console.error('Ошибка покупки абонемента:', error);
        } finally {
            setIsSubmittingSubscription(false);
        }
    };

    if (isLoadingData && !userData) { // Показываем загрузку только при первой загрузке данных
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow pt-20 flex items-center justify-center">
                    <p>Загрузка данных...</p> {/* Или ваш компонент-спиннер */}
                </main>
                <Footer />
            </div>
        );
    }
    
    if (!userData) { // Если данные не загрузились по какой-то причине (кроме первоначальной загрузки)
         return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow pt-20 flex items-center justify-center">
                    <p>Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.</p>
                </main>
                <Footer />
            </div>
        );
    }


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-20">
                <div className="py-6 bg-gray-50">
                    <div className="container-custom">
                        <h1 className="text-2xl font-serif uppercase">ЛИЧНЫЙ КАБИНЕТ</h1>
                    </div>
                </div>
                {notifications.length > 0 && (
                    <div className="fixed top-24 right-8 flex flex-col items-end space-y-4 z-50">
                        {notifications.map((notification) => (
                            <Alert
                                key={notification.id}
                                className="w-full max-w-sm bg-white text-gray-800 border border-gray-200 shadow-md rounded-xl"
                            >
                                <AlertDescription className="flex justify-between items-center">
                                    <span className="mr-4">{notification.content}</span>
                                    <Button
                                        size="sm"
                                        className="bg-green-500 hover:bg-green-600 text-white rounded-md"
                                        onClick={() => handleConfirmNotification(notification.id)}
                                    >
                                        Подтвердить
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                <div className="container-custom py-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                        <div className="flex justify-center">
                            <Avatar className="h-48 w-48 border-4 border-dance-light/20">
                                <AvatarImage src={userData.photo ? `http://localhost:8000/storage/${userData.photo}` : "/images/image 11.png"} alt="Аватар пользователя" />
                                <AvatarFallback className="bg-dance-light/30">
                                    <User className="h-20 w-20 text-gray-400" />
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="bg-white p-8 rounded-sm shadow-sm">
                            {successMessage && (
                                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                                    <AlertDescription>{successMessage}</AlertDescription>
                                </Alert>
                            )}
                            {errorMessages.length > 0 && !successMessage && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>
                                        <ul className="list-disc pl-4">
                                            {errorMessages.map((error, index) => (<li key={index}>{error}</li>))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500 mb-1 block">Имя</label>
                                    <Input type="text" placeholder="Имя" name="full_name" value={userData.full_name || ''} onChange={handleInputChange} className="w-full" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 mb-1 block">Телефон</label>
                                    <Input type="text" placeholder="Телефон" name="phone" value={userData.phone || ''} onChange={handleInputChange} className="w-full" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 mb-1 block">Email</label>
                                    <Input type="email" placeholder="Email" name="email" value={userData.email || ''} onChange={handleInputChange} className="w-full" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 mb-1 block">Дата рождения</label>
                                    <Input type="date" placeholder="Дата рождения" name="age" value={userData.age || ''} readOnly className="w-full bg-gray-50" />
                                </div>
                                <Button type="submit" className="w-full py-3 bg-dance-light hover:bg-dance text-black font-medium">
                                    ИЗМЕНИТЬ
                                </Button>
                            </form>
                        </div>
                    </div>

                    <div className="mb-10 border-b border-gray-200">
                        <nav className="flex space-x-1 justify-center" aria-label="Tabs">
                            <Button
                                variant={activeTab === 'schedule' ? "default" : "ghost"}
                                onClick={() => setActiveTab('schedule')}
                                className={`px-6 py-3 font-medium text-sm rounded-t-md ${activeTab === 'schedule' ? 'bg-dance text-white border-dance border-b-0' : 'text-gray-600 hover:text-dance hover:bg-gray-50'}`}
                            >
                                <CalendarDays className="h-5 w-5 mr-2" /> Мои Записи
                            </Button>
                            <Button
                                variant={activeTab === 'subscriptions' ? "default" : "ghost"}
                                onClick={() => setActiveTab('subscriptions')}
                                className={`px-6 py-3 font-medium text-sm rounded-t-md ${activeTab === 'subscriptions' ? 'bg-dance text-white border-dance border-b-0' : 'text-gray-600 hover:text-dance hover:bg-gray-50'}`}
                            >
                                <CreditCard className="h-5 w-5 mr-2" /> Мои Абонементы
                            </Button>
                        </nav>
                    </div>

                {activeTab === 'schedule' && (
                    <div className="mt-10 mb-16">
                        <h2 className="text-3xl font-serif uppercase text-center mb-6">МОИ ЗАПИСИ</h2>
                        <div className="bg-white p-4 rounded-sm shadow-sm overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr>
                                        {dates.map((dateInfo) => (
                                            <th key={dateInfo.rawDate} className="py-4 px-2 bg-gray-50 text-gray-600 font-medium">
                                                <div className="text-sm">{dateInfo.dayName}</div>
                                                <div>{dateInfo.date}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[0, 1, 2, 3].map((rowIndex) => ( // Предполагаем не более 4 записей в день в таблице
                                        <tr key={rowIndex}>
                                            {dates.map((dateInfo) => {
                                                const dayRecordsForDate = records[dateInfo.dayOfWeekIso] || [];
                                                // Фильтруем записи для конкретной даты, так как dayOfWeekIso может повторяться на разных неделях,
                                                // но в данном контексте weekOffset управляет этим. Для большей точности можно фильтровать по rawDate.
                                                const event = dayRecordsForDate.find((rec, idx) => rec.date_record === dateInfo.rawDate && idx === rowIndex) || dayRecordsForDate[rowIndex];
                                                // Упрощенный вариант, если порядок записей в records[dayOfWeekIso] соответствует отображению.
                                                // const event = (records[dateInfo.dayOfWeekIso] || [])[rowIndex];


                                                const isPast = event ? isPastLesson(dateInfo.rawDate, event.time_record) : false;
                                                let reviewButtonOrStatus = null;

                                                if (event) {
                                                    const teacherOfRecord = event.teacher;
                                                    const canLeaveReview = event.status === 'проведена' && teacherOfRecord && typeof teacherOfRecord.id === 'number';

                                                    if (event.status === 'отменена') {
                                                        reviewButtonOrStatus = <span className="text-gray-400 text-sm block">Отменено</span>;
                                                    } else if (canLeaveReview) {
                                                        const reviewForThisRecord = getReviewForRecord(event.id);
                                                        if (reviewForThisRecord) {
                                                            reviewButtonOrStatus = (
                                                                <div className="flex justify-center items-center space-x-1">
                                                                    <span className="text-green-500 text-xs flex items-center">
                                                                        <Check className="h-3 w-3 mr-0.5" /> Отзыв оставлен
                                                                    </span>
                                                                    <Button
                                                                        onClick={() => handleViewSpecificComment(reviewForThisRecord)}
                                                                        variant="outline" size="icon" className="h-6 w-6"
                                                                        title="Просмотреть ваш отзыв об этом занятии"
                                                                    > <Eye className="h-3 w-3" /> </Button>
                                                                </div>
                                                            );
                                                        } else {
                                                            reviewButtonOrStatus = (
                                                                <Button
                                                                    onClick={() => openReviewForm(teacherOfRecord!.id, event.id)}
                                                                    variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700 p-1"
                                                                    title="Оставить отзыв об этом занятии"
                                                                > <MessageSquare className="h-4 w-4 mr-1" /> Оставить отзыв </Button>
                                                            );
                                                        }
                                                    } else if (isPast && event.status !== 'проведена') {
                                                        reviewButtonOrStatus = <span className="text-yellow-600 text-sm block">Ожидает</span>;
                                                    } else if (!isPast && event.status !== 'отменена' && event.status !== 'проведена') {
                                                        reviewButtonOrStatus = (
                                                            <Button
                                                                onClick={() => handleCancelEvent(event.id)}
                                                                variant="destructive" size="xs" className="text-xs px-1.5 py-0.5"
                                                            > Отменить </Button>
                                                        );
                                                    } else {
                                                        reviewButtonOrStatus = <span className="text-gray-400 text-sm block">{event.status === 'проведена' ? 'Проведено' : event.status}</span>;
                                                    }
                                                }
                                                return (
                                                    <td key={`${dateInfo.rawDate}-${rowIndex}`} className="border p-2 h-24 align-top text-xs">
                                                        {event ? (
                                                            <div className="text-center flex flex-col justify-between h-full">
                                                                <div>
                                                                    <div className="font-medium mb-1">{event.time_record}</div>
                                                                    <div className="text-black-600">{event.teacher?.full_name || 'Нет данных'}</div>
                                                                    <div className="text-black-600">{event.direction?.name || 'Нет данных'}</div>
                                                                    <div className="flex items-center justify-center text-gray-500 mt-1">
                                                                        <Clock className="h-3 w-3 mr-1" /><span>1 час</span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1"> {reviewButtonOrStatus} </div>
                                                            </div>
                                                        ) : ( <div className="h-full w-full bg-gray-50/30"></div> )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex justify-between items-center mt-4">
                                <Button onClick={() => setWeekOffset(prev => prev - 1)} variant="outline" size="icon" disabled={isLoadingData}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => setWeekOffset(prev => prev + 1)} variant="outline" size="icon" disabled={isLoadingData}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                 {activeTab === 'subscriptions' && (
                        <div className="mt-10 mb-16">
                            <h2 className="text-3xl font-serif uppercase text-center mb-6">МОИ АБОНЕМЕНТЫ</h2>
                            <div className="text-center mb-8">
                                <Button
                                    onClick={() => {
                                        if (availableDirections.length === 0) {
                                            toast({ title: "Загрузка...", description: "Загружаем доступные направления. Попробуйте через секунду." });
                                        }
                                        setShowSubscriptionModal(true);
                                    }}
                                    className="bg-dance-light hover:bg-dance text-black py-3 px-6 text-base"
                                >
                                    <ShoppingBag className="h-5 w-5 mr-2" />
                                    Купить новый абонемент
                                </Button>
                            </div>
                            {userSubscriptions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userSubscriptions.map(sub => (
                                        <div key={sub.id} className="bg-white p-6 rounded-lg shadow-lg border border-dance-light/30">
                                            <h4 className="text-xl font-semibold text-dance mb-2">{sub.direction_name}</h4>
                                            <p className="text-gray-700">Количество занятий: <span className="font-medium">{sub.count_lessons}</span></p>
                                            <p className="text-gray-700">
                                                Статус: <span className={`font-medium ${sub.status === 'активный' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {sub.status === 'активный' ? 'Активен' : 'Неактивен'}
                                                </span>
                                            </p>
                                            <p className="text-gray-600 text-sm mt-1">Куплен: {formatDateInRussian(sub.created_at)}</p>
                                            {sub.expires_at_formatted && (
                                                <p className="text-gray-600 text-sm">Действителен до: {sub.expires_at_formatted}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4 bg-white rounded-md shadow p-6">У вас пока нет оформленных абонементов.</p>
                            )}
                        </div>
                    )}

                {reviewTarget.teacherId && reviewTarget.recordIdForContext && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                        <div className="bg-white rounded-lg max-w-md w-full mx-4">
                            <div className="relative">
                                <Button
                                    variant="ghost" size="sm" className="absolute right-2 top-2"
                                    onClick={() => setReviewTarget({ teacherId: null, recordIdForContext: null })}
                                > <X className="h-4 w-4" /> </Button>
                                <div className="p-4">
                                    <ReviewForm
                                        id_teacher={reviewTarget.teacherId}
                                        id_record_context={reviewTarget.recordIdForContext}
                                        onReviewSubmitted={handleReviewSubmitted}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewingComment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                        <div className="bg-white rounded-lg max-w-md w-full mx-4">
                            <div className="relative p-6">
                                <Button
                                    variant="ghost" size="sm" className="absolute right-2 top-2"
                                    onClick={() => setViewingComment(null)}
                                > <X className="h-4 w-4" /> </Button>
                                <h3 className="text-xl font-medium mb-4">Ваш отзыв</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-yellow-500 text-xl">{renderRating(viewingComment.rating)}</div>
                                        <div className="text-gray-500 text-sm">{formatDateInRussian(viewingComment.created_at)}</div>
                                    </div>
                                    <div className="mt-2 text-gray-700 whitespace-pre-wrap">{viewingComment.contant}</div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <Button onClick={() => setViewingComment(null)} className="bg-dance-light hover:bg-dance text-black">Закрыть</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                 {showSubscriptionModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[150]">
                            <div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-serif text-dance">Оформить абонемент</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowSubscriptionModal(false)} className="text-gray-500 hover:text-gray-800">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                {availableDirections.length > 0 ? (
                                    <form onSubmit={handlePurchaseSubscription} className="space-y-6">
                                        <div>
                                            <Label htmlFor="directionSelect" className="block text-sm font-medium text-gray-700 mb-1">
                                                Выберите направление
                                            </Label>
                                            <Select value={selectedDirectionId} onValueChange={setSelectedDirectionId} required>
                                                <SelectTrigger id="directionSelect" className="w-full">
                                                    <SelectValue placeholder="Направление..." />
                                                </SelectTrigger>
                                                 <SelectContent className="z-[200]"> {/* Увеличил z-index, если SelectContent перекрывается другими элементами */}
                                                     {availableDirections.map(dir => (
                                                         <SelectItem key={dir.id} value={String(dir.id)}>{dir.name}</SelectItem>
                                                     ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-gray-700 mb-2">
                                                Количество занятий
                                            </Label>
                                            <RadioGroup value={selectedLessonCount} onValueChange={setSelectedLessonCount} className="flex space-x-4">
                                                {['4', '8', '12'].map(count => (
                                                    <div key={count} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={count} id={`lessons-${count}`} />
                                                        <Label htmlFor={`lessons-${count}`} className="font-normal">{count} занятий</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                        <Button type="submit" className="w-full py-3 bg-dance hover:bg-dance-dark text-white font-semibold text-base" disabled={isSubmittingSubscription || isLoadingData}>
                                            {isSubmittingSubscription ? 'Оформление...' : 'Оформить абонемент'}
                                        </Button>
                                    </form>
                                ) : (
                                    <p className="text-center text-gray-600">Нет доступных направлений для оформления абонемента в данный момент.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </motion.div>
    );
};

export default UserDashboard;
