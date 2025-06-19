
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface CommentsPaginationProps {
  links: PaginationLink[];
  onPageChange: (url: string | null) => void;
}

const CommentsPagination: React.FC<CommentsPaginationProps> = ({ links, onPageChange }) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex justify-center mt-6">
      <Pagination>
        <PaginationContent>
          {links.map((link, index) => {
            if (index === 0) {
              return (
                <PaginationItem key={index}>
                  <PaginationPrevious
                    onClick={() => onPageChange(link.url)}
                    className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              );
            } else if (index === links.length - 1) {
              return (
                <PaginationItem key={index}>
                  <PaginationNext
                    onClick={() => onPageChange(link.url)}
                    className={!link.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              );
            } else {
              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={link.active}
                    onClick={() => onPageChange(link.url)}
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
  );
};

export default CommentsPagination;
