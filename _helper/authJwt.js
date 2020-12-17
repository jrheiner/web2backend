const jwt = require('express-jwt');
const jwtConfig = require('../config/config.json').jwt;
const User = require('../models/user.model');

/**
 * JsonWebToken Authentication middleware
 * @description Checks incoming request for a valid jsonwebtoken.
 * Valid meaning a token signed with the server secret and configuration.
 * @module jwt-auth
 * @requires express-jwt
 */

/**
 * @type {function}
 */
const jwtAuth = jwt({
  secret: jwtConfig.secret,
  algorithms: ['HS256'],
  isRevoked: isRevoked,
  audience: jwtConfig.audience,
  issuer: jwtConfig.issuer,
});

/**
 * Revoke a jsonwebtoken when the associated user was deleted
 * @param {Request} req  - Route request
 * @param {Object} payload - Request body that contains the Authorization token
 * @param {function} done - Callback function as user existence check is async
 * @return {Promise<*>}
 */
async function isRevoked(req, payload, done) {
  const user = await User.findById(payload.id);
  if (!user) {
    return done(null, true);
  }
  done();
}

module.exports = jwtAuth;
