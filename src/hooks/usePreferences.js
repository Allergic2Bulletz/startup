import { useState, useEffect, useCallback } from 'react';

const usePreferences = () => {
    const [preferences, setPreferences] = useState({
        theme: 'light', // 'light' or 'dark'
        timeFormat: '12', // '12' or '24'
        showSeconds: false,
        defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifications: true,
        reminderSound: true
    });

    // Load preferences from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('preferences');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setPreferences(prevPrefs => ({ ...prevPrefs, ...parsed }));
            } catch (error) {
                console.error('Failed to load preferences from localStorage:', error);
            }
        }
    }, []);

    // Auto-save to localStorage when preferences change
    useEffect(() => {
        localStorage.setItem('preferences', JSON.stringify(preferences));
    }, [preferences]);

    const updatePreferences = useCallback((changes) => {
        setPreferences(prev => ({
            ...prev,
            ...changes,
            modifiedAt: new Date().toISOString()
        }));
    }, []);

    const resetPreferences = useCallback(() => {
        const defaultPrefs = {
            theme: 'light',
            timeFormat: '12',
            showSeconds: false,
            defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notifications: true,
            reminderSound: true
        };
        setPreferences(defaultPrefs);
    }, []);

    const exportPreferences = useCallback(() => {
        const dataStr = JSON.stringify(preferences, null, 2);
        navigator.clipboard.writeText(dataStr);
        // TODO: Push notification banner with message "Preferences exported to clipboard"
    }, [preferences]);

    return {
        preferences,
        updatePreferences,
        resetPreferences,
        exportPreferences
    };
};

export default usePreferences;