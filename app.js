const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mConfig = require('./config/config.json').mongo;
const lConfig = require('./config/config.json').logging;
const compression = require('compression');
const postRouter = require('./routes/posts.routes');
const commentRouter = require('./routes/comments.routes');
const userRouter = require('./routes/user.routes');
const projectStats = require('./_helper/projectStats');

const debug = require('debug')(lConfig.namespace);

const app = express();

// TODO logger format tiny or combined
app.use(logger(lConfig.format, {
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

const dbUri = `${mConfig.protocol}://${mConfig.user}:${mConfig.password}@${mConfig.url}/${mConfig.db}?${mConfig.options}`;
mongoose.connect(dbUri, mongooseOptions)
    .then(() => {
      debug(`Connected to the database ${mConfig.db} [${mConfig.url}]`);
    })
    .catch((err) => {
      debug(`Failed to connect to ${mConfig.db}! Error:\n${err}`);
      process.exit(0);
    });

mongoose.connection.on('error', (err) => {
  debug(
      `Connection to database ${mConfig.db} [${mConfig.url}] errored:\n${err}`);
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    debug(
        `Connection to database ${mConfig.db} [${mConfig.url}] disconnected`);
    process.exit(0);
  });
});

module.exports = app;
