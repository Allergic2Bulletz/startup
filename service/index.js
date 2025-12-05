const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const {authRouter, users} = require('./routers/authRouter');


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

// app.get('/{*splat}', (_req, res) => {
//   res.send({ msg: 'Simon service' });
// });

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});