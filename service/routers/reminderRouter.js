const express = require('express');
const { StatusCodes } = require('../utils/network.js');
const { authenticate } = require('./authRouter.js')
const crypto = require('crypto');
const { getDatetimeForTimezone } = require('../utils/time.js');
const dbOps = require('../database.js');

const reminderRouter = express.Router();

// Create
reminderRouter.post('/', authenticate, async (req, res) => {
    const maxOrderDoc = await dbOps.getReminderMaxOrder(req.cookies.userName);
    const maxOrder = maxOrderDoc ? maxOrderDoc.order : -1;
    
    const {title, datetime, timezone } = req.body;
    
    if (!title || !datetime || !timezone) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    
    const id = crypto.randomUUID();
    const finalDateTime = getDatetimeForTimezone(datetime, timezone);
    
    const reminder = { userName: req.cookies.userName, id, title, datetime: finalDateTime, timezone, deleted: false, index: maxOrder + 1, modifiedAt: new Date().toISOString() };
    const result = await dbOps.addReminder(reminder);

    if (!result.acknowledged) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to create reminder' });
    }

    res.status(StatusCodes.CREATED).send(reminder);
});

// Read
reminderRouter.get('/', authenticate, async (req, res) => {
    const userReminders = await dbOps.getAllReminders(req.cookies.userName);
    res.status(StatusCodes.OK).send(userReminders || []);
});

// Update
reminderRouter.put('/', authenticate, async (req, res) => {
    const { id, changes } = req.body;
    if (!id || !changes) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }

    const existingReminder = await dbOps.getReminder(req.cookies.userName, id);
    if (!existingReminder) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Reminder not found' });
    }
    
    const updateTime = new Date().toISOString();
    changes.modifiedAt = updateTime;
    const updatedReminder = { ...existingReminder, ...changes };

    // Either changes or updatedReminder can be used here
    const result = await dbOps.updateReminder(req.cookies.userName, id, changes);
    
    if (result.modifiedCount !== 1) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to update reminder' });
    }

    res.status(StatusCodes.OK).send(updatedReminder);
});

// Delete
reminderRouter.delete('/', authenticate, async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }

    // todo - this is an expensive way to check for existence
    const existingReminder = await dbOps.getReminder(req.cookies.userName, id);
    if (!existingReminder) {
        return res.status(StatusCodes.NOT_FOUND).send({ msg: 'Reminder not found' });
    }

    const result = await dbOps.markReminderDeleted(req.cookies.userName, id);
    if (result.modifiedCount !== 1) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to delete reminder' });
    }
    res.status(StatusCodes.OK).send({ id });
});


reminderRouter.put('/reorder', authenticate, async (req, res) => {
    const { id, direction } = req.body;
    if (!id || !direction) {
        return res.status(StatusCodes.BAD_REQUEST).send({ msg: 'Missing required fields' });
    }
    const userReminders = await dbOps.getAllReminders(req.cookies.userName);
    
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

    const result1 = await dbOps.updateReminder(req.cookies.userName, current.id, { order: current.order, modifiedAt: current.modifiedAt });
    const result2 = await dbOps.updateReminder(req.cookies.userName, target.id, { order: target.order, modifiedAt: target.modifiedAt });

    if (result1.modifiedCount !== 1 || result2.modifiedCount !== 1) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to reorder reminders' });
    }

    // Send both reminders back
    res.status(StatusCodes.OK).send({ updated: [current, target] });
});

module.exports = {
    reminderRouter
};