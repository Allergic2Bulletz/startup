const express = require('express');
const { StatusCodes } = require('../utils/network.js');
const { authenticate } = require('./authRouter.js')
const crypto = require('crypto');

const prefRouter = express.Router();
// For simplicity, using in-memory storage for user preferences
const userPreferences = {};

// Get preferences
prefRouter.get('/', authenticate, (req, res) => {
    const prefs = userPreferences[req.cookies.userName] || {};
    res.status(StatusCodes.OK).send(prefs);
});

// Update preferences
prefRouter.put('/', authenticate, (req, res) => {
    userPreferences[req.cookies.userName] = { ...userPreferences[req.cookies.userName], ...req.body, modifiedAt: new Date().toISOString() };
    res.status(StatusCodes.OK).send(userPreferences[req.cookies.userName] || {});
});

// Delete preferences
prefRouter.delete('/', authenticate, (req, res) => {
    delete userPreferences[req.cookies.userName];
    res.status(StatusCodes.OK).send({ msg: 'Preferences deleted' });
});



module.exports = { prefRouter };