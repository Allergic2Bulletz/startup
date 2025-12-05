const express = require('express');
const { StatusCodes } = require('../utilities/network.js');
const { authenticate } = require('./authRouter.js')
const crypto = require('crypto');

const reminderRouter = express.Router();
const reminders = {};

// Create
reminderRouter.post('/', authenticate, (req, res) => {
    const maxOrder = Object.values(reminders)
            .filter(r => !r.deleted && r.userName === req.cookies.userName)
            .reduce((max, r) => Math.max(max, r.order || 0), -1);
    
    const {title, datetime, timezone } = req.body;
    if (!title || !datetime || !timezone) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    const id = crypto.randomUUID();
    reminders[id] = { userName: req.cookies.userName, id, title, datetime, timezone, deleted: false, order: maxOrder + 1, modifiedAt: new Date().toISOString() };
    res.status(StatusCodes.CREATED).send(reminders[id]);
});

// Read
reminderRouter.get('/', authenticate, (req, res) => {
    const userReminders = Object.values(reminders).filter(r => r.userName === req.cookies.userName && !r.deleted);
    res.status(StatusCodes.OK).send(userReminders);
});

// Update
reminderRouter.put('/', authenticate, (req, res) => {
    const { id, changes } = req.body;
    if (!id || !changes) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    if (!reminders[id] || reminders[id].userName !== req.cookies.userName) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Reminder not found' });
    }
    reminders[id] = { ...reminders[id], ...changes, modifiedAt: new Date().toISOString() };
    res.status(StatusCodes.OK).send(reminders[id]);
});

// Delete
reminderRouter.delete('/', authenticate, (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    if (!reminders[id] || reminders[id].userName !== req.cookies.userName) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Reminder not found' });
    }
    reminders[id].deleted = true;
    reminders[id].modifiedAt = new Date().toISOString();
    res.status(StatusCodes.OK).send(reminders[id]);
});


reminderRouter.put('/reorder', authenticate, (req, res) => {
    const { id, direction } = req.body;
    if (!id || !direction) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    const userReminders = Object.values(reminders)
        .filter(r => r.userName === req.cookies.userName && !r.deleted)
        .sort((a, b) => a.order - b.order);
    
    const currentIndex = userReminders.findIndex(r => r.id === id);
    
    if (currentIndex === -1) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Reminder not found' });
    }
    const newIndex = direction === 'up' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(userReminders.length - 1, currentIndex + 1);
    
    if (newIndex === currentIndex) {
        return res.status(StatusCodes.CONFLICT).send({ msg: 'No change in order' });
    }

    const current = userReminders[currentIndex];
    const target = userReminders[newIndex];
    const currentOrder = current.order;
    current.order = target.order;
    target.order = currentOrder;

    current.modifiedAt = new Date().toISOString();
    target.modifiedAt = new Date().toISOString();

    // Send both bookmarks back
    res.status(StatusCodes.OK).send({ updated: [current, target] });
});

module.exports = {
    reminderRouter
};