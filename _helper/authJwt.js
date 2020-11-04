const jwt = require('express-jwt')
const config = require('../config/config.json')
const User = require('../models/user.model')

// See Claims https://tools.ietf.org/html/rfc7519#section-4.1.3

const jwtAuth = jwt({
  secret: config.jwt,
  algorithms: ['HS256'],
  isRevoked: isRevoked,
  audience: config.jwt_audience,
  issuer: config.jwt_issuer
})

// revoke token if user was deleted while logged in
async function isRevoked (req, payload, done) {
  const user = await User.findById(payload.id)
  if (!user) {
    return done(null, true)
  }
  done()
}

module.exports = jwtAuth
