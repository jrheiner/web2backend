const Validator = require('jsonschema').Validator
const ReqSchemes = require('./reqValidationSchemes')

const v = new Validator()

module.exports = {
  validateRegisterReq,
  validateLoginReq,
  validateUpdateUserReq,
  validatePostReq,
  validateCommentReq
}

function validateRegisterReq (registerReq) {
  return v.validate(registerReq, ReqSchemes.RegisterReqSchema)
}

function validateLoginReq (registerReq) {
  return v.validate(registerReq, ReqSchemes.LoginReqSchema)
}

function validateUpdateUserReq (registerReq) {
  return v.validate(registerReq, ReqSchemes.UpdateUserReqSchema)
}

function validatePostReq (registerReq) {
  return v.validate(registerReq, ReqSchemes.PostReqSchema)
}

function validateCommentReq (registerReq) {
  return v.validate(registerReq, ReqSchemes.CommentReqSchema)
}
