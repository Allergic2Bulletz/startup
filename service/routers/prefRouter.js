const express = require('express');
const { StatusCodes } = require('../utils/network.js');
const { authenticate } = require('./authRouter.js')
const crypto = require('crypto');
const dbOps = require('../database.js');

const prefRouter = express.Router();

// Get preferences
prefRouter.get('/', authenticate, async (req, res) => {
    const prefs = await dbOps.getPreferences(req.cookies.userName);
    res.status(StatusCodes.OK).send(prefs || {});
});

// Update preferences
prefRouter.put('/', authenticate, async (req, res) => {
    const updatedPrefs = { ...req.body, modifiedAt: new Date().toISOString() };
    
    const result = await dbOps.updatePreferences(req.cookies.userName, updatedPrefs);
    
    if (result.modifiedCount !== 1) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to update preferences' });
    }
    res.status(StatusCodes.OK).send(updatedPrefs);
});

// Delete preferences
prefRouter.delete('/', authenticate, async (req, res) => {
    const result = await dbOps.deletePreferences(req.cookies.userName);
    if (result.deletedCount !== 1) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ msg: 'Failed to delete preferences' });
    }
    res.status(StatusCodes.OK).send({ msg: 'Preferences deleted' });
});



module.exports = { prefRouter };