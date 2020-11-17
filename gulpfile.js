const {src, dest, series} = require('gulp');
const del = require('del');
const log = require('fancy-log');
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;

function lint(cb) {
  return src(['**/*.js', '!node_modules/**', '!public/**'])
      .pipe(eslint()) // .pipe(eslint.format())
  // .pipe(eslint.failAfterError())
      .on('end', function() {
        cb();
      });
}

function clean() {
  log('Removing angular build files');
  return del('public/**', {force: true});
}

function buildAngularCodeTask(cb) {
  log('Building FrontEnd code');
  return exec('cd ../FrontEnd && ng build --prod=true',
      function(err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
      });
}

function copyAngularCodeTask() {
  log('Copying Angular Production files into Express public directory');
  return src('../FrontEnd/dist/FrontEnd/**')
      .pipe(dest('public/'));
}

exports.default = series(
    lint,
    clean,
    buildAngularCodeTask,
    copyAngularCodeTask,
);
