var gulp = require('gulp'),
  gutil = require('gulp-util'),
  sh = require('shelljs'),
  del = require('del'),
  fs = require('fs'),
  bowerFiles = require('main-bower-files'),
  config = require('./gulp.config')(),
  $ = require('gulp-load-plugins')({ lazy: true }),
  tsProject = $.typescript.createProject('tsconfig.json');

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('clean-styles', cleanStyles);
gulp.task('styles', ['clean-styles'], compileStyles);

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', cleanTs);

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', ['clean-ts'], compileTs);

gulp.task('wiredep', ['compile-ts'], function () {
  log('Wire up the bower js/css into index.html');
  var options = config.getBowerFilesDefaultOptions();
  // var bowerOrdered = gulp.src(bowerFiles(options), { read: false })
  //     .pipe($.order(['**/*jquery.*js']));

  return gulp
    .src(config.index)
    .pipe($.inject(gulp.src(bowerFiles(options), { read: false }), { name: 'bower', relative: true }))
    .pipe(gulp.dest(config.src));
});

/**
 * Task used by Ionic-cli > 2.0.0
 */
gulp.task('serve:before', ['watch']);

gulp.task('inject', ['wiredep', 'styles'], function () {
  log('Wire up the app js/css into index.html, and call wiredep');

  return gulp
    .src(config.index)
    .pipe($.inject(gulp.src(config.js, { read: false }), { relative: true }))
    .pipe($.inject(gulp.src(config.css, { read: false }), { relative: true }))
    .pipe(gulp.dest(config.src));
});

gulp.task('watch', ['inject'], function () {
  // $.watch(config.ts, function (vinyl) {
  //   console.log(vinyl.event)
  //   if (vinyl.event == 'add' || vinyl.event == 'unlink') {
  //     return compileTs(wireAppJs);
  //   }

  //   compileTs();
  // })

  gulp.watch(config.ts, function (event) {
    if (event.type == 'added' || event.type == 'deleted' || event.type == 'renamed') {
      return cleanTs(compileTs(wireAppJs));
    }

    compileTs();
  });

  gulp.watch(config.scss, function (event) {
    if (event.type == 'added' || event.type == 'deleted' || event.type == 'renamed') {
      return cleanStyles(compileStyles(wireAppCss));
    }

    compileStyles();
  });
});

////////////////////////////

function compileTs(cb) {
  tsProject.src()
    .pipe($.sourcemaps.init())
    .pipe(tsProject()).js
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(config.tsOutputPath))
    .on('end', function () { cb && cb() })
}

function cleanTs(done) {
  var typeScriptGenFiles = [
    config.tsOutputPath + '/**/*.js',    // path to all JS files auto gen'd by editor
    config.tsOutputPath + '/**/*.js.map', // path to all sourcemap files auto gen'd by editor
    '!' + config.tsOutputPath + '/config.module.js'
  ];

  // delete the files
  clean(typeScriptGenFiles, done);
}

function wireAppJs() {
  return gulp
    .src(config.index)
    .pipe($.inject(gulp.src(config.js, { read: false }), { relative: true }))
    .pipe(gulp.dest(config.src));
}

function compileStyles(cb) {
  gulp.src(config.scss)
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    // .pipe($.autoprefixer())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(config.src + 'css/'))
    // .pipe($.minifyCss({
    //   keepSpecialComments: 0
    // }))
    // .pipe($.rename({ extname: '.min.css' }))
    // .pipe(gulp.dest(config.src + 'css/'))
    .on('end', function () { cb && cb() })
}

function cleanStyles(cb) {
  var scssGenFiles = [
    config.cssOutputPath + '/**/*.css',    // path to all CSS files auto gen'd
    config.cssOutputPath + '/**/*.css.map', // path to all sourcemap files auto gen'd
  ];

  clean(scssGenFiles, cb);
}

function wireAppCss() {
  return gulp
    .src(config.index)
    .pipe($.inject(gulp.src(config.css, { read: false }), { relative: true }))
    .pipe(gulp.dest(config.src));
}

function clean(path, done) {
  log('Cleaning: ' + path);
  del(path).then(function () {
    done && done();
  });
}

function log(msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}
