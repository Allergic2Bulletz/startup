import React from 'react';

import styles from './dashboard.module.css';
import { formatTime, formatDate } from '../utils/timeUtils.js';

function TimeConverter({ currentTime }) {
    return (
        <section className={styles.timeConverter}>
            <h2>Time Converter</h2>
            
            <div className={styles.currentTimeDisplay}>
                <h3>Current Time</h3>
                <p className={styles.currentTime}>{formatTime(currentTime)}</p>
                <p className={styles.currentDate}>{formatDate(currentTime)}</p>
            </div>
            
            <div className={styles.customTimeInput}>
                <h3>Convert Custom Time</h3>
                <label htmlFor="custom-time">Enter time:</label>
                <input type="time" id="custom-time" name="custom-time" />
                <label htmlFor="custom-date">Date:</label>
                <input type="date" id="custom-date" name="custom-date" />
                <button className={styles.updateTimesButton} id="convert-btn">Update All Times</button>
            </div>
            
            <div className={styles.thirdPartyQuote}>
                <h3>Daily Inspiration</h3>
                <p className={styles.quoteText}>"Time is what we want most, but what we use worst." - William Penn</p>
            </div>
        </section>
    )
}

export default TimeConverter;