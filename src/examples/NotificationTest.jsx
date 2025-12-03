// Example usage file for testing notifications
import React from 'react';
import { useNotificationContext } from '../hooks/useNotifications.js';

const NotificationTest = () => {
    const { showNotification } = useNotificationContext();

    const testNotifications = () => {
        // Test different notification types
        showNotification("This is a default notification", "default", true);
        
        setTimeout(() => {
            showNotification("Success! Operation completed.", "success", true);
        }, 1000);
        
        setTimeout(() => {
            showNotification("Error! Something went wrong.", "error", true);
        }, 2000);
        
        setTimeout(() => {
            showNotification("Warning: Please check your settings.", "warning", true);
        }, 3000);
        
        setTimeout(() => {
            showNotification("Info: This notification won't auto-close.", "info", false);
        }, 4000);
    };

    return (
        <div>
            <button onClick={testNotifications}>Test Notifications</button>
            <p>Click to test all notification types</p>
        </div>
    );
};

export default NotificationTest;