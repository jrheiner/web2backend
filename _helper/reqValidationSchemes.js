
const RegisterReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 2,
      maxLength: 16

    },
    password: {
      type: 'string',
      maxLength: 32,
      minLength: 5
    }
  },
  required: [
    'username',
    'password'
  ]
}

module.exports = {
  RegisterReqSchema
}
