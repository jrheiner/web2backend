const http = require('http');
const app = require('../app').app;
const appConfig = require('../config/config.json').app;
const debug = require('debug')('backend:server');


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
