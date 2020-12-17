/** JsonSchema Validator
 * @module validation
 * @requires jsonschema.Validator
 */
const Validator = require('jsonschema').Validator;
const ReqSchemes = require('./reqValidationSchemes');

/**
 * JsonSchema Validator
 * @type {object}
 * @const
 * @namespace requestValidator
 */
const v = new Validator();

module.exports = {
  validateRegisterReq,
  validateLoginReq,
  validateUpdateUserReq,
  validatePostReq,
  validateCommentReq,
};


/**
 * Validates an incoming register request body
 * @memberof module:validation~requestValidator
 * @param {Request} registerReq - Incoming register request
 * @return {*} - Validation results
 */
function validateRegisterReq(registerReq) {
  return v.validate(registerReq, ReqSchemes.RegisterReqSchema);
}


/**
 * Validates an incoming login request body
 * @memberof module:validation~requestValidator
 * @param {Request} loginReq - Incoming login request
 * @return {*} - Validation results
 */
function validateLoginReq(loginReq) {
  return v.validate(loginReq, ReqSchemes.LoginReqSchema);
}


/**
 * Validates an incoming user update request body
 * @memberof module:validation~requestValidator
 * @param {Request} updateReq - Incoming user update request
 * @return {*} - Validation results
 */
function validateUpdateUserReq(updateReq) {
  return v.validate(updateReq, ReqSchemes.UpdateUserReqSchema);
}


/**
 * Validates an incoming new post request body
 * @memberof module:validation~requestValidator
 * @param {Request} postReq - Incoming new post request
 * @return {*} - Validation results
 */
function validatePostReq(postReq) {
  return v.validate(postReq, ReqSchemes.PostReqSchema);
}


/**
 * Validates an incoming new comment request body
 * @memberof module:validation~requestValidator
 * @param {Request} commentReq - Incoming new comment request
 * @return {*} - Validation results
 */
function validateCommentReq(commentReq) {
  return v.validate(commentReq, ReqSchemes.CommentReqSchema);
}
