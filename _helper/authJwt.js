const jwt = require('express-jwt');
const config = require('../config/config.json');

// See Claims https://tools.ietf.org/html/rfc7519#section-4.1.3
// TODO Adjust audience and issuer claims

const jwtAuth = jwt({
    secret: config.jwt,
    algorithms: ['HS256'],
    audience: 'localhost',
    issuer: 'backend-dev'
});

module.exports = jwtAuth;
