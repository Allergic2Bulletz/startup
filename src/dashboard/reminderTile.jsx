import React from 'react';

import styles from './dashboard.module.css';
import { formatTimeForTimezone, formatDateForTimezone } from '../utils/timeUtils.js';

const ReminderTile = React.memo(function ReminderTile({ reminder, onUpdate, onDelete, onMoveUp, onMoveDown, onExport }) {
    const reminderDate = new Date(reminder.datetime);
    const now = new Date();
    const isExpired = reminderDate < now;

    const handleTimezoneChange = (newTimezone) => {
        onUpdate({ timezone: newTimezone });
    };

    return (
        <div className={`${styles.tile} ${isExpired ? styles.expired : ''}`}>
            <div className={styles.tileHeader}>
                <h3>{reminder.title}</h3>
                <div className={styles.tileControls}>
                    <button className={styles.exportBtn} onClick={onExport} title="Copy reminder to clipboard">⧉</button>
                    <button className={styles.moveUpBtn} onClick={onMoveUp}>↑</button>
                    <button className={styles.moveDownBtn} onClick={onMoveDown}>↓</button>
                    <button className={styles.deleteElementButton} onClick={onDelete}>×</button>
                </div>
            </div>
            <div className={styles.tileContent}>
                <p style={{marginBottom: '0.5em', marginTop: '0', textAlign: 'center'}}>
                    <span className={`${styles.timeDisplay} ${isExpired ? styles.expired : ''}`}>
                        {formatTimeForTimezone(reminderDate, reminder.timezone)}
                    </span>
                    <br />
                    <span className={`${styles.dateDisplay} ${isExpired ? styles.expired : ''}`}>
                        {formatDateForTimezone(reminderDate, reminder.timezone)}
                    </span>
                </p>
                <select 
                    className={styles.timezoneSelect} 
                    value={reminder.timezone}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                >
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
    )
});

export default ReminderTile;
