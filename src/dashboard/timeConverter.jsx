import React, { useEffect } from 'react';

import styles from './dashboard.module.css';
import { formatTime, formatDate } from '../utils/timeUtils.js';

function TimeConverter({ currentTime, customTime, customDate, onCustomTimeChange, onCustomDateChange }) {
    const [quoteText, setQuoteText] = React.useState("");
    const [quoteAuthor, setQuoteAuthor] = React.useState("");
    
    useEffect(async () => {
        const quote = fetch('https://thequoteshub.com/api/')
        const res = await quote;
        const data = await res.json();
        setQuoteText(data.quote);
        setQuoteAuthor(data.author);
    }, []);
    
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
                <input 
                    type="time" 
                    id="custom-time" 
                    name="custom-time" 
                    value={customTime}
                    onChange={(e) => onCustomTimeChange(e.target.value)}
                />
                <label htmlFor="custom-date">Date:</label>
                <input 
                    type="date" 
                    id="custom-date" 
                    name="custom-date" 
                    value={customDate}
                    onChange={(e) => onCustomDateChange(e.target.value)}
                />
                <button 
                    className={styles.updateTimesButton} 
                    id="reset-btn"
                    onClick={() => {
                        if (customTime || customDate) {
                            onCustomTimeChange('');
                            onCustomDateChange('');
                        }
                    }}
                >
                    Clear Custom Time
                </button>
            </div>
            
            <div className={styles.thirdPartyQuote}>
                <h3>Daily Inspiration</h3>
                <p className={styles.quoteText}>{quoteText} - {quoteAuthor}</p>
            </div>
        </section>
    )
}

export default TimeConverter;