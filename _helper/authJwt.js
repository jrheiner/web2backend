const jwt = require('express-jwt');
const jwtConfig = require('../config/config.json').jwt;
const User = require('../models/user.model');

// See Claims https://tools.ietf.org/html/rfc7519#section-4.1.3

const jwtAuth = jwt({
  secret: jwtConfig.secret,
  algorithms: ['HS256'],
  isRevoked: isRevoked,
  audience: jwtConfig.audience,
  issuer: jwtConfig.issuer,
});

// revoke token if user was deleted while logged in
async function isRevoked(req, payload, done) {
  const user = await User.findById(payload.id);
  if (!user) {
    return done(null, true);
  }
  done();
}

module.exports = jwtAuth;
