/**
 * gulpfile.js
 */

/*************************************************************
 *************************************************************
 * Gulp dependencies
 */
// NPM packages
var gulp      = require('gulp'),
  $           = require('gulp-load-plugins')(),
  taskListing = require('gulp-task-listing'),
  minify      = require('gulp-minify-css'),
  imageop     = require('gulp-image-optimization'),
  runSequence = require('run-sequence').use(gulp),
  browserSync = require('browser-sync'),
  path        = require('path'),
  fs          = require('fs'),
  _           = require('lodash');
// Kickstarter helpers
var constant  = require('./constants'),
    helper    = require('./helper'),
    logger    = require('./logger');

/*************************************************************
 *************************************************************
 * Logger initialization
 */
var log;
var setupLogger = function (level, colors) {
  var logLevel  = helper.isDefined(level)  ? level  : constant.LOG_INFO;
  var logColors = helper.isDefined(colors) ? colors : true;
  logger.setup(logLevel, logColors, [constant.CONSOLE_APPENDER])
}

/*************************************************************
 *************************************************************
 * Project setup
 */
// Get kickstarter library
var config;
var lib       = require('./kickstarter.js');

/*************************************************************
 *************************************************************
 * Shortcut kickstarter's tasks
 */
gulp.task('kick', function () {
  gulp.start('installation');
});
gulp.task('start', ['watch']);

/*************************************************************
 *************************************************************
 * Kickstarter's tasks
 */
gulp.task('help', taskListing.withFilters(null, 'gulpfile'));
gulp.task('default', ['watch']);
gulp.task('test', ['test-lint', 'test-validation']);

gulp.task('compile', function (callback) {
  runSequence(
    ['compile-twig', 'compile-less', 'compile-sass', 'compile-js'],
    callback
  );
});

gulp.task('installation', function (callback) {
  runSequence(
    ['compile', 'optimize-images'],
    callback
  );
});

/**********************************************/
/************* Lint test **********************/
gulp.task('test-lint', ['test-lint-style', 'test-lint-js']);

gulp.task('test-lint-style', function (callback) {
  if (config.csspreprocessors == 'both' || config.csspreprocessors == 'less') {
    log.info('\t- Style lint');
    var stack = lib.generateMapping(config.csspreprocessorssource, config.csspreprocessorsdist);
    _.each(stack, function (dist, source) {
      gulp.src(source)
        .pipe($.plumber())
        .pipe($.recess())
        .pipe($.recess.reporter());
    });
  }
  callback();
});

gulp.task('test-lint-js', function (callback) {
  if (config.jsApplication) {
    log.info('\t- JS lint');
    gulp.src(config.jsApplication)
      .pipe($.plumber())
      .pipe(browserSync.reload({stream: true, once: false}))
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.jscs({esnext: true}));
  }
  callback();
});

/**********************************************/
/************* Validation *********************/
gulp.task('test-validation', ['test-validation-html']);

gulp.task('test-validation-html', function (callback) {
  if (config.html) {
    log.info('\t- HTML Validation');
    gulp.src(config.htmlPath)
      .pipe($.plumber())
      .pipe($.w3cjs());
  }
  callback();
});

/**********************************************/
/************* Compilation ********************/
gulp.task('compile-less', function (callback) {
  if (config.csspreprocessors == 'both' || config.csspreprocessors == 'less') {
    log.info('\t- LESS compilation');
    var stack = lib.generateMapping(config.csspreprocessorssource, config.csspreprocessorsdist);
    _.each(stack, function (dist, source) {
      gulp.src(source.split(','))
        .pipe($.concat('style.min.less'))
        .pipe($.less())
        .on(
          'error',
          function (error) {
            log.error(error);
          }
        )
        .pipe(minify({keepSpecialComments : 0}))
        .pipe(gulp.dest(dist));
    });
  }
  callback();
});

gulp.task('compile-sass', function (callback) {
  if (config.csspreprocessors == 'both' || config.csspreprocessors == 'sass') {
    log.info('\t- SASS compilation');
    var stack = lib.generateMapping(config.csspreprocessorssource, config.csspreprocessorsdist);
    _.each(stack, function (dist, source) {
      gulp.src(source.split(','))
        .pipe($.sourcemaps.init())
        .pipe($.sass())
        .on(
          'error',
          function (error) {
            log.error(error);
          }
        )
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(dist));
    });
  }
  callback();
});

gulp.task('compile-js', ['test-lint-js'], function (callback) {
  if (config.js) {
    log.info('\t- JS compression');
    var stack = lib.generateMapping(config.jssource, config.jsdist);
    _.each(stack, function (dist, source) {
      gulp.src(source.split(','))
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.concat('main.min.js'))
        .pipe($.uglify())
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest(dist));
    });
  }
  callback();
});

gulp.task('compile-twig', ['compile-yml'], function (callback) {
  if (config.twig) {
    log.info('\t- TWIG compilation');
    var stack = lib.generateMapping(config.twigsource, config.twigdist);
    _.each(stack, function (dist, source) {
      gulp.src(source.split(','))
        .pipe($.data(function () {
          var content = {};
          if (config.content !== 'no') {
            var contentPath = path.join(process.cwd(), config.contentPath);
            fs.readdirSync(contentPath).forEach(function (file) {
              var filePath = path.join(contentPath, file);
              if (path.extname(file) == '.json') {
                // No cache for template content
                delete require.cache[require.resolve(filePath)];
                content = _.merge(content, require(filePath));
              }
            });
          }
          return content;
        }))
        .pipe($.twig())
        .pipe(gulp.dest(dist));
    });
  }
  callback();
});

gulp.task('compile-yml', function (callback) {
  if (config.content === 'yml') {
    log.info('\t- Compile YML to JSON');
    gulp.src(path.normalize(path.join(config.contentPath + '/*.yml')))
      .pipe($.plumber())
      .pipe($.yaml({ space: 2 }))
      .pipe(gulp.dest(config.contentPath))
      .on(
        'finish',
        function () {
          callback();
        }
      );
  } else {
    callback();
  }
});

/**********************************************/
/************* Optimization ********************/
gulp.task('optimize-images', function (callback) {
  if (config.images) {
    log.info('\t- IMAGES optimization');
    var stack = lib.generateMapping(config.imagessource, config.imagesdist);
    _.each(stack, function (dist, source) {
      gulp.src(source.split(','))
        .pipe($.plumber())
        .pipe($.changed(dist))
        .pipe(imageop(
          {
            optimizationLevel: 7,
            progressive: true,
            interlaced: true
          }
        ))
        .pipe(gulp.dest(dist))
        .on(
          'error',
          function () {
            log.error('Image optimization has failed');
            callback();
          }
        );
    });
  }
  callback();
});

/**********************************************/
/***************** Watch **********************/
gulp.task('watch', function (callback) {
  log.info('Services :');
  if (config.server && config.serverPath) {
    log.info('\t- Start server');
    // Create a web server
    gulp.src(config.serverPath)
      .pipe($.webserver({
        host: "0.0.0.0",
        port: config.port || 1234,
        livereload: {
          enable: true,
          filter: function (filename) {
            // Exclusion regular expression
            if (filename.match(/.map$/)) { 
              return false;
            }
            return true;
          }
        },
        directoryListing: false,
        fallback: 'index.html',
        open: true,
        https: false
      }));
  }

  if (config.csspreprocessors == 'less' || config.csspreprocessors == 'both') {
    log.info('\t- LESS compilation');
    gulp.watch(lib.getSources(config.csspreprocessorssource), ['compile-less']);
  }
  if (config.csspreprocessors == 'sass' || config.csspreprocessors == 'both') {
    log.info('\t- SASS compilation');
    gulp.watch(lib.getSources(config.csspreprocessorssource), ['compile-sass']);
  }

  if (config.js) {
    log.info('\t- JS compression');
    gulp.watch(lib.getSources(config.jssource), ['test-lint-js', 'compile-js']);
  }

  if (config.images) {
    log.info('\t- IMAGES optimization');
    gulp.watch(lib.getSources(config.imagessource), ['optimize-images']);
  }

  if (config.twig) {
    log.info('\t- TWIG compilation');
    gulp.watch(lib.getRecursiveSources(config.twigsource), ['compile-twig']);
    if (config.htmlPath) {
      log.info('\t- HTML validation');
      gulp.watch(lib.getSources(config.htmlPath), ['test-validation-html']);
    }
  }
  if (config.content === 'yml') {
    log.info('\t- YML compilation');
    gulp.watch(path.normalize(path.join(config.contentPath + '/*.yml')), ['compile-twig']);
  }
  if (config.html && !config.twig) {
    log.info('\t- HTML validation');
    gulp.watch(lib.getSources(config.htmlPath), ['test-validation-html']);
  }

  log.info('Execution stack :');

  callback();
});

exports.start = function (processConfig) {
  // Initialize the library
  lib.init(processConfig);
  // Retrieve project configuration and specifications
  config = lib.getConfiguration();
  // Initialize tasks with kickstarter process configuration
  config = _.merge(config, processConfig);
  setupLogger(config.logLevel, config.colors);
  log = logger.create();

  log.info('Start kickstarter');
  if (config.tasks) {
    var sequence = _.uniq(processConfig.tasks.split(','));
    log.debug('Run sequence : ' + sequence);
    runSequence(
      sequence
    );
  } else {
    runSequence(
      'watch'
    );
  }
};
