var gulp      = require('gulp'),
  taskListing = require('gulp-task-listing'),
  $           = require('gulp-load-plugins')(),
  minify      = require('gulp-minify-css'),
  pagespeed   = require('psi'),
  browserSync = require('browser-sync'),
  imageop = require('gulp-image-optimization');

var publicPath = 'public';
var sourcePath = 'sources';
var bowerDir   = 'library';
var config = {
  url: "",
  sources: {
    lessPath : sourcePath + '/less',
    jsPath   : sourcePath + '/scripts',
    iconPath : bowerDir   + '/fontawesome/fonts',
    imgPath  : sourcePath + '/images'
  },
  dist: {
    cssPath  : publicPath + '/css',
    jsPath   : publicPath + '/js',
    iconPath : publicPath + '/fonts',
    imgPath  : publicPath + '/img'
  }
};

gulp.task('help', taskListing);
gulp.task('default', ['install']);
gulp.task('deploy', ['dist']);
gulp.task('compile', ['compile-less', 'compile-js']);
gulp.task('test', ['test-lint']);

/**********************************************/
/************* Dist build *********************/
gulp.task('dist', ['dist-bower', 'dist-icons', 'dist-external']);
gulp.task('dist-bower', function () {
  $.bower()
    .pipe(gulp.dest(bowerDir));
});
gulp.task('dist-icons', ['dist-bower'], function () {
  gulp.src(config.sources.iconPath + '/**.*')
    .pipe(gulp.dest(config.dist.iconPath));
});
gulp.task('dist-external', ['dist-bower'], function () {
  gulp.src([
    bowerDir + '/jquery/dist/**.*',
    bowerDir + '/bootstrap/dist/js/**.*',
    !bowerDir + '/bootstrap/dist/js/npm.js'
  ])
    .pipe(gulp.dest(config.sources.jsPath + '/external'));

  gulp.src([
    bowerDir + '/html5shiv/dist/html5shiv.min.js',
    bowerDir + '/respond-minmax/dest/respond.min.js'
  ])
    .pipe(gulp.dest(config.dist.jsPath));
});
/**********************************************/
/**********************************************/

/**********************************************/
/********** Page speed test *******************/
gulp.task('test-pagespeed', ['test-pagespeed-mobile', 'test-pagespeed-desktop']);
gulp.task('test-pagespeed-mobile', function () {
  pagespeed.output(config.url, {
    strategy: 'mobile'
  }, function (err) {
    if (err) {
      console.error(err);
    }
  });
});
gulp.task('test-pagespeed-desktop', function () {
  pagespeed.output(config.url, {
    strategy: 'desktop'
  }, function (err) {
    if (err) {
      console.error(err);
    }
  });
});
/**********************************************/
/**********************************************/

/**********************************************/
/************* Lint test **********************/
gulp.task('test-lint', ['test-lint-css', 'test-lint-js']);
gulp.task('test-lint-css', function () {
  gulp.src([config.dist.cssPath  + '/*.css'])
    .pipe($.plumber())
    .pipe(browserSync.reload({stream: true, once: false}))
    .pipe($.csslint())
    .pipe($.notify({
      message: "CSS Lint file: <%= file.relative %>",
      templateOptions: {}
    }))
    .pipe($.csslint.reporter());
});
gulp.task('test-lint-js', function () {
  gulp.src([config.sources.jsPath + "/*.js"])
    .pipe($.plumber())
    .pipe(browserSync.reload({stream: true, once: false}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jscs({esnext: true}))
    .pipe($.notify({
      message: "JS Lint file: <%= file.relative %>",
      templateOptions: {}
    }))
    .pipe($['if'](!browserSync.active, $.jshint.reporter('fail')));
});
/**********************************************/
/**********************************************/

/**********************************************/
/************* Validation *********************/
gulp.task('test-validation', ['test-validation-html']);
gulp.task('test-validation-html', function () {
  gulp.src(publicPath  + '/*.html')
    .pipe($.plumber())
    .pipe($.w3cjs())
    .pipe($.notify({
      message: "HTML Validator: <%= file.relative %>",
      templateOptions: {}
    }));
});
/**********************************************/
/**********************************************/

/**********************************************/
/************* Compilation ********************/
gulp.task('compile-less', function () {
  gulp.src([config.sources.lessPath + '/*.less'])
    .pipe($.plumber())
    .pipe($.concat('style.min.less'))
    .pipe($.less())
    .pipe(minify({keepSpecialComments : 0}))
    .pipe(gulp.dest(config.dist.cssPath))
    .pipe($.notify({
      message: "Compilation file: <%= file.relative %>",
      templateOptions: {}
    }));
});
gulp.task('compile-js', ['test-lint-js'], function () {
  gulp.src([
    config.sources.jsPath + '/*.js',
    config.sources.jsPath + '/external/*.js'
  ])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.concat('main.min.js'))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist.jsPath))
    .pipe($.notify({
      message: "Compilation file: <%= file.relative %>",
      templateOptions: {}
    }));
});
gulp.task('optimize-images', function (callback) {
  gulp.src([config.sources.imgPath + '/*.*'])
    .pipe($.plumber())
    .pipe(imageop(
      {
        optimizationLevel: 7,
        progressive: true,
        interlaced: true
      }
    ))
    .pipe(gulp.dest(config.dist.imgPath))
    .on('end', callback)
    .on('error', callback);
});
/**********************************************/
/**********************************************/

gulp.task('watch', function () {
  gulp.src(publicPath)
    .pipe($.webserver({
      port: 1234,
      livereload: true,
      directoryListing: false,
      fallback: 'index.html',
      open: true,
      https: false
    }));

  gulp.watch(config.lessPath + '/*.less', ['compile-less']);
  gulp.watch(sourcePath + '/js/*.js', ['test-lint-js', 'compile-js']);
  gulp.watch(sourcePath + '/js/external/*.*', ['compile-js']);
  gulp.watch(sourcePath + '/images/*.*', ['optimize-images']);
  gulp.watch(publicPath + '/*.html', ['test-validation-html']);
});
