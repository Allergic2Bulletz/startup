import { useState, useEffect, useCallback, useMemo, use } from 'react';

const useReminders = () => {
    const [reminders, setReminders] = useState([]);

    // Load reminders from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('reminders');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setReminders(parsed);
            } catch (error) {
                console.error('Failed to load reminders from localStorage:', error);
            }
        }
    }, []);

    // Auto-save to localStorage when reminders change
    useEffect(() => {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }, [reminders]);

    // Get active (non-deleted) reminders, sorted by order index
    const activeReminders = useMemo(() => 
        reminders
            .filter(reminder => !reminder.deleted)
            .sort((a, b) => a.order - b.order),
        [reminders]
    );

    const addReminder = useCallback((reminderData) => {
        const maxOrder = reminders
            .filter(r => !r.deleted)
            .reduce((max, r) => Math.max(max, r.order || 0), -1);
        
        const newReminder = {
            id: crypto.randomUUID(),
            title: reminderData.title,
            datetime: reminderData.datetime,
            timezone: reminderData.timezone,
            deleted: false,
            order: maxOrder + 1,
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
        const active = reminders.filter(r => !r.deleted).sort((a, b) => a.order - b.order);
        const currentIndex = active.findIndex(r => r.id === id);
        
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' 
            ? Math.max(0, currentIndex - 1)
            : Math.min(active.length - 1, currentIndex + 1);
            
        if (newIndex === currentIndex) return;
        
        // Swap order values between current and target reminders
        const current = active[currentIndex];
        const target = active[newIndex];
        
        setReminders(prev => prev.map(reminder => {
            if (reminder.id === current.id) {
                return { ...reminder, order: target.order, modifiedAt: new Date().toISOString() };
            }
            if (reminder.id === target.id) {
                return { ...reminder, order: current.order, modifiedAt: new Date().toISOString() };
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