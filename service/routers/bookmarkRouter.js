const express = require('express');
const { StatusCodes } = require('../utils/network.js');
const { authenticate } = require('./authRouter.js')
const crypto = require('crypto');
const dbOps = require('../database.js');


const bookmarkRouter = express.Router();

// Create - return created bookmark as json
bookmarkRouter.post('/', authenticate, async (req, res) => {
    const maxOrderDoc = await dbOps.getBookmarkMaxOrder(req.cookies.userName);
    const maxOrder = maxOrderDoc ? maxOrderDoc.index : -1;
    const {title, timezone } = req.body;
    
    if (!title || !timezone) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    
    const id = crypto.randomUUID();
    const bookmark = { userName: req.cookies.userName, id, title, timezone, deleted: false, index: maxOrder + 1, modifiedAt: new Date().toISOString() };
    const result = await dbOps.addBookmark(bookmark);

    if (!result.acknowledged) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to create bookmark' });
    }

    res.status(StatusCodes.CREATED).send(bookmark);
});

// Read
bookmarkRouter.get('/', authenticate, async (req, res) => {
    const userBookmarks = await dbOps.getAllBookmarks(req.cookies.userName);
    res.status(StatusCodes.OK).send(userBookmarks || []);
});

// Update
bookmarkRouter.put('/', authenticate, async (req, res) => {
    const { id, changes } = req.body;
    if (!id || !changes) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }

    const existingBookmark = await dbOps.getBookmark(req.cookies.userName, id);
    if (!existingBookmark) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Bookmark not found' });
    }
    
    const updateTime = new Date().toISOString();
    changes.modifiedAt = updateTime;
    const updatedBookmark = { ...existingBookmark, ...changes };

    // Either changes or updatedBookmark can be used here
    const result = await dbOps.updateBookmark(req.cookies.userName, id, changes);
    
    if (result.modifiedCount !== 1) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to update bookmark' });
    }

    res.status(StatusCodes.OK).send(updatedBookmark);
});

// Delete
bookmarkRouter.delete('/', authenticate, async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }

    // todo - this is an expensive way to check for existence
    const existingBookmark = await dbOps.getBookmark(req.cookies.userName, id);
    if (!existingBookmark) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Bookmark not found' });
    }

    const result = await dbOps.markBookmarkDeleted(req.cookies.userName, id);
    if (result.modifiedCount !== 1) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to delete bookmark' });
    }
    res.status(StatusCodes.OK).send({ id });
});

// Reorder
bookmarkRouter.put('/reorder', authenticate, async (req, res) => {
    const startTime = Date.now();
    console.log('🔄 Reorder function started');
    
    const { index, direction } = req.body;
    if (index === undefined || index === null || !direction) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    
    console.log(`📥 Input: index=${index}, direction=${direction}`);
    
    // 1. Determine which index to sort bookmarks in based on direction
    // 2. Fetch two bookmarks: the current one and the next one in the specified direction
    // 3. Swap their index values
    // 4. Update both bookmarks in the database

    const sortDirection = direction === 'up' ? { index: -1 } : { index: 1 };
    console.log('🎯 Sort direction calculated:', sortDirection);

    const dbFetchStart = Date.now();
    const swapBookmarks = await dbOps.getBookmarksForSwap(req.cookies.userName, index, sortDirection);
    const dbFetchTime = Date.now() - dbFetchStart;
    console.log(`📊 DB fetch completed in ${dbFetchTime}ms, found ${swapBookmarks.length} bookmarks`);
    
    if (swapBookmarks.length === 0) {
        console.log('❌ No bookmarks found');
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Bookmark not found' });
    }
    if (swapBookmarks.length < 2) {
        console.log('⚠️ Not enough bookmarks to swap');
        return res.status(StatusCodes.CONFLICT).send({ msg: 'No change in order' });
    }
    const [current, target] = swapBookmarks;

    console.log(`🔄 Swapping bookmarks: current(id=${current.id}, index=${current.index}) <-> target(id=${target.id}, index=${target.index})`);

    const currentIndex = current.index;
    current.index = target.index;
    target.index = currentIndex;

    current.modifiedAt = new Date().toISOString();
    target.modifiedAt = new Date().toISOString();

    const dbUpdateStart = Date.now();
    const result1 = await dbOps.updateBookmark(req.cookies.userName, current.id, { index: current.index, modifiedAt: current.modifiedAt });
    const result2 = await dbOps.updateBookmark(req.cookies.userName, target.id, { index: target.index, modifiedAt: target.modifiedAt });
    const dbUpdateTime = Date.now() - dbUpdateStart;
    console.log(`💾 DB updates completed in ${dbUpdateTime}ms`);

    if (result1.modifiedCount !== 1 || result2.modifiedCount !== 1) {
        console.log('❌ DB update failed:', { result1: result1.modifiedCount, result2: result2.modifiedCount });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to reorder bookmarks' });
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Reorder completed successfully in ${totalTime}ms (fetch: ${dbFetchTime}ms, update: ${dbUpdateTime}ms)`);

    // Send both bookmarks back
    res.status(StatusCodes.OK).send({ updated: [current, target] });
});

module.exports = {
    bookmarkRouter
};