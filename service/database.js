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
    return await bookmarkCollection.find({userName: userName, deleted: false}, {sort: {index: 1}}).toArray();
}

function getBookmark(userName, id) {
    return bookmarkCollection.findOne({ userName: userName, id: id, deleted: false });
}

function getBookmarkMaxOrder(userName) {
    const query = { userName: userName, deleted: false };
    const options = { sort: { index: -1 }, projection: { index: 1 } };
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

function getBookmarksForSwap(userName, index, sortDirection) {
    // Determine if index needs to be gte or lte based on sort direction
    const comparisonOperator = sortDirection.index === -1 ? '$lte' : '$gte';
    const query = { userName: userName, index: { [comparisonOperator]: index }, deleted: false };
    // Limit results to only two entries
    const options = { sort: sortDirection, limit: 2, projection: { id: 1, index: 1 } };
    return bookmarkCollection.find(query, options).toArray();
}

async function swapBookmarkIndicesAggregation(userName, currentIndex, direction) {
    console.log('🚀 Starting aggregation-based swap');
    
    // Phase 1: Determine sort direction and comparison operator
    const sortDirection = direction === 'up' ? -1 : 1;
    const comparisonOperator = direction === 'up' ? '$lte' : '$gte';
    
    console.log(`📊 Query params: index ${comparisonOperator} ${currentIndex}, sort: ${sortDirection}`);
    
    // Phase 2: Build the aggregation pipeline
    const pipeline = [
        // Stage 1: Find candidate documents for swapping
        {
            $match: {
                userName: userName,
                index: { [comparisonOperator]: currentIndex },
                deleted: false
            }
        },
        
        // Stage 2: Sort by index (ascending or descending based on direction)
        { $sort: { index: sortDirection } },
        
        // Stage 3: Limit to exactly 2 documents
        { $limit: 2 },
        
        // Stage 4: Group all documents into an array
        {
            $group: {
                _id: null,
                docs: { $push: "$$ROOT" },
                count: { $sum: 1 }
            }
        },
        
        // Stage 5: Only proceed if we have exactly 2 documents
        {
            $match: {
                count: 2  // Must have exactly 2 docs to swap
            }
        },
        
        // Stage 6: Create the swap data structure
        {
            $project: {
                swapData: {
                    doc1: { $arrayElemAt: ["$docs", 0] },
                    doc2: { $arrayElemAt: ["$docs", 1] }
                }
            }
        },
        
        // Stage 7: Prepare the return format
        {
            $project: {
                updated: [
                    {
                        id: "$swapData.doc1.id",
                        oldIndex: "$swapData.doc1.index",
                        newIndex: "$swapData.doc2.index"
                    },
                    {
                        id: "$swapData.doc2.id", 
                        oldIndex: "$swapData.doc2.index",
                        newIndex: "$swapData.doc1.index"
                    }
                ],
                // Store update operations for execution
                updateOps: [
                    {
                        filter: { _id: "$swapData.doc1._id" },
                        update: {
                            index: "$swapData.doc2.index",
                            modifiedAt: new Date()
                        }
                    },
                    {
                        filter: { _id: "$swapData.doc2._id" },
                        update: {
                            index: "$swapData.doc1.index", 
                            modifiedAt: new Date()
                        }
                    }
                ]
            }
        }
    ];
    
    console.log('🔍 Executing aggregation pipeline...');
    
    // Phase 3: Execute the aggregation
    const aggregationResult = await bookmarkCollection.aggregate(pipeline).toArray();
    
    if (aggregationResult.length === 0) {
        console.log('❌ Aggregation found no swappable documents');
        throw new Error('Cannot swap: not enough bookmarks found');
    }
    
    const swapPlan = aggregationResult[0];
    console.log('✅ Aggregation completed, executing updates...');
    console.log(`🔄 Will swap: ${swapPlan.updated[0].id}(${swapPlan.updated[0].oldIndex}->${swapPlan.updated[0].newIndex}) <-> ${swapPlan.updated[1].id}(${swapPlan.updated[1].oldIndex}->${swapPlan.updated[1].newIndex})`);
    
    // Phase 4: Execute the actual updates using bulkWrite
    const now = new Date();
    const bulkOps = [
        {
            updateOne: {
                filter: { userName: userName, id: swapPlan.updated[0].id, deleted: false },
                update: { 
                    $set: { 
                        index: swapPlan.updated[0].newIndex, 
                        modifiedAt: now 
                    } 
                }
            }
        },
        {
            updateOne: {
                filter: { userName: userName, id: swapPlan.updated[1].id, deleted: false },
                update: { 
                    $set: { 
                        index: swapPlan.updated[1].newIndex, 
                        modifiedAt: now 
                    } 
                }
            }
        }
    ];
    
    const updateResult = await bookmarkCollection.bulkWrite(bulkOps);
    console.log(`💾 Updates completed: ${updateResult.modifiedCount} documents modified`);
    
    if (updateResult.modifiedCount !== 2) {
        throw new Error(`Update failed: expected 2 modifications, got ${updateResult.modifiedCount}`);
    }
    
    // Phase 5: Return the swap results
    return {
        updated: swapPlan.updated.map(item => ({
            id: item.id,
            index: item.newIndex
        }))
    };
}

async function swapBookmarks(userName, from, to) {
    const now = new Date();
    const bulkOps = [
        {
            updateOne: {
                filter: { userName: userName, index: from, deleted: false },
                update: { $set: { index: to, modifiedAt: now } }
            }
        },
        {
            updateOne: {
                filter: { userName: userName, index: to, deleted: false },
                update: { $set: { index: from, modifiedAt: now } }
            }
        }
    ];

    return {results: await bookmarkCollection.bulkWrite(bulkOps), modifiedAt: now};
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
    getBookmarksForSwap,
    swapBookmarkIndicesAggregation,
    swapBookmarks,
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