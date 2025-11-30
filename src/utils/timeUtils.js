// Format time for display
const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });
};

// Format date for display
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Convert date between timezones
const convertToTimezone = (date, targetTimezone) => {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const targetDate = new Date(utcDate.toLocaleString('en-US', { timeZone: targetTimezone }));
    return targetDate;
};

export { formatTime, formatDate, convertToTimezone };