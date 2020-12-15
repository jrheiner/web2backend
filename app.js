const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const debug = require('debug')('backend:server');

let dbConfig;
let logConfig;

try {
  dbConfig = require('./config/config.json').mongo;
  logConfig = require('./config/config.json').logging;
} catch (err) {
  debug('Config \'./config/config.json\' not found.');
  debug('Check the ReadMe.md for instructions.');
  process.exit(0);
}

const postRouter = require('./routes/posts.routes');
const commentRouter = require('./routes/comments.routes');
const userRouter = require('./routes/user.routes');
const projectStats = require('./_helper/projectStats');

const app = express();

// TODO logger format tiny or combined
app.use(logger(logConfig.format, {
  stream: {
    write: (msg) => debug(msg.trimEnd()),
  },
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/user', userRouter);
app.get('/api/', projectStats);

// Serve Angular app
app.get('*.*', express.static('public'));
app.all('*', function(req, res) {
  res.status(200).sendFile('/', {root: 'public'});
});


// TODO Migrate backend to typescript (including linting)
// TODO Check all console.log()
/*
  TODO Gulp file to build dev (install and build doc)
  and prod environment (build frontend, bundle js, lint, tests)
*/

// TODO Organize frontend angular components in modules

// TODO Mocha tests (idk api endpoints maybe)
// TODO Backend documentation + doc builder

// TODO implement general error handling
app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({error: true, message: 'User not logged in!'});
  }
});

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

const dbUri = `${dbConfig.protocol}://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/${dbConfig.db}?${dbConfig.options}`;
mongoose.connect(dbUri, mongooseOptions)
    .then(() => {
      debug(`Connected to the database ${dbConfig.db} [${dbConfig.host}]`);
    })
    .catch((err) => {
      debug(`Failed to connect to ${dbConfig.db}!\n${err}`);
      process.exit(0);
    });

mongoose.connection.on('error', (err) => {
  debug(
      `Connection to database ${dbConfig.db} [${dbConfig.host}] errored:\n
      ${err}`);
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    debug(
        `Connection to database ${dbConfig.db} [${dbConfig.host}] disconnected`);
    process.exit(0);
  });
});

module.exports = app;
