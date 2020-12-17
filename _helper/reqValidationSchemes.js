const Validator = require('jsonschema').Validator;
const mongoose = require('mongoose');

/**
 * Stores JsonSchemas for request validation
 * @description Schemas based on https://json-schema.org/draft/2019-09/json-schema-validation.html
 * @module schemas
 * @requires mongoose
 * @requires jsonschema
 */


/**
 * Properties a username must fulfill to be deemed valid
 * @description Pattern derived from
 * https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username/12019115
 * @const
 */
const usernameProperties = {
  type: 'string',
  minLength: 2,
  maxLength: 16,
  pattern: '^(?=[a-zA-Z0-9-_]{2,16}$)[^_-].*[^_-]$',
};


/**
 * Properties a password must fulfill to be deemed valid
 * @description Pattern derived from
 * https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
 * @const
 */
const passwordProperties = {
  type: 'string',
  minLength: 5,
  maxLength: 32,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)' +
    '(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{5,32}$',

};


/**
 * Custom schema validator to validate mongoose ids
 * @description Calls https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-isValidObjectId
 * @param {string} input - String to validate
 * @return {boolean} - If input is a valid mongoose id
 */
Validator.prototype.customFormats.mongooseId = function(input) {
  return mongoose.isValidObjectId(input);
};


/**
 * Schema for a register request body
 * @const
 */
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


/**
 * Schema for a login request body
 * @const
 */
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


/**
 * Schema for a user update request body
 * @const
 */
const UpdateUserReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    editUsername: usernameProperties,
    editPassword: passwordProperties,
    editStatus: {
      type: 'string',
      maxLength: 150,
    },
    resetAvatar: {
      'type': 'string',
      'enum': ['on', 'off'],
    },
  },
  required: [
    'editStatus',
  ],
};


/**
 * Schema for a new post request body
 * @const
 */
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
    type: {
      type: 'string',
      enum: ['text', 'img', 'link'],
    },
    images: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: [
    'title',
    'description',
  ],
};


/**
 * Schema for a new comment request body
 * @const
 */
const CommentReqSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    description: {
      type: 'string',
      maxLength: 500,
    },
  },
  required: [
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
