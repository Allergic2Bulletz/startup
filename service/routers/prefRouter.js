const express = require('express');
const { StatusCodes } = require('../utils/network.js');
const { authenticate } = require('./authRouter.js')
const crypto = require('crypto');
const dbOps = require('../database.js');
const { Command } = require('../wsServer.js');

const prefRouter = express.Router();
// Use a getter function to access wsServer after it's initialized
const getWsServer = () => {
    const { wsServer } = require('../index.js');
    return wsServer;
};

// Get preferences
prefRouter.get('/', authenticate, async (req, res) => {
    const prefs = await dbOps.getPreferences(req.cookies.userName);
    res.status(StatusCodes.OK).send({notifications: prefs.notifications, reminderSound: prefs.reminderSound, theme: prefs.theme, modifiedAt: prefs.modifiedAt} || {});
});

// Update preferences
prefRouter.put('/', authenticate, async (req, res) => {
    const updatedPrefs = { ...req.body, modifiedAt: new Date().toISOString() };
    
    const result = await dbOps.updatePreferences(req.cookies.userName, updatedPrefs);
    
    if (result.modifiedCount == 1 || result.upsertedCount == 1) {
        res.status(StatusCodes.OK).send(updatedPrefs);
        getWsServer().sendToUserClients(req.cookies.userName, new Command('sync', 'preferences', {}));
        return;
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to update preferences' });
});

// Delete preferences
prefRouter.delete('/', authenticate, async (req, res) => {
    const result = await dbOps.deletePreferences(req.cookies.userName);
    if (result.deletedCount !== 1) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to delete preferences' });
    }
    res.status(StatusCodes.OK).send({ msg: 'Preferences deleted' });
    getWsServer().sendToUserClients(req.cookies.userName, new Command('sync', 'preferences', {}));
});



module.exports = { prefRouter };