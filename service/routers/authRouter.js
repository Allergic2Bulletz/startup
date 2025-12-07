const express = require('express');
const { StatusCodes } = require('../utils/network.js');
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
// tokens[devName] = new authToken('70a92b36-8619-4e68-b41a-ab77f36290ad');


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
    // Check all users' token arrays for a valid token
    // for (const email in tokens) {
    //     if (Array.isArray(tokens[email])) {
    //         const validToken = tokens[email].find(authToken => 
    //             authToken.token === token && authToken.expire > Date.now()
    //         );
    //         if (validToken) return true;
    //     }
    // }
    const userTokens = tokens[req.cookies.userName];
    if (Array.isArray(userTokens)) {
        return userTokens.some(authToken => {
            if (authToken.token === token && authToken.expire > Date.now()) {
                return true;
            }
        });
    }
    return false;
}

function getEmailByToken(token) {
    for (const email in tokens) {
        if (Array.isArray(tokens[email])) {
            const foundToken = tokens[email].find(authToken => authToken.token === token);
            if (foundToken) return email;
        }
    }
    return null;
}

function authenticate(req, res, next) {
    if (req.cookies.auth_token && req.cookies.userName && verifySession(req)) {
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
    
    // Initialize token array for new user or add to existing array
    if (!tokens[email]) {
        tokens[email] = [];
    }
    const newToken = new authToken(crypto.randomUUID());
    tokens[email].push(newToken);
    
    createAuthCookies(res, email, newToken.token);
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

    // Initialize token array for user if it doesn't exist
    if (!tokens[email]) {
        tokens[email] = [];
    }
    
    // Add new session token to user's token array
    const newToken = new authToken(crypto.randomUUID());
    tokens[email].push(newToken);
    
    createAuthCookies(res, email, newToken.token);
    return res.status(StatusCodes.OK).send({ msg: 'User logged in successfully' });
});

authRouter.delete('/logout', authenticate, (req, res) => {
    const token = req.cookies.auth_token;
    if (token) {
        // Find and remove the specific token from the user's token array
        // for (const email in tokens) {
        //     if (Array.isArray(tokens[email])) {
        //         const tokenIndex = tokens[email].findIndex(authToken => authToken.token === token);
        //         if (tokenIndex !== -1) {
        //             tokens[email].splice(tokenIndex, 1);
        //             // Clean up empty arrays
        //             if (tokens[email].length === 0) {
        //                 delete tokens[email];
        //             }
        //             break;
        //         }
        //     }
        // }
        const userTokens = tokens[req.cookies.userName];
        if (Array.isArray(userTokens)) {
            tokens[req.cookies.userName] = userTokens.filter(authToken => authToken.token !== token);
        }
        // Clean up empty arrays
        if (tokens[req.cookies.userName].length === 0) {
            delete tokens[req.cookies.userName];
        }
    } else {
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