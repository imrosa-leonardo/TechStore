import { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
}, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((msg) => addToast('Sucesso', msg), [addToast]);
    const error = useCallback((msg) => addToast('Erro', msg), [addToast]);
    const info = useCallback((msg) => addToast('Info', msg), [addToast]);

    return (
    <ToastContext.Provider value={{ toasts, success, error, info, removeToast }}>
        {children}
    </ToastContext.Provider>
    );

}