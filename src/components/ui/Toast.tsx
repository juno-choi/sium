'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Toast {
    id: string;
    type: 'success' | 'error';
    message: string;
}

interface ToastContextType {
    showToast: (type: 'success' | 'error', message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: 'success' | 'error', message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-3 z-[60] flex flex-col items-end pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] transform transition-all duration-300 animate-slide-up ${toast.type === 'success'
                                ? 'bg-white border-l-4 border-green-500 text-gray-800'
                                : 'bg-white border-l-4 border-red-500 text-gray-800'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <span className="flex-1 font-medium">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Return a dummy implementation if context fails, to avoid breaking the app (or throw)
        // But throwing is better for development
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
