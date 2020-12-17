const {src, dest, series} = require('gulp');
const mocha = require('gulp-mocha');
const eslint = require('gulp-eslint');
const log = require('fancy-log');
const fs = require('fs');
const del = require('del');
const exec = require('child_process').exec;
const jsdoc = require('gulp-jsdoc3');

/**
 * Gulpfile defining gulp tasks and pipelines
 * @module gulpfile
 * @requires gulp
 */

/**
 * Gulp task that checks if the config directory exists
 * and if a config file can be found.
 * @param {function} cb - Callback when task is fully executed
 */
function checkConfig(cb) {
  const path = 'config/config.json';
  const example = 'config/config.example.json';
  log(' # Searching for config file...');
  if (!fs.existsSync('config')) {
    log(` ✓ Created config directory`);
    fs.mkdirSync('config');
  }
  if (!fs.existsSync(path)) {
    if (fs.existsSync(example)) {
      fs.copyFileSync(example, path);
      log(` ✓ Created new config file based on config.example.json`);
      log(`[!] Configure it to connect to the database!`);
    } else {
      log(`[!] No config file found!`);
      log(`[!] A config file is required!`);
    }
  } else {
    log(` ✓ Found config file ${path}`);
  }
  cb();
}

/**
 * Gulp task that builds the Angular projects
 * @param {function}  cb - Callback when ng build is finished
 * @return {*}
 */
function buildAngularCode(cb) {
  log(' # Building Angular app...');
  return exec('cd ../FrontEnd && ng build --prod=true --base-href "/"',
      function(err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
      });
}

/**
 * Gulp task to copy the Angular build files
 * into the express public directory
 * @return {*}
 */
function copyAngularCode() {
  log(' # Copying Angular production files...');
  return src('../FrontEnd/dist/FrontEnd/**')
      .pipe(dest('public'));
}

/**
 * Gulp task that runs eslint,
 * outputs total warning and errors to console
 * @param {function} cb - Callback linting is finished
 * @return {*}
 */
function runLinter(cb) {
  return src([
    '**/*.js',
    '!node_modules/**',
    '!public/**',
    '!dist/**',
    '!docs/**',
  ]).pipe(eslint({configFile: '.eslintrc.js', fix: true}))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .pipe(eslint.results((results) => {
        log(` # Total Warnings: ${results.warningCount}`);
        log(` # Total Errors: ${results.errorCount}`);
      })).on('end', function() {
        cb();
      });
}

/**
 * Gulp tasks to run mocha test runner
 * @return {*}
 */
function runTests() {
  return src('./testing/*.spec.js', {read: false})
      .pipe(mocha({reporter: 'spec'}));
}

/**
 * Gulp task to build Documentation using jsdoc
 * @param {function} cb - Callback build is finished
 * @return {*}
 */
function buildDocs(cb) {
  return src([
    'README.md',
    './_helper/*.js',
    './bin/*.js',
    './controller/*.js',
    './models/*.js',
    './routes/*.js',
    './app.js',
    './gulpfile.js',
    '!./node_modules',
    '!./public',
  ], {read: false}).pipe(jsdoc(cb));
}

/**
 * Gulp task to remove all old build files
 * from the express public directory
 * @return {Promise<string[]> | *}
 */
function clean() {
  log('Removing old build files...');
  return del(['public/**', '!public/index.api.html'], {force: true});
}

/**
 * Gulp pipeline including all tasks for a production build.
 * Includes: checkConfig, runLinter, runTests,
 * clean, buildAngularCode, copyAngularCode,
 */
const prod = series(
    checkConfig,
    runLinter,
    runTests,
    clean,
    buildAngularCode,
    copyAngularCode,
);

exports.doc = buildDocs;
exports.test = runTests;
exports.lint = runLinter;
exports.default = prod;
exports.prod = prod;
exports.dev = series(
    checkConfig,
    runLinter,
    runTests,
);
