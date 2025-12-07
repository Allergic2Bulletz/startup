const express = require('express');
const { StatusCodes } = require('../utils/network.js');
const { authenticate } = require('./authRouter.js')
const crypto = require('crypto');
const dbOps = require('../database.js');


const bookmarkRouter = express.Router();

// Create - return created bookmark as json
bookmarkRouter.post('/', authenticate, async (req, res) => {
    const maxOrderDoc = await dbOps.getBookmarkMaxOrder(req.cookies.userName);
    const maxOrder = maxOrderDoc ? maxOrderDoc.order : -1;
    const {title, timezone } = req.body;
    
    if (!title || !timezone) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    
    const id = crypto.randomUUID();
    const bookmark = { userName: req.cookies.userName, id, title, timezone, deleted: false, order: maxOrder + 1, modifiedAt: new Date().toISOString() };
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

bookmarkRouter.put('/reorder', authenticate, async (req, res) => {
    const { id, direction } = req.body;
    if (!id || !direction) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    const userBookmarks = await dbOps.getAllBookmarks(req.cookies.userName);
    
    const currentIndex = userBookmarks.findIndex(b => b.id === id);
    
    if (currentIndex === -1) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Bookmark not found' });
    }
    const newIndex = direction === 'up' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(userBookmarks.length - 1, currentIndex + 1);
    
    if (newIndex === currentIndex) {
        return res.status(StatusCodes.CONFLICT).send({ msg: 'No change in order' });
    }

    const current = userBookmarks[currentIndex];
    const target = userBookmarks[newIndex];
    const currentOrder = current.order;
    current.order = target.order;
    target.order = currentOrder;

    current.modifiedAt = new Date().toISOString();
    target.modifiedAt = new Date().toISOString();

    const result1 = await dbOps.updateBookmark(req.cookies.userName, current.id, { order: current.order, modifiedAt: current.modifiedAt });
    const result2 = await dbOps.updateBookmark(req.cookies.userName, target.id, { order: target.order, modifiedAt: target.modifiedAt });

    if (result1.modifiedCount !== 1 || result2.modifiedCount !== 1) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to reorder bookmarks' });
    }

    // Send both bookmarks back
    res.status(StatusCodes.OK).send({ updated: [current, target] });
});

module.exports = {
    bookmarkRouter
};