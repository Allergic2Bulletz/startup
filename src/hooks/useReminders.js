import { useState, useEffect, useCallback, useMemo, use } from 'react';
import { getDatetimeForTimezone } from '../utils/timeUtils.js';
import { AuthState } from '../hooks/useAuthState.js';
import { useNotificationContext } from './useNotifications.js';

const useReminders = ({ currentAuthState }) => {
    const [reminders, setReminders] = useState([]);
    const { showNotification } = useNotificationContext();

    // Load reminders from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('reminders');
        if (saved && currentAuthState !== AuthState.Authenticated) {
            try {
                const parsed = JSON.parse(saved);
                setReminders(parsed);
            } catch (error) {
                console.error('Failed to load reminders from localStorage:', error);
            }
        }

        const fetchReminders = async () => {
            try {
                const response = await fetch('/api/reminders');
                if (!response.ok) {
                    console.error('Failed to fetch reminders');
                    showNotification('Failed to fetch reminders', 'error', true);
                    return;
                }
                const data = await response.json();
                setReminders(data || []);
            } catch (error) {
                console.error('Error fetching reminders:', error);
                showNotification('Error fetching reminders', 'error', true);
            }
        };

        if (currentAuthState === AuthState.Authenticated) {
            fetchReminders();
        }
    }, [currentAuthState]);

    // Auto-save to localStorage when reminders change
    useEffect(() => {
        if (currentAuthState !== AuthState.Authenticated) {
            localStorage.setItem('reminders', JSON.stringify(reminders));
        }
    }, [reminders, currentAuthState]);

    // Get active (non-deleted) reminders, sorted by index
    const activeReminders = useMemo(() => 
        reminders
            .filter(reminder => !reminder.deleted)
            .sort((a, b) => a.index - b.index),
        [reminders]
    );

    const addReminder = useCallback((reminderData) => {
        const maxOrder = reminders
            .filter(r => !r.deleted)
            .reduce((max, r) => Math.max(max, r.index || 0), -1);
        
        const finalDateTime = getDatetimeForTimezone(reminderData.datetime, reminderData.timezone);
        
        const newReminder = {
            id: crypto.randomUUID(),
            title: reminderData.title,
            datetime: finalDateTime,
            timezone: reminderData.timezone,
            deleted: false,
            index: maxOrder + 1,
            modifiedAt: new Date().toISOString()
        };
        setReminders(prev => [...prev, newReminder]);
    }, [reminders]);

    const updateReminder = useCallback((id, changes) => {
        setReminders(prev => prev.map(reminder => 
            reminder.id === id 
                ? { 
                    ...reminder, 
                    ...changes, 
                    modifiedAt: new Date().toISOString() 
                }
                : reminder
        ));
    }, []);

    const deleteReminder = useCallback((id) => {
        setReminders(prev => prev.map(reminder => 
            reminder.id === id 
                ? { 
                    ...reminder, 
                    deleted: true, 
                    modifiedAt: new Date().toISOString() 
                }
                : reminder
        ));
    }, []);

    const moveReminder = useCallback((id, direction) => {
        const active = reminders.filter(r => !r.deleted).sort((a, b) => a.index - b.index);
        const currentIndex = active.findIndex(r => r.id === id);
        
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' 
            ? Math.max(0, currentIndex - 1)
            : Math.min(active.length - 1, currentIndex + 1);
            
        if (newIndex === currentIndex) return;
        
        // Swap index values between current and target reminders
        const current = active[currentIndex];
        const target = active[newIndex];
        
        setReminders(prev => prev.map(reminder => {
            if (reminder.id === current.id) {
                return { ...reminder, index: target.index, modifiedAt: new Date().toISOString() };
            }
            if (reminder.id === target.id) {
                return { ...reminder, index: current.index, modifiedAt: new Date().toISOString() };
            }
            return reminder;
        }));
    }, [reminders]);

    const exportReminder = useCallback((id) => {
        // Get the reminder data and copy the JSON string to clipboard
        const active = reminders.filter(r => !r.deleted)
        const reminder = active.find(r => r.id === id && !r.deleted);
        if (!reminder) return null;
        const dataStr = JSON.stringify({title: reminder.title, datetime: reminder.datetime, timezone: reminder.timezone}, null, 2);
        navigator.clipboard.writeText(dataStr);
        // TODO Push notification banner w/ message "Exported to clipboard"
    }, [reminders]);

    const checkReminders = useCallback(() => {
        const now = new Date();
        const activeReminders = reminders.filter(r => !r.deleted);
        
        activeReminders.forEach(reminder => {
            const reminderDate = new Date(reminder.datetime);
            if (now >= reminderDate && !reminder.expired) {
                updateReminder(reminder.id, { expired: true });
            }
        });
    }, [reminders, updateReminder]);

    const createRemote = async (reminder) => {
        try {
            const response = await fetch('/api/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reminder)
            });
            if (!response.ok) {
                console.error('Failed to create remote reminder');
                showNotification('Failed to create remote reminder', 'error', true);
                return null;
            }
            const newReminder = await response.json();
            setReminders(prev => [...prev, newReminder]);
            return;
        } catch (error) {
            console.error('Error creating remote reminder:', error);
            showNotification('Error creating remote reminder', 'error', true);
            return null;
        }
    };

    const updateRemote = async (id, changes) => {
        const response = await fetch('/api/reminders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, changes })
        });
        if (!response.ok) {
            console.error('Failed to update reminder');
            showNotification('Failed to update reminder', 'error', true);
            return;
        }
        const updatedReminder = await response.json();
        setReminders(prev => prev.map(reminder => reminder.id === id ? updatedReminder : reminder));
    }

    const deleteRemote = async (id) => {
        const response = await fetch('/api/reminders', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (!response.ok) {
            console.error('Failed to delete reminder');
            showNotification('Failed to delete reminder', 'error', true);
            return;
        }
        const deletedReminder = await response.json();
        setReminders(prev => prev.map(reminder => reminder.id === id ? deletedReminder : reminder));
    }

    const moveRemote = async (index, direction) => {
        // Find BOTH reminders being swapped and send to server
        const indexMod = direction === 'up' ? -1 : 1;
        const currArrayIndex = activeReminders.findIndex(r => r.order === index);
        if (currArrayIndex + indexMod < 0 || currArrayIndex + indexMod >= activeReminders.length) return;
        const current = activeReminders[currArrayIndex];
        const target = activeReminders[currArrayIndex + indexMod];

        const response = await fetch('/api/reminders/swap', {    
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: current.order, to: target.order })
        });
        if (response.status === 409) {
            return; // no-op on conflict
        }
        if (!response.ok) {
            console.error('Failed to move reminder');
            showNotification('Failed to move reminder', 'error', true);
            return;
        }

        // note - response contains the timestamp of execution, we calculate the rest
        const data = (await response.json());

        const tempOrder = current.order;
        current.order = target.order;
        target.order = tempOrder;
        current.modifiedAt = data.modifiedAt;
        target.modifiedAt = data.modifiedAt;

        const updatedReminders = [current, target];
        setReminders(prev => prev.map(reminder => {
            const updated = updatedReminders.find(r => r.id === reminder.id);
            return updated ? updated : reminder;
        }));
    }

    // todo - this will be replaced with websocket later
    const checkRemoteReminders = () => {
        const now = new Date();
        const activeReminders = reminders.filter(r => !r.deleted);
        
        activeReminders.forEach(reminder => {
            const reminderDate = new Date(reminder.datetime);
            if (now >= reminderDate && !reminder.expired) {
                updateRemote(reminder.id, { expired: true });
            }
        });
    };

    if (currentAuthState === AuthState.Authenticated) {
        return {
            reminders: activeReminders,
            addReminder: createRemote,
            updateReminder: updateRemote,
            deleteReminder: deleteRemote,
            moveReminder: moveRemote,
            exportReminder,
            checkReminders: checkRemoteReminders
        };
    }

    return {
        reminders: activeReminders,
        addReminder,
        updateReminder,
        deleteReminder,
        moveReminder,
        exportReminder,
        checkReminders
    };
};

export default useReminders;