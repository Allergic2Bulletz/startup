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

// Format time for specific timezone
const formatTimeForTimezone = (date, timezone) => {
    return date.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });
};

// Format date for specific timezone
const formatDateForTimezone = (date, timezone) => {
    return date.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Return offset in minutes
const getTimezoneOffset = (timezone) => {
    const today = new Date();
    const targetDate = today.toLocaleString('en-US', { timeZone: timezone });
    const diff = (new Date(targetDate).getTime() - today.getTime()) / 60000; // difference in minutes
    const targetOffset = today.getTimezoneOffset() - diff;
    return Math.round(targetOffset);
};

// Return the date in UTC time for a given datetime-local string
const getDateInUTC = (datetimeLocalStr) => {
    const [datePart, timePart] = datetimeLocalStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hours, minutes);
    const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
    return utcDate;
}

// Convert datetime-local string to Date object in target timezone
const getDatetimeForTimezone = (datetimeLocalStr, timezone) => {
    const utcDate = getDateInUTC(datetimeLocalStr);
    const targetOffset = getTimezoneOffset(timezone);
    const targetDate = new Date(utcDate.getTime() + (targetOffset * 60000));
    return targetDate;
}

export { formatTime, formatDate, formatTimeForTimezone, formatDateForTimezone, getTimezoneOffset, getDateInUTC, getDatetimeForTimezone};