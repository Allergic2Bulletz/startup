import React, { useState, useEffect, useMemo } from 'react';
import '../app.css'; // Import shared styles
import styles from './dashboard.module.css';
import AddBookmarkModal from '../modals/AddBookmarkModal';
import AddReminderModal from '../modals/AddReminderModal';
import TimeConverter from './timeConverter';
import BookmarkTile from './bookmarkTile';
import useBookmarks from '../hooks/useBookmarks';

export default function Dashboard() {
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [customTime, setCustomTime] = useState('');
    const [customDate, setCustomDate] = useState('');
    
    // Bookmark management
    const { bookmarks, addBookmark, updateBookmark, deleteBookmark, moveBookmark } = useBookmarks();

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(timer);
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
        // Add your reminder saving logic here
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
                {/* Placeholder reminders */}
                <div className={styles.tile}>
                    <div className={styles.tileHeader}>
                        <h4>Call Mom</h4>
                        <div className={styles.tileControls}>
                            <button className={styles.moveUpBtn}>↑</button>
                            <button className={styles.moveDownBtn}>↓</button>
                            <button className={styles.deleteElementButton}>×</button>
                        </div>
                    </div>
                    <div className={styles.tileContent}>
                        <span>Today at 3:00 PM</span>
                        <button className={styles.copyReminderBtn}>⧉</button>
                    </div>
                </div>
                
                <div className={styles.tile}>
                    <div className={styles.tileHeader}>
                        <h4>Team Meeting</h4>
                        <div className={styles.tileControls}>
                            <button className={styles.moveUpBtn}>↑</button>
                            <button className={styles.moveDownBtn}>↓</button>
                            <button className={styles.deleteElementButton}>×</button>
                        </div>
                    </div>
                    <div className={styles.tileContent}>
                        <span>Nov 29 at 10:00 AM</span>
                        <button className={styles.copyReminderBtn}>⧉</button>
                    </div>
                </div>
                
                <div className={styles.tile}>
                    <div className={styles.tileHeader}>
                        <h4>Birthday Call</h4>
                        <div className={styles.tileControls}>
                            <button className={styles.moveUpBtn}>↑</button>
                            <button className={styles.moveDownBtn}>↓</button>
                            <button className={styles.deleteElementButton}>×</button>
                        </div>
                    </div>
                    <div className={styles.tileContent}>
                        <span>Dec 1 at 2:00 PM</span>
                        <button className={styles.copyReminderBtn}>⧉</button>
                    </div>
                </div>
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