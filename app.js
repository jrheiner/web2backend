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
  if (process.env.DEBUG) {
    debug('Config \'./config/config.json\' not found.');
    debug('Check the ReadMe.md for instructions.');
  } else {
    console.log('Production build is missing a config file!');
  }
  process.exit(0);
}

const postRouter = require('./routes/posts.routes');
const commentRouter = require('./routes/comments.routes');
const userRouter = require('./routes/user.routes');
const projectStats = require('./_helper/projectStats');


/**
 * Creates express app
 * @type {Express}
 */
const app = express();


/**
 * Outputs all requests to console
 */
app.use(logger(logConfig.format, {
  stream: {
    write: (msg) => {
      (process.env.DEBUG ? debug(msg.trimEnd()) : console.log(msg.trimEnd()));
    },
  },
}));


/**
 * Set secure HTTP headers
 * @description contentSecurityPolicy is disabled so the
 * Angular Application can load images from the cloud cdn
 */
app.use(helmet({
  contentSecurityPolicy: false,
}));


/**
 * Enable compression middleware to improve performance
 */
app.use(compression());

/**
 * Set up express middleware for parsing requests
 */
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

/**
 * Define API routes and assign routers
 */
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/user', userRouter);
app.get('/api/', projectStats);

/**
 * Serve Angular build files
 * @description Also sends all requests to 'undefined'
 * paths to index.html so the angular routing can take care of it.
 * For example /post/:id would otherwise return 'CANNOT GET...'
 * because its defined in the internal Angular routing
 */
app.get('*.*', express.static('public'));
app.all('*', function(req, res) {
  res.status(200).sendFile('/', {root: 'public'});
});

/**
 * Handling 401 Unauthorized
 * when user accesses protected routes without session token
 */
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({error: true, message: 'User not logged in!'});
  }
  next();
});

/**
 * Set Mongoose options
 */
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
/**
 * Build database uri from config
 */
const dbUri = `${dbConfig.protocol}://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/${dbConfig.db}?${dbConfig.options}`;
/**
 * Connection to database
 */
mongoose.connect(dbUri, mongooseOptions)
    .then(() => {
      if (process.env.DEBUG) {
        debug(`Connected to the database ${dbConfig.db} [${dbConfig.host}]`);
      } else {
        console.log(
            `Connected to the database ${dbConfig.db} [${dbConfig.host}]`);
      }
    })
    .catch((err) => {
      if (process.env.DEBUG) {
        debug(`Failed to connect to ${dbConfig.db}!\n${err}`);
      } else {
        console.log(
            `Failed to connect to ${dbConfig.db}!\n${err}`);
      }
      process.exit(0);
    });

/**
 * Database connection error handler
 */
mongoose.connection.on('error', (err) => {
  if (process.env.DEBUG) {
    debug(
        `Connection to database ${dbConfig.db} [${dbConfig.host}] errored:\n
      ${err}`);
  } else {
    console.log(
        `Connection to database ${dbConfig.db} [${dbConfig.host}] errored:\n
      ${err}`);
  }
});

/**
 * Close database connection when applications exists
 */
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    if (process.env.DEBUG) {
      debug(`Connection ${dbConfig.db} [${dbConfig.host}] disconnected`);
    } else {
      console.log(`Connection ${dbConfig.db} [${dbConfig.host}] disconnected`);
    }
    process.exit(0);
  });
});


module.exports = {
  app,
  mongoose,
};
