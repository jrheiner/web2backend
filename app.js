const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const debug = require('debug')('backend:server');

let dbConfig;
let logConfig;
let appConfig;

try {
  appConfig = require('./config/config.json').app;
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

const app = express();

// TODO logger format tiny or combined
app.use(logger(logConfig.format, {
  stream: {
    write: (msg) => {
      (process.env.DEBUG ? debug(msg.trimEnd()) : console.log(msg));
    },
  },
}));
const csp = {
  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  'img-src': ['\'self\'', 'https://res.cloudinary.com/', 'data:'],
  'script-src-attr': ['\'self\'', '\'unsafe-inline\''],
};
console.log(csp);
// todo find working config
app.use(helmet({
  contentSecurityPolicy: false,
}));
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

const port = appConfig.port;
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      break;
    default:
      throw error;
  }
  process.exit(1);
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);
  if (!process.env.DEBUG) {
    if (port === 80) {
      console.log('Serving app on app.localhost');
    } else {
      console.log('Serving app on localhost:'+port);
    }
  }
}

/*
app.listen(appConfig.port, () => {
  console.log(`App listening at http://localhost:${appConfig.port}`);
});
*/
