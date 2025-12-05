const express = require('express');
const { StatusCodes } = require('../utilities/statusCodes.js');
const { authenticate } = require('./authRouter.js')


const bookmarkRouter = express.Router();
const bookmarks = {};

// Create
bookmarkRouter.post('/bookmarks', authenticate, (req, res) => {
    const maxOrder = Object.values(bookmarks)
            .filter(b => !b.deleted)
            .reduce((max, b) => Math.max(max, b.order || 0), -1);
    
    const { id, name, timezone } = req.body;
    if (!id || !name || !timezone) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    bookmarks[id] = { userName: req.cookies.userName, id, name, timezone, deleted: false, order: maxOrder + 1, modifiedAt: new Date().toISOString() };
    res.status(StatusCodes.CREATED).send(bookmarks[id]);
});

// Read
bookmarkRouter.get('/bookmarks', authenticate, (req, res) => {
    const userBookmarks = Object.values(bookmarks).filter(b => b.userName === req.cookies.userName && !b.deleted);
    res.status(StatusCodes.OK).send(userBookmarks);
});

// Update
bookmarkRouter.put('/bookmarks', authenticate, (req, res) => {
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
bookmarkRouter.delete('/bookmarks', authenticate, (req, res) => {
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

module.exports = {
    bookmarkRouter
};