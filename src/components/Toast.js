'use client';
import { useApp } from '@/context/AppContext';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ToastContainer() {
  const { notifications } = useApp();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map(n => (
        <Toast key={n.id} notification={n} />
      ))}
    </div>
  );
}

function Toast({ notification }) {
  const { type, message } = notification;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 4600);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type} animate-slide-in`}>
      <div className="toast-icon">
        {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
}
