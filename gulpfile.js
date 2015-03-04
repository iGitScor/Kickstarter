/**
 * gulpfile.js
 */

/*************************************************************
 *************************************************************
 * Gulp dependencies
 */
var gulp      = require('gulp'),
  taskListing = require('gulp-task-listing'),
  $           = require('gulp-load-plugins')(),
  minify      = require('gulp-minify-css'),
  jsoneditor  = require('gulp-json-editor'),
  pagespeed   = require('psi'),
  browserSync = require('browser-sync'),
  imageop     = require('gulp-image-optimization'),
  runSequence = require('run-sequence').use(gulp),
  fs          = require('fs'),
  path        = require('path'),
  _           = require('lodash');
/*************************************************************
 *************************************************************/

/*************************************************************
 *************************************************************
 * Project setup
 */
var config;
var project;
var kickstarter = require('./kickstarter.json');
function getFolders() {
  return fs.readdirSync('./config')
    .filter(function (file) {
      return fs.statSync(path.join('./config', file)).isDirectory();
    });
}
function getConfig() {
  try {
    project = require(kickstarter.configuration.project);
    if (project.config) {
      config = require('./config/' + project.config + '/config.json');
    }
  } catch (exception) {
    // Display that the configuration is missing only if we run another tasks than configuration one.
    if (_.last(this.process.argv) !== 'configuration') {
      console.warn('The project is not configured. Please run gulp configuration.');
    }
  }
}
var configFolders = {
  choices: getFolders()
};
getConfig();
/*************************************************************
 *************************************************************/

/*************************************************************
 *************************************************************
 * Shortcut kickstarter's tasks
 */
gulp.task('kick', ['configuration'], function () {
  gulp.start('installation');
});
gulp.task('start', ['watch']);

gulp.task('help', taskListing);
gulp.task('default', ['watch']);
gulp.task('test', ['test-lint', 'test-validation']);
gulp.task('compile', function (callback) {
  if (config.tasks.compile) {
    runSequence(
      ['compile-less', 'compile-sass', 'compile-js'],
      callback
    );
  } else {
    callback();
  }
});
gulp.task('configuration', function (callback) {
  fs.exists(kickstarter.configuration.project, function (appConfigExist) {
    var loadConfig;
    if (appConfigExist) {
      loadConfig = require(kickstarter.configuration.project);
    }
    if (!appConfigExist || !loadConfig.config) {
      gulp.src('.')
        .pipe($.prompt.prompt(
          _.merge(kickstarter.prompt.projects, configFolders),
          function (res) {
            if (!appConfigExist) {
              // Create an empty Object structure in a JSON configuration file
              fs.writeFile(kickstarter.configuration.project, '{}', function (fsError) {
                if (fsError) {
                  console.error(fsError);
                }
              });
            }

            gulp.src(kickstarter.configuration.project)
              .pipe(jsoneditor(
                {
                  'config': res.type
                }
              ))
              .pipe(gulp.dest('./config'));
          }
        ))
        .pipe($.prompt.prompt(
          kickstarter.prompt.site,
          function (res) {
            gulp.src(kickstarter.configuration.project)
              .pipe(jsoneditor(
                {
                  'url': res.site
                }
              ))
              .pipe(gulp.dest('./config'));
            getConfig();
            callback();
          }
        ));
    } else {
      callback();
    }
  });
});
gulp.task('installation', ['configuration'], function (callback) {
  runSequence(
    'dist',
    ['compile', 'optimize-images'],
    callback
  );
});

/**********************************************/
/************* Dist build *********************/
gulp.task('dist', function (callback) {
  if (config.tasks.dist) {
    runSequence(
      'dist-bower',
      ['dist-external', 'dist-icons'],
      callback
    );
  } else {
    callback();
  }
});
gulp.task('dist-bower', function () {
  return $.bower()
    .pipe(gulp.dest(config.bowerDir));
});
gulp.task('dist-icons', function () {
  return gulp.src([
    config.bowerDir + config.sources.faPath + '/**.*',
    config.sources.mainPath + config.sources.iconPath + '/**/*.*'
  ])
    .pipe(gulp.dest(config.dist.mainPath + config.dist.iconPath));
});
gulp.task('dist-external', function () {
  gulp.src([
    config.bowerDir + '/jquery/dist/**.*',
    config.bowerDir + '/bootstrap/dist/js/**.*',
    !config.bowerDir + '/bootstrap/dist/js/npm.js'
  ])
    .pipe(gulp.dest(config.sources.mainPath + config.sources.jsPath + '/external'));

  return gulp.src([
    config.bowerDir + '/html5shiv/dist/html5shiv.min.js',
    config.bowerDir + '/respond-minmax/dest/respond.min.js'
  ])
    .pipe(gulp.dest(config.dist.mainPath + config.dist.jsPath));
});
/**********************************************/
/**********************************************/

/**********************************************/
/********** Page speed test *******************/
gulp.task('test-pagespeed', ['test-pagespeed-mobile', 'test-pagespeed-desktop']);
gulp.task('test-pagespeed-mobile', function () {
  pagespeed.output(project.url, {
    strategy: 'mobile'
  }, function (err) {
    if (err) {
      console.error(err);
    }
  });
});
gulp.task('test-pagespeed-desktop', function () {
  pagespeed.output(project.url, {
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
  gulp.src([config.dist.mainPath + config.dist.cssPath  + '/*.css'])
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
  gulp.src([config.sources.mainPath + config.sources.jsPath + "/*.js"])
    .pipe($.plumber())
    .pipe(browserSync.reload({stream: true, once: false}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jscs({esnext: true}))
    .pipe($.notify({
      message: "JS Lint file: <%= file.relative %>",
      templateOptions: {}
    }));
});
/**********************************************/
/**********************************************/

/**********************************************/
/************* Validation *********************/
gulp.task('test-validation', ['test-validation-html']);
gulp.task('test-validation-html', function () {
  gulp.src(config.dist.mainPath  + '/*.html')
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
gulp.task('compile-less', function (callback) {
  return gulp.src([config.sources.mainPath + config.sources.lessPath + '/*.less'])
    .pipe($.concat('style.min.less'))
    .pipe($.less())
    .on(
      'error',
      function () {
        gulp.src('.')
          .pipe(
            $.notify({message: "A pony has encountered a rainbow issue", "icon": path.join(__dirname, "gulp.gif")})
          );
        callback();
      }
    )
    .pipe(minify({keepSpecialComments : 0}))
    .pipe(gulp.dest(config.dist.mainPath + config.dist.cssPath))
    .pipe($.notify({
      message: "Compilation file: <%= file.relative %>",
      templateOptions: {}
    }));
});
gulp.task('compile-sass', function () {
  gulp.src([config.sources.mainPath + config.sources.sassPath + '/*.scss'])
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(config.dist.mainPath + config.dist.cssPath))
    .pipe($.notify({
      message: "Compilation file: <%= file.relative %>",
      templateOptions: {}
    }));
});
gulp.task('compile-js', ['test-lint-js'], function () {
  return gulp.src([
    config.sources.mainPath + config.sources.jsPath + '/*.js',
    config.sources.mainPath + config.sources.jsPath + '/external/*.js'
  ])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.concat('main.min.js'))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist.mainPath + config.dist.jsPath))
    .pipe($.notify({
      message: "Compilation file: <%= file.relative %>",
      templateOptions: {}
    }));
});
gulp.task('optimize-images', function (callback) {
  if (config.tasks.optimize) {
    gulp.src([config.sources.mainPath + config.sources.imgPath + '/*.*'])
      .pipe($.plumber())
      .pipe(imageop(
        {
          optimizationLevel: 7,
          progressive: true,
          interlaced: true
        }
      ))
      .pipe(gulp.dest(config.dist.mainPath + config.dist.imgPath))
      .on('end', callback)
      .on('error', callback);
  } else {
    callback();
  }
});

// TODO CREATE A DIST HTML TASK

/**********************************************/
/**********************************************/
gulp.task('watch', function () {
  gulp.src(config.dist.mainPath)
    .pipe($.webserver({
      port: 1234,
      livereload: true,
      directoryListing: false,
      fallback: 'index.html',
      open: true,
      https: false
    }));

  gulp.watch(config.sources.mainPath + config.sources.lessPath + '/*.less', ['compile-less']);
  gulp.watch(config.sources.mainPath + config.sources.sassPath + '/*.scss', ['compile-sass']);
  gulp.watch(config.sources.mainPath + config.sources.jsPath + '/*.js', ['test-lint-js', 'compile-js']);
  gulp.watch(config.sources.mainPath + config.sources.jsPath + '/external/*.*', ['compile-js']);
  gulp.watch(config.sources.mainPath + config.sources.imgPath + '/*.*', ['optimize-images']);
  gulp.watch(config.sources.mainPath + '/*.html', ['test-validation-html', 'dist-html']);
});
