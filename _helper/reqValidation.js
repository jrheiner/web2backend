const Validator = require('jsonschema').Validator;
const ReqSchemes = require('./reqValidationSchemes');

const v = new Validator();

module.exports = {
  validateRegisterReq,
  validateLoginReq,
  validateUpdateUserReq,
  validatePostReq,
  validateCommentReq,
};

function validateRegisterReq(registerReq) {
  return v.validate(registerReq, ReqSchemes.RegisterReqSchema);
}

function validateLoginReq(loginReq) {
  return v.validate(loginReq, ReqSchemes.LoginReqSchema);
}

function validateUpdateUserReq(updateReq) {
  return v.validate(updateReq, ReqSchemes.UpdateUserReqSchema);
}

function validatePostReq(postReq) {
  return v.validate(postReq, ReqSchemes.PostReqSchema);
}

function validateCommentReq(commentReq) {
  return v.validate(commentReq, ReqSchemes.CommentReqSchema);
}
