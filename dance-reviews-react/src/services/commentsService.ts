
interface Comment {
  id: number;
  contant: string;
  status: string;
  user?: {
    id: number;
    full_name: string;
  };
}

interface CommentsPaginationResponse {
  data: Comment[];
  current_page: number;
  last_page: number;
  per_page: number;
  first_page_url: string;
  last_page_url: string;
  path: string;
}

export async function fetchComments(status: string = '', url?: string): Promise<CommentsPaginationResponse> {
  // Use the proxy setup in vite.config.ts to avoid CORS issues
  const apiUrl = url || `/api/admin/comment${status && status !== 'all' ? `?status=${status}` : ''}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  
  return await response.json();
}

export async function updateCommentStatus(commentId: number, newStatus: string): Promise<void> {
  const response = await fetch(`/api/admin/comments/update/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update comment status');
  }
}
