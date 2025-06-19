
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AlertMessageProps {
  type: 'success' | 'error' | '';
  message: string;
  onDismiss?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, onDismiss }) => {
  useEffect(() => {
    if (message && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <Alert 
      variant={type === 'error' ? "destructive" : "default"}
      className={`mb-4 ${type === 'success' ? "bg-green-50 text-green-800 border-green-200" : ""}`}
    >
      {type === 'success' ? (
        <CheckCircle className="h-4 w-4 mr-2" />
      ) : (
        <AlertCircle className="h-4 w-4 mr-2" />
      )}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default AlertMessage;
