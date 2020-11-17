const Validator = require('jsonschema').Validator;
const mongoose = require('mongoose');

// https://json-schema.org/draft/2019-09/json-schema-validation.html

// https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username/12019115
const usernameProperties = {
  type: 'string',
  minLength: 2,
  maxLength: 16,
  pattern: '^(?=[a-zA-Z0-9-_]{2,16}$)[^_-].*[^_-]$',
};

// https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
const passwordProperties = {
  type: 'string',
  minLength: 5,
  maxLength: 32,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{5,32}$',

};

const RegisterReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'RegisterReqSchema',
  type: 'object',
  properties: {
    username: usernameProperties,
    password: passwordProperties,
  },
  required: [
    'username',
    'password',
  ],
};

const LoginReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    username: usernameProperties,
    password: passwordProperties,
  },
  required: [
    'username',
    'password',
  ],
};

const UpdateUserReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    username: usernameProperties,
    password: passwordProperties,
    status: {
      type: 'string',
      maxLength: 150,
    },
  },
  required: [
    'username',
    'status',
  ],
};

const PostReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 150,

    },
    description: {
      type: 'string',
      maxLength: 2000,
    },
    public: {
      type: 'boolean',
    },
  },
  required: [
    'title',
  ],
};

// https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-isValidObjectId
Validator.prototype.customFormats.mongooseId = function(input) {
  return mongoose.isValidObjectId(input);
};

const CommentReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    parent: {
      type: 'string',
      format: 'mongooseId',
    },
    description: {
      type: 'string',
      maxLength: 500,
    },
  },
  required: [
    'parent',
    'description',
  ],
};

module.exports = {
  RegisterReqSchema,
  LoginReqSchema,
  UpdateUserReqSchema,
  PostReqSchema,
  CommentReqSchema,
};
