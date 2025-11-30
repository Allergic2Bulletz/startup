import React from 'react';

import styles from './dashboard.module.css';
import { formatTimeForTimezone, formatDateForTimezone } from '../utils/timeUtils.js';

function BookmarkTile({name, argTimezone, referenceTime, forecasting}) {
    const [timezone, setTimezone] = React.useState(argTimezone || 'America/New_York');

    return (
        <div className={`${styles.tile} ${forecasting ? styles.forecastMode : ''}`}>
            <div className={styles.tileHeader}>
                <h3>{name}</h3>
                <div className={styles.tileControls}>
                    <button className={styles.moveUpBtn}>↑</button>
                    <button className={styles.moveDownBtn}>↓</button>
                    <button className={styles.deleteElementButton}>×</button>
                </div>
            </div>
            <div className={styles.tileContent}>
                <p>
                    <span className={`${styles.timeDisplay} ${forecasting ? styles.forecast : ''}`}>
                        {formatTime(convertToTimezone(referenceTime || new Date(), timezone))}
                    </span>
                    <span className={`${styles.dateDisplay} ${forecasting ? styles.forecast : ''}`}>
                        {formatDate(convertToTimezone(referenceTime || new Date(), timezone))}
                    </span>
                </p>
                <select className={styles.timezoneSelect} defaultValue={timezone} onChange={(e) => setTimezone(e.target.value)}>
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
}

export default BookmarkTile;