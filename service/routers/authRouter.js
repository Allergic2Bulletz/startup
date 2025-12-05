const express = require('express');

const authRouter = express.Router();

const users = {}; // In-memory user store (should be replaced with a database in production)

authRouter.get('/', (req, res) => {
  res.send({ msg: 'Auth Router Root' });
});

authRouter.get('/status', (req, res) => {
  res.send({ status: 'OK' });
});

module.exports = {
    authRouter,
    users,
};