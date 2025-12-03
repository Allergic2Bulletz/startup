import React from 'react';
import styles from './notificationBanner.module.css';

const NotificationBanner = ({ notification, onClose }) => {
    if (!notification) return null;

    const { message, notificationType } = notification;
    
    // Get the appropriate CSS class for the notification type
    const bannerClass = `${styles.banner} ${styles[notificationType] || styles.default}`;

    return (
        <div className={bannerClass}>
            <div className={styles.message}>
                {message}
            </div>
            <button 
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close notification"
            >×</button>
        </div>
    );
};

export default NotificationBanner;