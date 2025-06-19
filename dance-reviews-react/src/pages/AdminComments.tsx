
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Header from "@/components/Header";
import Footer from '@/components/Footer';
import CommentStatusFilter from '@/components/admin/CommentStatusFilter';
import CommentsList from '@/components/admin/CommentsList';
import CommentsPagination from '@/components/admin/CommentsPagination';
import { fetchComments, updateCommentStatus } from '@/services/commentsService';
import { useToast } from "@/hooks/use-toast";

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

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

interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  perPage: number;
}

const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [paginationLinks, setPaginationLinks] = useState<PaginationLink[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    lastPage: 1,
    perPage: 5
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadComments = async (url?: string) => {
    setLoading(true);
    try {
      const data = await fetchComments(status === "all" ? "" : status, url);
      
      if (data?.data) {
        setComments(data.data);
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
            url: `${data.path}?page=${i + 1}${status && status !== "all" ? `&status=${status}` : ''}`,
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
      console.error('Error fetching comments:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить отзывы",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [status]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
  };

  const handleStatusUpdate = async (commentId: number, newStatus: string) => {
    try {
      await updateCommentStatus(commentId, newStatus);
      toast({
        title: "Успех",
        description: "Статус отзыва обновлен",
        variant: "default"
      });
      loadComments();
    } catch (error) {
      console.error('Error updating comment status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус отзыва",
        variant: "destructive"
      });
    }
  };

  const handlePageChange = (url: string | null) => {
    if (url) {
      loadComments(url);
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
            <h1 className="text-3xl md:text-4xl font-serif text-center mb-4 md:mb-0">УПРАВЛЕНИЕ ОТЗЫВАМИ</h1>
            <div className="w-full md:w-64">
              <CommentStatusFilter value={status} onValueChange={handleStatusChange} />
            </div>
          </div>
        </div>
      </div>
      
      <main className="container-custom py-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-dance-dark" />
          </div>
        ) : (
          <>
            <CommentsList 
              comments={comments} 
              currentPage={paginationInfo.currentPage} 
              perPage={paginationInfo.perPage} 
              onStatusUpdate={handleStatusUpdate} 
            />
            
            {paginationLinks.length > 0 && comments.length > 0 && (
              <CommentsPagination links={paginationLinks} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </main>
      
      <Footer />
    </motion.div>
  );
};

export default AdminComments;
