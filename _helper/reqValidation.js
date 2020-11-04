const Validator = require('jsonschema').Validator
const ReqSchemes = require('./reqValidationSchemes')

const v = new Validator()

const registerReq = {
  username: '123456789123123131234567',
  password: '1245'
}

console.log(v.validate(registerReq, ReqSchemes.RegisterReqSchema))
