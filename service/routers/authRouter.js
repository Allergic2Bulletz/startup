const express = require('express');
const { StatusCodes } = require('../utilities/network.js');
const authRouter = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const users = {}; // In-memory user store (should be replaced with a database in production)
const tokens = {}; // In-memory token store

class authToken {
    constructor(token) {
        this.token = token;
        this.expire = Date.now() + 3600000; // Token expires in 1 hour
    }
}

// For development purposes, create a default user
const devName = 'dev'
const devPassword = 'password'
const devBcryptPassword = bcrypt.hashSync(devPassword, 10);
users[devName] = { password: devBcryptPassword };
tokens[devName] = new authToken('70a92b36-8619-4e68-b41a-ab77f36290ad');


function createAuthCookies(res, email, token) {
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    });
    res.cookie('userName', email, {
        httpOnly: false,
        secure: true,
        sameSite: 'Strict'
    });
}

function verifySession(req) {
    const token = req.cookies.auth_token;
    return Object.values(tokens).some(authToken => authToken.token === token && authToken.expire > Date.now());
}

function getEmailByToken(token) {
    for (const email in tokens) {
        if (tokens[email].token === token) {
            return email;
        }
    }
    return null;
}

function authenticate(req, res, next) {
    if (req.cookies.auth_token && verifySession(req)) {
        next();
    } else {
        res.status(StatusCodes.UNAUTHORIZED).send({ msg: 'Not authenticated' });
    }
};

authRouter.get('/getuser', authenticate, (req, res) => {
    if (!req.cookies.userName) {
        const email = getEmailByToken(req.cookies.auth_token);
        createAuthCookies(res, email, req.cookies.auth_token);
        return res.status(StatusCodes.OK).send({ userName: email });
    }
    else {
        return res.status(StatusCodes.OK).send({ userName: req.cookies.userName });
    }
});

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

    const bcryptpassword = await bcrypt.hash(password, 10);
    users[email] = { password: bcryptpassword };
    tokens[email] = new authToken(crypto.randomUUID());
    createAuthCookies(res, email, tokens[email].token);
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
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'Invalid email or password' });
    }

    tokens[email] = new authToken(crypto.randomUUID());
    createAuthCookies(res, email, tokens[email].token);
    return res.status(StatusCodes.OK).send({ msg: 'User logged in successfully' });
});

authRouter.delete('/logout', authenticate, (req, res) => {
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
    res.clearCookie('userName');
    return res.status(StatusCodes.OK).send({ msg: 'User logged out successfully' });
});

module.exports = {
    authRouter,
    users,
    authenticate,
};