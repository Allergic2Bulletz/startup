import { useState, useEffect, useCallback } from 'react';
import { AuthState } from './useAuthState.js';

const defaultPreferences = {
    theme: 'blue', // 'blue' or 'black'
    // timeFormat: '12', // '12' or '24'
    // showSeconds: false,
    // defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: true,
    reminderSound: true,
    modifiedAt: new Date().toISOString()
};

const usePreferences = ( currentAuthState, showNotification, wsClient ) => {
    const [preferences, setPreferences] = useState(defaultPreferences);

    const fetchPreferences = async () => {
        try {
            const response = await fetch('/api/prefs');
            if (!response.ok) {
                console.error('Failed to fetch preferences');
                return;
            }
            const data = await response.json();
            setPreferences(prevPrefs => ({...prevPrefs, ...data}));
        } catch (error) {
            console.error('Error fetching preferences:', error);
        }
    };

    // Load preferences from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('preferences');
        if (saved && currentAuthState !== AuthState.Authenticated) {
            try {
                const parsed = JSON.parse(saved);
                setPreferences(prevPrefs => (parsed ? parsed : prevPrefs));
            } catch (error) {
                console.error('Failed to load preferences from localStorage:', error);
            }
        }

        if (currentAuthState === AuthState.Authenticated) {
            // Force complete reset to defaultPreferences, clearing any extra fields from localStorage
            setPreferences(defaultPreferences);
            fetchPreferences();
        }
    }, [currentAuthState]);

    // Stable handler function for WebSocket commands
    const handleSync = useCallback((command) => {
        if(command.target !== 'preferences') return;
        if(command.action !== 'sync') return;
        fetchPreferences();
    }, []);

    // Initialize wsClient handlers
    useEffect(() => {
        if (wsClient.current) {
            wsClient.current.addHandler(handleSync);

            return () => {
                wsClient.current?.removeHandler(handleSync);
                console.log('🧹 Cleaned up preferences wsClient handlers');
            };
        }
    }, [wsClient.current, handleSync]);

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
        setPreferences(() => ({ ...defaultPreferences }));
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
                return;
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