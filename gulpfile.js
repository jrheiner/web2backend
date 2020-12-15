const {src, dest, series, parallel} = require('gulp');
const eslint = require('gulp-eslint');
const log = require('fancy-log');
const fs = require('fs');
const del = require('del');
const webpack = require('webpack-stream');
const exec = require('child_process').exec;


function checkDevDirStructure(cb) {
  const dirs = ['public/avatars', 'public/assets'];
  log(' # Required directories: '+dirs.toString());
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      log(` ✓ Created required directory ${dir}`);
    } else {
      log(` ✓ Found required directory ${dir}`);
    }
  });
  cb();
}

function checkProdDirStructure(cb) {
  const dirs = [
    'dist',
    'dist/public/',
    'dist/public/avatars',
    'dist/public/assets',
  ];
  log(' # Required directories: '+dirs.toString());
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      log(` ✓ Created required directory ${dir}`);
    } else {
      log(` ✓ Found required directory ${dir}`);
    }
  });
  cb();
}

function checkConfig(cb) {
  const path = 'config/config.json';
  const example = 'config/config.example.json';
  log(' # Searching for config file...');
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

function buildAngularCodeTask(cb) {
  log(' # Building Angular app...');
  return exec('cd ../FrontEnd && ng build --prod=true --base-href "/"',
      function(err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
      });
}

function copyAngularCodeTask() {
  log(' # Copying Angular production files');
  return src('../FrontEnd/dist/FrontEnd/**')
      .pipe(dest('dist/public'));
}

function runLinter(cb) {
  return src(['**/*.js', '!node_modules/**', '!public/**', '!dist/**'])
      .pipe(eslint({configFile: '.eslintrc.js', fix: true}))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .pipe(eslint.results((results) => {
        log(` # Total Warnings: ${results.warningCount}`);
        log(` # Total Errors: ${results.errorCount}`);
      })).on('end', function() {
        cb();
      });
}

function runTests(cb) {
  log('runTests');
  cb();
}

function clean() {
  log('Removing old build files...');
  return del(['dist/**', '!dist/public/',
    '!dist/public/avatars', '!dist/public/avatars/*.png',
    '!dist/public/assets', '!dist/public/assets/*.png',
  ],
  {force: true});
}

function bundle(cb) {
  return src('app.js')
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(dest('dist/')).on('end', function() {
        cb();
      });
}

const build = parallel(
    checkProdDirStructure,
    buildAngularCodeTask,
    bundle,
);
const prod = series(runLinter, runTests, clean, build, copyAngularCodeTask);

exports.test = runTests;
exports.lint = runLinter;
exports.default = prod;
exports.prod = prod;
exports.dev = series(
    checkDevDirStructure,
    checkConfig,
    runLinter,
);
