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
function getUser() {
    return userCollection.findOne({email: email});
}

function getUserByToken(token) {
    return authCollection.findOne({token: token}, {projection: {email: 1}});
}

function addUser(email, hashedPassword) {
    return userCollection.insertOne({email: email, password: hashedPassword});
}

function getTokens(email) {
    return authCollection.find({email: email, expire: { $gt: Date.now() }}).toArray();
}

function getActiveSession(email, token) {
    return authCollection.findOne({email: email, token: token, expire: { $gt: Date.now() }});
}

function addToken(email, authToken) {
    return authCollection.insertOne({email: email, token: authToken.token, expire: authToken.expire});
}

function removeToken(token) {
    return authCollection.deleteOne({token: token});
}





module.exports = { db, getUser, getUserByToken, addUser, addToken, getTokens, getActiveSession, removeToken };