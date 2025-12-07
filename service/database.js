const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const uri = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(uri);
const db = client.db(config.dbName);
const userCollection = db.collection('users');
const bookmarkCollection = db.collection('bookmarks');
const reminderCollection = db.collection('reminders');
const prefCollection = db.collection('preferences');
const authCollection = db.collection('authTokens');

async function testConnection() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB: ', error);
        process.exit(1);
    }
}
// Do not export this function, just run it once when the module is loaded
testConnection();

// User Operations
function getUser(userName) {
    return userCollection.findOne({userName: userName});
}

function getUserByToken(token) {
    return authCollection.findOne({token: token}, {projection: {userName: 1}});
}

function addUser(userName, hashedPassword) {
    return userCollection.insertOne({userName: userName, password: hashedPassword});
}

function getTokens(userName) {
    return authCollection.find({userName: userName, expire: { $gt: Date.now() }}).toArray();
}

function getActiveSession(userName, token) {
    return authCollection.findOne({userName: userName, token: token, expire: { $gt: Date.now() }});
}

function addToken(userName, authToken) {
    return authCollection.insertOne({userName: userName, token: authToken.token, expire: authToken.expire});
}

function removeToken(token) {
    return authCollection.deleteOne({token: token});
}


// Bookmark Operations
async function getAllBookmarks(userName) {
    return await bookmarkCollection.find({userName: userName, deleted: false}, {sort: {order: 1}}).toArray();
}

function getBookmark(userName, id) {
    return bookmarkCollection.findOne({ userName: userName, id: id, deleted: false });
}

function getBookmarkMaxOrder(userName) {
    const query = { userName: userName, deleted: false };
    const options = { sort: { order: -1 }, projection: { order: 1 } };
    return bookmarkCollection.findOne(query, options);
}

function addBookmark(bookmark) {
    return bookmarkCollection.insertOne(bookmark);
}

function updateBookmark(userName, id, changes) {
    return bookmarkCollection.updateOne({ userName: userName, id: id, deleted: false }, { $set: changes });
}

function deleteBookmark(userName, id) {
    return bookmarkCollection.deleteOne({ userName: userName, id: id });
}

function markBookmarkDeleted(userName, id) {
    return bookmarkCollection.updateOne({ userName: userName, id: id }, { $set: { deleted: true, modifiedAt: new Date().toISOString() } });
}


// Reminder Operations
function getAllReminders(userName) {
    return reminderCollection.find({userName: userName, deleted: false}, {sort: {order: 1}}).toArray();
}

function getReminder(userName, id) {
    return reminderCollection.findOne({ userName: userName, id: id, deleted: false });
}

function getReminderMaxOrder(userName) {
    const query = { userName: userName, deleted: false };
    const options = { sort: { order: -1 }, projection: { order: 1 } };
    return reminderCollection.findOne(query, options);
}

function addReminder(reminder) {
    return reminderCollection.insertOne(reminder);
}

function updateReminder(userName, id, changes) {
    return reminderCollection.updateOne({ userName: userName, id: id, deleted: false }, { $set: changes });
}

function deleteReminder(userName, id) {
    return reminderCollection.deleteOne({ userName: userName, id: id });
}

function markReminderDeleted(userName, id) {
    return reminderCollection.updateOne({ userName: userName, id: id }, { $set: { deleted: true, modifiedAt: new Date().toISOString() } });
}


// Preference Operations
function getPreferences(userName) {
    return prefCollection.findOne({ userName: userName });
}

function updatePreferences(userName, preferences) {
    return prefCollection.updateOne({ userName: userName }, { $set: preferences }, { upsert: true });
}

function deletePreferences(userName) {
    return prefCollection.deleteOne({ userName: userName });
}



module.exports = { 
    getUser, 
    getUserByToken, 
    addUser, 
    addToken, 
    getTokens, 
    getActiveSession, 
    removeToken,
    getAllBookmarks,
    getBookmark,
    getBookmarkMaxOrder,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    markBookmarkDeleted,
    getAllReminders,
    getReminder,
    getReminderMaxOrder,
    addReminder,
    updateReminder,
    deleteReminder,
    markReminderDeleted,
    getPreferences,
    updatePreferences,
    deletePreferences
};