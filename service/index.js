const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authRouter, users, authenticate } = require('./routers/authRouter.js');
const { bookmarkRouter } = require('./routers/bookmarkRouter.js');
const { reminderRouter } = require('./routers/reminderRouter.js');
const { prefRouter } = require('./routers/prefRouter.js');

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

let apiRouter = express.Router();
app.use('/api', apiRouter);


apiRouter.use('/auth', authRouter);
apiRouter.use('/bookmarks', bookmarkRouter);
apiRouter.use('/reminders', reminderRouter);
apiRouter.use('/prefs', prefRouter);

apiRouter.get('/secret', authenticate, (req, res) => {
  res.send({ msg: 'This is a secret message for authenticated users only!' });
});

apiRouter.get('/ping', (_req, res) => {
  res.send({ msg: 'pong' });
});

// app.get('/{*splat}', (_req, res) => {
//   res.send({ msg: 'Simon service' });
// });

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;