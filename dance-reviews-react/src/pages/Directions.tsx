
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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

const Directions = () => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [pagination, setPagination] = useState<PaginationLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDirections('http://localhost:8000/api/direction');
  }, []);

  const fetchDirections = async (url: string) => {
    setLoading(true);
    try {
      const response = await axios.get(url);
      const { data, links } = response.data;
      setDirections(data);
      setPagination(links);
    } catch (error) {
      console.error('Ошибка при загрузке направлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (url: string | null) => {
    if (url) fetchDirections(url);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <div className="py-6 bg-gray-50">
          <div className="container-custom">
            <h1 className="text-2xl font-serif uppercase">НАПРАВЛЕНИЯ</h1>
          </div>
        </div>

        <div className="container-custom py-12">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-dance-dark" />
            </div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-10"
              >
                {directions.map((direction) => (
                  <motion.div
                    key={direction.id}
                    variants={itemVariants}
                    className="flex flex-col md:flex-row gap-6 p-6 rounded-xl border-2 border-dance hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="md:w-1/3 overflow-hidden rounded-lg">
                      <img
                        src={`http://localhost:8000/${direction.photo}`}
                        alt={direction.name}
                        className="w-full h-80 object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/images/defolt.png";
                        }}
                      />
                    </div>
                    <div className="md:w-2/3 flex flex-col justify-center">
                      <h2 className="text-2xl md:text-3xl font-serif mb-4">{direction.name}</h2>
                      <p className="text-gray-700">{direction.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {pagination.length > 0 && (
                <div className="mt-10">
                  <Pagination>
                    <PaginationContent>
                      {pagination.map((link, index) => {
                        // Previous link
                        if (index === 0) {
                          return (
                            <PaginationItem key={index}>
                              <PaginationPrevious
                                onClick={() => handlePageChange(link.url)}
                                className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          );
                        }
                        // Next link
                        else if (index === pagination.length - 1) {
                          return (
                            <PaginationItem key={index}>
                              <PaginationNext
                                onClick={() => handlePageChange(link.url)}
                                className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          );
                        }
                        // Number links
                        else {
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
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Directions;
