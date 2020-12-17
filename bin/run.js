const http = require('http');
const app = require('../app').app;
const appConfig = require('../config/config.json').app;
const debug = require('debug')('backend:server');

/**
 * Configuration to run the application server
 * @module run
 * @requires http
 * @requires debug
 */


/**
 * Port the app is served on
 * @type {number}
 * @const
 */
const port = appConfig.port;
app.set('port', port);


/**
 * HTTP server that serves the app
 * @const
 */
const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


/**
 * Error handler for the http server
 * @param {*} error -  Error
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

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


/**
 * Outputs server address and port to console when server started successfully
 */
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
