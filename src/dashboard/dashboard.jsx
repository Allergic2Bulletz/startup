import React, { useState, useEffect, useMemo } from 'react';
import '../app.css'; // Import shared styles
import styles from './dashboard.module.css';
import AddBookmarkModal from '../modals/AddBookmarkModal';
import AddReminderModal from '../modals/AddReminderModal';
import TimeConverter from './timeConverter';
import BookmarkTile from './bookmarkTile';
import ReminderTile from './reminderTile';
import useBookmarks from '../hooks/useBookmarks';
import useReminders from '../hooks/useReminders';

export default function Dashboard({ currentAuthState }) {
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [customTime, setCustomTime] = useState('');
    const [customDate, setCustomDate] = useState('');
    
    // Bookmark management
    const { bookmarks, addBookmark, updateBookmark, deleteBookmark, moveBookmark, exportBookmark } = useBookmarks({ currentAuthState });
    
    // Reminder management
    const { reminders, addReminder, updateReminder, deleteReminder, moveReminder, exportReminder, checkReminders } = useReminders({ currentAuthState });

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // todo - this will be replaced with websocket for users later
        const reminderTimer = setInterval(() => {
            checkReminders();
        }, 1000);

        // Cleanup interval on component unmount
        return () => {
            clearInterval(timer);
            clearInterval(reminderTimer);
        };
    }, []);

    // Check if custom time/date is valid and create reference time
    const getReference = () => {
        const hasCustomTime = customTime.trim() !== '';
        const hasCustomDate = customDate.trim() !== '';
        
        if (!hasCustomTime && !hasCustomDate) {
            return { referenceTime: currentTime, forecasting: false };
        }

        const now = new Date();
        let targetDate;

        if (hasCustomDate && hasCustomTime) {
            // Both date and time provided
            targetDate = new Date(`${customDate}T${customTime}`);
        } else if (hasCustomTime && !hasCustomDate) {
            // Time provided, use today's date
            const today = now.toISOString().split('T')[0]; // Get YYYY-MM-DD
            targetDate = new Date(`${today}T${customTime}`);
        } else if (hasCustomDate && !hasCustomTime) {
            // Date provided, use current time
            const currentTimeStr = now.toTimeString().split(' ')[0]; // Get HH:MM:SS
            targetDate = new Date(`${customDate}T${currentTimeStr}`);
        }

        return { 
            referenceTime: targetDate, 
            forecasting: true 
        };
    };

    const { referenceTime, forecasting } = getReference();

    const handleSaveBookmark = (bookmarkData) => {
        console.log('Saving bookmark:', bookmarkData);
        const {name, timezone} = bookmarkData;
        addBookmark({ name, timezone });
        // Add your bookmark saving logic here
    };

    const handleSaveReminder = (reminderData) => {
        console.log('Saving reminder:', reminderData);
        const { title, datetime, timezone } = reminderData;
        addReminder({ title, datetime, timezone });
    };

    const handleSavePreferences = (preferencesData) => {
        console.log('Saving preferences:', preferencesData);
        // Add your preferences saving logic here
    };

    return (
        <main className={styles.main}>
        {/* Core functionality container */}
        <div className={styles.coreContainer}>
            <TimeConverter 
                currentTime={currentTime} 
                customTime={customTime}
                customDate={customDate}
                onCustomTimeChange={setCustomTime}
                onCustomDateChange={setCustomDate}
            />

            {/* Bookmarks container */}
            <section className={styles.bookmarksContainer}>
                <h2>Bookmarked Time Zones</h2>
                <button className={styles.addElementButton} id="add-bookmark-btn" onClick={() => setShowBookmarkModal(true)}>+ Add Bookmark</button>
                
                <div className={styles.bookmarksGrid}>
                    {bookmarks.map(bookmark => (
                        <BookmarkTile 
                            key={bookmark.id}
                            bookmark={bookmark}
                            referenceTime={referenceTime} 
                            forecasting={forecasting}
                            onUpdate={(changes) => updateBookmark(bookmark.id, changes)}
                            onDelete={() => deleteBookmark(bookmark.id)}
                            onMoveUp={() => moveBookmark(bookmark.id, 'up')}
                            onMoveDown={() => moveBookmark(bookmark.id, 'down')}
                            onExport={() => exportBookmark(bookmark.id)}
                        />
                    ))}
                </div>
            </section>
        </div>

        {/* Reminders container */}
        <section className={styles.remindersContainer}>
            <h2>Reminders</h2>
            <button className={styles.addElementButton} id="add-reminder-btn" onClick={() => setShowReminderModal(true)}>+ Add Reminder</button>
            
            <div className={styles.remindersGrid}>
                {reminders.map(reminder => (
                    <ReminderTile
                        key={reminder.id}
                        reminder={reminder}
                        onUpdate={(changes) => updateReminder(reminder.id, changes)}
                        onDelete={() => deleteReminder(reminder.id)}
                        onMoveUp={() => moveReminder(reminder.id, 'up')}
                        onMoveDown={() => moveReminder(reminder.id, 'down')}
                        onExport={() => exportReminder(reminder.id)}
                    />
                ))}
            </div>
        </section>
        <AddBookmarkModal
                isOpen={showBookmarkModal}
                onClose={() => setShowBookmarkModal(false)}
                onSave={handleSaveBookmark}
            />
            
        <AddReminderModal
                isOpen={showReminderModal}
                onClose={() => setShowReminderModal(false)}
                onSave={handleSaveReminder}
            />
    </main>    
    );
}