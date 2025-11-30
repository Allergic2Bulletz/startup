import React, { useState, useEffect } from 'react';
import '../app.css'; // Import shared styles
import styles from './dashboard.module.css';
import AddBookmarkModal from '../modals/AddBookmarkModal';
import AddReminderModal from '../modals/AddReminderModal';
import TimeConverter from './timeConverter';

export default function Dashboard() {
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(timer);
    }, []);

    const handleSaveBookmark = (bookmarkData) => {
        console.log('Saving bookmark:', bookmarkData);
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
            <TimeConverter currentTime={currentTime} />

            {/* Bookmarks container */}
            <section className={styles.bookmarksContainer}>
                <h2>Bookmarked Time Zones</h2>
                <button className={styles.addElementButton} id="add-bookmark-btn" onClick={() => setShowBookmarkModal(true)}>+ Add Bookmark</button>
                
                <div className={styles.bookmarksGrid}>
                    {/* Placeholder bookmarks */}
                    <div className={styles.bookmarkTile}>
                        <div className={styles.tileHeader}>
                            <h3>Mom (Chicago)</h3>
                            <div className={styles.tileControls}>
                                <button className={styles.moveUpBtn}>↑</button>
                                <button className={styles.moveDownBtn}>↓</button>
                                <button className={styles.deleteElementButton}>×</button>
                            </div>
                        </div>
                        <div className={styles.tileContent}>
                            <p>
                                <span className={styles.timeDisplay}>2:30 PM</span>
                                <span className={styles.dateDisplay}>Nov 28, 2025</span>
                            </p>
                            <select className={styles.timezoneSelect} defaultValue="America/Chicago">
                                <option value="America/Chicago">Central Time (Chicago)</option>
                                <option value="America/New_York">Eastern Time (New York)</option>
                                <option value="America/Denver">Mountain Time (Denver)</option>
                                <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                                <option value="Europe/London">GMT (London)</option>
                                <option value="Europe/Paris">CET (Paris)</option>
                                <option value="Asia/Tokyo">JST (Tokyo)</option>
                                <option value="Asia/Shanghai">CST (Shanghai)</option>
                                <option value="Australia/Sydney">AEST (Sydney)</option>
                            </select>
                        </div>
                        
                    </div>
                    
                    <div className={styles.bookmarkTile}>
                        <div className={styles.tileHeader}>
                            <h3>Tokyo Friends</h3>
                            <div className={styles.tileControls}>
                                <button className={styles.moveUpBtn}>↑</button>
                                <button className={styles.moveDownBtn}>↓</button>
                                <button className={styles.deleteElementButton}>×</button>
                            </div>
                        </div>
                        <div className={styles.tileContent}>
                            <p>
                                <span className={styles.timeDisplay}>4:30 AM</span>
                                <span className={styles.dateDisplay}>Nov 29, 2025</span>
                            </p>                            
                            <select className={styles.timezoneSelect} defaultValue="Asia/Tokyo">
                                <option value="Asia/Tokyo">JST (Tokyo)</option>
                                <option value="America/New_York">Eastern Time (New York)</option>
                                <option value="America/Chicago">Central Time (Chicago)</option>
                                <option value="America/Denver">Mountain Time (Denver)</option>
                                <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                                <option value="Europe/London">GMT (London)</option>
                                <option value="Europe/Paris">CET (Paris)</option>
                                <option value="Asia/Shanghai">CST (Shanghai)</option>
                                <option value="Australia/Sydney">AEST (Sydney)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className={styles.bookmarkTile}>
                        <div className={styles.tileHeader}>
                            <h3>London Office</h3>
                            <div className={styles.tileControls}>
                                <button className={styles.moveUpBtn}>↑</button>
                                <button className={styles.moveDownBtn}>↓</button>
                                <button className={styles.deleteElementButton}>×</button>
                            </div>
                        </div>
                        <div className={styles.tileContent}>
                            <p>
                                <span className={styles.timeDisplay}>8:30 PM</span>
                                <span className={styles.dateDisplay}>Nov 28, 2025</span>
                            </p>
                            <select className={styles.timezoneSelect} defaultValue="Europe/London">
                                <option value="Europe/London">GMT (London)</option>
                                <option value="America/New_York">Eastern Time (New York)</option>
                                <option value="America/Chicago">Central Time (Chicago)</option>
                                <option value="America/Denver">Mountain Time (Denver)</option>
                                <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                                <option value="Europe/Paris">CET (Paris)</option>
                                <option value="Asia/Tokyo">JST (Tokyo)</option>
                                <option value="Asia/Shanghai">CST (Shanghai)</option>
                                <option value="Australia/Sydney">AEST (Sydney)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        {/* Reminders container */}
        <section className={styles.remindersContainer}>
            <h2>Reminders</h2>
            <button className={styles.addElementButton} id="add-reminder-btn" onClick={() => setShowReminderModal(true)}>+ Add Reminder</button>
            
            <div className={styles.remindersGrid}>
                {/* Placeholder reminders */}
                <div className={styles.reminderTile}>
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
                
                <div className={styles.reminderTile}>
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
                
                <div className={styles.reminderTile}>
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