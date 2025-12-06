import { useState, useEffect, useCallback } from 'react';
import { AuthState } from './useAuthState.js';

const defaultPreferences = {
    theme: 'light', // 'light' or 'dark'
    timeFormat: '12', // '12' or '24'
    showSeconds: false,
    defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: true,
    reminderSound: true,
    modifiedAt: null
};

const usePreferences = ( currentAuthState, showNotification ) => {
    const [preferences, setPreferences] = useState(defaultPreferences);

    // Load preferences from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('preferences');
        if (saved && currentAuthState !== AuthState.Authenticated) {
            try {
                const parsed = JSON.parse(saved);
                setPreferences(prevPrefs => ({ ...prevPrefs, ...parsed }));
            } catch (error) {
                console.error('Failed to load preferences from localStorage:', error);
            }
        }

        const fetchPreferences = async () => {
            try {
                const response = await fetch('/api/prefs');
                if (!response.ok) {
                    console.error('Failed to fetch preferences');
                    return;
                }
                const data = await response.json();
                setPreferences(prevPrefs => ({ ...prevPrefs, ...data }));
            } catch (error) {
                console.error('Error fetching preferences:', error);
            }
        };

        if (currentAuthState === AuthState.Authenticated) {
            fetchPreferences();
        }
    }, [currentAuthState]);

    // Auto-save to localStorage when preferences change
    useEffect(() => {
        if (currentAuthState !== AuthState.Authenticated) {
            localStorage.setItem('preferences', JSON.stringify(preferences));
        }
    }, [preferences, currentAuthState]);

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

    const updateRemote = async (newPrefs) => {
        try {
            const response = await fetch('/api/prefs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPrefs)
            });
            if (!response.ok) {
                console.error('Failed to update preferences on server');
                showNotification('Failed to update preferences on server', 'error');
            }

            // We get modified-at from server response
            const data = await response.json();
            setPreferences(prev => ({
                ...prev,
                ...data
            }));
        } catch (error) {
            console.error('Error updating preferences:', error);
            showNotification('Error updating preferences on server', 'error');
        }
    };

    const resetRemote = async () => {
        try {
            const response = await fetch('/api/prefs', {
                method: 'DELETE'
            });
            if (!response.ok) {
                console.error('Failed to reset preferences on server');
                showNotification('Failed to reset preferences on server', 'error');
            }
            setPreferences(defaultPreferences);
        } catch (error) {
            console.error('Error resetting preferences on server:', error);
            showNotification('Error resetting preferences on server', 'error');
        }
    };

    if (currentAuthState === AuthState.Authenticated) {
        return {
            preferences,
            updatePreferences: updateRemote,
            resetPreferences: resetRemote
        };
    }

    return {
        preferences,
        updatePreferences,
        resetPreferences
    };
};

export default usePreferences;