import { useState, useCallback, useEffect, useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext.js';

const useNotifications = () => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, notificationType = 'default', autoClose = true) => {
        const newNotification = {
            message,
            notificationType,
            autoClose
        };
        setNotification(newNotification);
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    // Auto-close functionality
    useEffect(() => {
        if (notification && notification.autoClose) {
            const timer = setTimeout(() => {
                hideNotification();
            }, 5000); // 5 seconds

            return () => clearTimeout(timer);
        }
    }, [notification, hideNotification]);

    return {
        notification,
        showNotification,
        hideNotification
    };
};

// Custom hook to access notification context from any component
export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationContext.Provider');
    }
    return context;
};

export default useNotifications;