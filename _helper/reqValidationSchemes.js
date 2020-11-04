const Validator = require('jsonschema').Validator
const mongoose = require('mongoose')

// TODO nested schema for username and password
// https://json-schema.org/draft/2019-09/json-schema-validation.html

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
      minLength: 5,
      maxLength: 32
    }
  },
  required: [
    'username',
    'password'
  ]
}

const LoginReqSchema = {
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
      minLength: 5,
      maxLength: 32
    }
  },
  required: [
    'username',
    'password'
  ]
}

const UpdateUserReqSchema = {
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
      minLength: 5,
      maxLength: 32
    }
  },
  required: [
    'username',
    'password'
  ]
}

const PostReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 150

    },
    description: {
      type: 'string',
      maxLength: 2000
    },
    public: {
      type: 'boolean'
    }
  },
  required: [
    'title'
  ]
}

// https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-isValidObjectId
Validator.prototype.customFormats.mongooseId = function (input) {
  return mongoose.isValidObjectId(input)
}

const CommentReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    parent: {
      type: 'string',
      format: 'mongooseId'
    },
    description: {
      type: 'string',
      maxLength: 500
    }
  },
  required: [
    'parent',
    'description'
  ]
}

module.exports = {
  RegisterReqSchema,
  LoginReqSchema,
  UpdateUserReqSchema,
  PostReqSchema,
  CommentReqSchema
}
