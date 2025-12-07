const express = require('express');
const { StatusCodes } = require('../utils/network.js');
const authRouter = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const dbOps = require('../database.js');

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


function createAuthCookies(res, email, token) {
    res.cookie('authToken', token, {
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

async function verifySession(req) {
    if (req.cookies.authToken && req.cookies.userName) {
        if (await dbOps.getActiveSession(req.cookies.userName, req.cookies.authToken)) {
            return true;
        }
    }
    return false;
}

async function authenticate(req, res, next) {
    if (req.cookies.authToken && req.cookies.userName) {
        if (await dbOps.getActiveSession(req.cookies.userName, req.cookies.authToken)) {
            return next();
        }
        return res.status(StatusCodes.UNAUTHORIZED).send({ msg: 'Not authenticated' });
    } else {
        res.status(StatusCodes.UNAUTHORIZED).send({ msg: 'Missing authToken or userName' });
    }
};

authRouter.get('/getuser', authenticate, async (req, res) => {
    if (!req.cookies.userName) {
        const email = await getUserByToken(req.cookies.authToken);
        createAuthCookies(res, email, req.cookies.authToken);
        return res.status(StatusCodes.OK).send({ userName: email });
    }
    else {
        return res.status(StatusCodes.OK).send({ userName: req.cookies.userName });
    }
});

authRouter.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (req.cookies.authToken) {
        if (await verifySession(req)) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Already authenticated' });
        }
    }

    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Email and password are required' });
    }
    if (await getUser(email)) {
        return res.status(StatusCodes.CONFLICT).send({ error: 'User already exists' });
    }

    const bcryptpassword = await bcrypt.hash(password, 10);
    await addUser(email, bcryptpassword);
    
    const newToken = new authToken(crypto.randomUUID());
    await dbOps.addToken(email, newToken);
    
    createAuthCookies(res, email, newToken.token);
    return res.status(StatusCodes.CREATED).send({ msg: 'User registered successfully' });
});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (req.cookies.authToken) {
        if (await verifySession(req)) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Already authenticated' });
        }
    }

    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Email and password are required' });
    }

    const user = await dbOps.getUser(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'Invalid email or password' });
    }

    
    // Add new session token
    const newToken = new authToken(crypto.randomUUID());
    await dbOps.addToken(email, newToken);
    
    createAuthCookies(res, email, newToken.token);
    return res.status(StatusCodes.OK).send({ msg: 'User logged in successfully' });
});

authRouter.delete('/logout', authenticate, async (req, res) => {
    const token = req.cookies.authToken;

    const delResult = await dbOps.removeToken(token);
    if (delResult.deletedCount === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Token not found' });
    }
    
    res.clearCookie('authToken');
    res.clearCookie('userName');
    return res.status(StatusCodes.OK).send({ msg: 'User logged out successfully' });
});

module.exports = {
    authRouter,
    authenticate,
};