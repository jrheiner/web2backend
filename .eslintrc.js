module.exports = {
  'env': {
    node: true,
    commonjs: true,
    es2020: true,
    mocha: true,
  },
  'extends': [
    'eslint:recommended', 'google',
  ],
  'rules': {
    'require-jsdoc': 'off',
    'new-cap': 'off',
  },
};
