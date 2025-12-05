const express = require('express');
const { StatusCodes } = require('../utilities/network.js');
const { authenticate } = require('./authRouter.js')
const crypto = require('crypto');


const bookmarkRouter = express.Router();
const bookmarks = {};

// Create - return created bookmark as json
bookmarkRouter.post('/', authenticate, (req, res) => {
    const maxOrder = Object.values(bookmarks)
            .filter(b => !b.deleted && b.userName === req.cookies.userName)
            .reduce((max, b) => Math.max(max, b.order || 0), -1);
    
    const {name, timezone } = req.body;
    if (!name || !timezone) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    const id = crypto.randomUUID();
    bookmarks[id] = { userName: req.cookies.userName, id, name, timezone, deleted: false, order: maxOrder + 1, modifiedAt: new Date().toISOString() };
    res.status(StatusCodes.CREATED).send(bookmarks[id]);
});

// Read
bookmarkRouter.get('/', authenticate, (req, res) => {
    const userBookmarks = Object.values(bookmarks).filter(b => b.userName === req.cookies.userName && !b.deleted);
    res.status(StatusCodes.OK).send(userBookmarks);
});

// Update
bookmarkRouter.put('/', authenticate, (req, res) => {
    const { id, changes } = req.body;
    if (!id || !changes) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    if (!bookmarks[id] || bookmarks[id].userName !== req.cookies.userName) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Bookmark not found' });
    }
    bookmarks[id] = { ...bookmarks[id], ...changes, modifiedAt: new Date().toISOString() };
    res.status(StatusCodes.OK).send(bookmarks[id]);
});

// Delete
bookmarkRouter.delete('/', authenticate, (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    if (!bookmarks[id] || bookmarks[id].userName !== req.cookies.userName) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Bookmark not found' });
    }
    bookmarks[id].deleted = true;
    bookmarks[id].modifiedAt = new Date().toISOString();
    res.status(StatusCodes.OK).send(bookmarks[id]);
});

bookmarkRouter.put('/reorder', authenticate, (req, res) => {
    const { id, direction } = req.body;
    if (!id || !direction) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    const userBookmarks = Object.values(bookmarks)
        .filter(b => b.userName === req.cookies.userName && !b.deleted)
        .sort((a, b) => a.order - b.order);
    
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

    // Send both bookmarks back
    res.status(StatusCodes.OK).send({ updated: [current, target] });
});

module.exports = {
    bookmarkRouter
};