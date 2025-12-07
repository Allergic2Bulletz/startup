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

module.exports = { getTimezoneOffset, getDateInUTC, getDatetimeForTimezone };