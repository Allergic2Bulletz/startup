const express = require('express');
const { StatusCodes } = require('../utilities/network.js');
const authRouter = express.Router();
const uuid = require('uuid');

const users = {}; // In-memory user store (should be replaced with a database in production)
const tokens = {}; // In-memory token store

class authToken {
    constructor(token) {
        this.token = token;
        this.expire = Date.now() + 3600000; // Token expires in 1 hour
    }
}

function setCookie(res, token) {
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    });
}

function verifySession(req) {
    const token = req.cookies.auth_token;
    return Object.values(tokens).some(authToken => authToken.token === token);
}

authRouter.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (req.cookies.auth_token) {
        if (verifySession(req)) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Already authenticated' });
        }
    }

    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Email and password are required' });
    }
    if (users[email]) {
        return res.status(StatusCodes.CONFLICT).send({ error: 'User already exists' });
    }

    users[email] = { password };
    tokens[email] = new authToken(uuid.v4());
    setCookie(res, tokens[email].token);
    return res.status(StatusCodes.CREATED).send({ msg: 'User registered successfully' });
});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (req.cookies.auth_token) {
        if (verifySession(req)) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Already authenticated' });
        }
    }

    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Email and password are required' });
    }
    const user = users[email];
    if (!user || user.password !== password) {
        return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'Invalid email or password' });
    }

    tokens[email] = new authToken(uuid.v4());
    setCookie(res, tokens[email].token);
    return res.status(StatusCodes.OK).send({ msg: 'User logged in successfully' });
});

authRouter.delete('/logout', (req, res) => {
    const token = req.cookies.auth_token;
    if (token) {
        for (const email in tokens) {
            if (tokens[email].token === token) {
                delete tokens[email];
                break;
            }
        }
    }
    else {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'No active session' });
    }
    
    res.clearCookie('auth_token');
    res.send({ msg: 'User logged out successfully' });
});

authRouter.get('/status', (req, res) => {
    res.send({ status: 'OK' });
});

module.exports = {
    authRouter,
    users,
};