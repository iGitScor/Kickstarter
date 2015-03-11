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
// Get kickstarter library and library configuration
var kickstarter = require('./kickstarter.json');
var lib         = require('./lib/kickstarter.js');
// Initialize the library
lib.init();
// Retrieve project configuration and specifications
var config      = lib.getConfiguration();
var project     = lib.getProject();
// Customize library with project specification
var configFolders = {
  choices: lib.getFolders
};
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

// List all available commands
gulp.task('help', taskListing.withFilters(null, 'gulpfile'));
gulp.task('default', ['watch']);
gulp.task('test', ['test-lint', 'test-validation']);
gulp.task('compile', function (callback) {
  runSequence(
    ['compile-twig', 'compile-less', 'compile-sass', 'compile-js'],
    callback
  );
});
gulp.task('configuration', function (callback) {
  fs.exists(kickstarter.configuration.project, function (appConfigExist) {
    var loadConfig;
    if (appConfigExist) {
      loadConfig = require(kickstarter.configuration.project);
    }
    // Configuration setup if :
    // -  the configuration is missing,
    // -  the required parameters are missing
    // -  the script is launched with the force parameter *
    if (!appConfigExist || !loadConfig.config || !loadConfig.services || _.includes(this.process.argv, "--force")) {
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
          }
        ))
        .pipe($.prompt.prompt(
          kickstarter.prompt.services,
          function (res) {
            gulp.src(kickstarter.configuration.project)
              .pipe(jsoneditor(
                {
                  'services': res.services
                }
              ))
              .pipe(gulp.dest('./config'));
            lib.getConfig();
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
  if (_.includes(project.services, "dist")) {
    runSequence(
      'dist-bower',
      ['dist-external', 'dist-icons'],
      callback
    );
  } else {
    callback();
  }
});
gulp.task('dist-bower', function (callback) {
  if (_.includes(project.services, "dist")) {
    $.bower()
      .pipe(gulp.dest(config.bowerDir));
  }

  callback();
});
gulp.task('dist-icons', function (callback) {
  if (_.includes(project.services, "dist") && config.dist.iconPath !== undefined) {
    if (config.sources.faPath !== undefined) {
      gulp.src([
        config.bowerDir + config.sources.faPath + '/**.*'
      ])
        .pipe(gulp.dest(config.dist.mainPath + config.dist.iconPath));
    }
    if (config.sources.iconPath !== undefined) {
      gulp.src([
        config.bowerDir + config.sources.iconPath + '/**.*'
      ])
        .pipe(gulp.dest(config.dist.mainPath + config.dist.iconPath));
    }
  }

  callback();
});
gulp.task('dist-external', function (callback) {
  if (_.includes(project.services, "dist") && config.sources.jsPath !== undefined && config.dist.jsPath) {
    gulp.src([
      config.bowerDir + '/jquery/dist/**.*',
      config.bowerDir + '/bootstrap/dist/js/**.*',
      !config.bowerDir + '/bootstrap/dist/js/npm.js'
    ])
      .pipe(gulp.dest(config.sources.mainPath + config.sources.jsPath + '/external'));

    gulp.src([
      config.bowerDir + '/html5shiv/dist/html5shiv.min.js',
      config.bowerDir + '/respond-minmax/dest/respond.min.js'
    ])
      .pipe(gulp.dest(config.dist.mainPath + config.dist.jsPath));
  }

  callback();
});
/**********************************************/
/**********************************************/

/**********************************************/
/************* Lint test **********************/
gulp.task('test-lint', ['test-lint-css', 'test-lint-js']);
gulp.task('test-lint-css', function () {
  return gulp.src(lib.getSrc(config.dist, 'cssPath', '/*.css'))
    .pipe($.plumber())
    .pipe(browserSync.reload({stream: true, once: false}))
    .pipe($.csslint())
    .pipe($.notify({message: "CSS Lint file: <%= file.relative %>"}))
    .pipe($.csslint.reporter());
});
gulp.task('test-lint-js', function () {
  return gulp.src(lib.getSrc(config.sources, 'jsPath', '/*.js'))
    .pipe($.plumber())
    .pipe(browserSync.reload({stream: true, once: false}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jscs({esnext: true}))
    .pipe($.notify({message: "JS Lint file: <%= file.relative %>"}));
});
/**********************************************/
/**********************************************/

/**********************************************/
/************* Validation *********************/
gulp.task('test-validation', ['test-validation-html']);
gulp.task('test-validation-html', function () {
  return gulp.src(_.merge(lib.getSrc(config.dist, 'htmlPath', '/*.html'), lib.getSrc(config.sources, 'htmlPath', '/*.html')))
    .pipe($.plumber())
    .pipe($.w3cjs())
    .pipe($.notify({message: "HTML Validator: <%= file.relative %>"}));
});
/**********************************************/
/**********************************************/

/**********************************************/
/************* Compilation ********************/
gulp.task('compile-less', function (callback) {
  if (_.includes(project.services, "less")) {
    var sources = lib.getSrc(config.sources, 'lessPath', '/*.less');
    var ext     = lib.getSrc(config.dist, 'cssPath');

    // Check configuration
    if (_.size(sources) !== _.size(ext)) {
      gulp.src('.')
        .pipe($.notify({message: "There are not as many source folders as dist folders", "icon": path.join(__dirname, "gulp.gif")}));
      callback();
    }

    _.each(sources, function (source, indexPath) {
      gulp.src(source)
        .pipe($.concat('style.min.less'))
        .pipe($.less())
        .on(
          'error',
          function (error) {
            gulp.src('.')
              .pipe(
                $.notify({message: "A pony has encountered a rainbow issue", "icon": path.join(__dirname, "gulp.gif")})
              );
            console.error(error);
          }
        )
        .pipe(minify({keepSpecialComments : 0}))
        .pipe(gulp.dest(ext[indexPath]))
        .pipe($.notify({message: "Compilation file: <%= file.relative %>"}));
    });
  }

  callback();
});
gulp.task('compile-sass', function (callback) {
  if (_.includes(project.services, "sass")) {
    var sources = lib.getSrc(config.sources, 'sassPath', '/*.scss');
    var ext     = lib.getSrc(config.dist, 'cssPath');

    // Check configuration
    if (_.size(sources) !== _.size(ext)) {
      gulp.src('.')
        .pipe($.notify({message: "There are not as many source folders as dist folders", "icon": path.join(__dirname, "gulp.gif")}));
      callback();
    }

    _.each(sources, function (source, indexPath) {
      gulp.src(source)
        .pipe($.sourcemaps.init())
        .pipe($.sass())
        .on(
          'error',
          function (error) {
            gulp.src('.')
              .pipe(
                $.notify({message: "A pony has encountered a rainbow issue", "icon": path.join(__dirname, "gulp.gif")})
              );
            console.error(error);
          }
        )
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(ext[indexPath]))
        .pipe($.notify({message: "Compilation file: <%= file.relative %>"}));
    });
  }

  callback();
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
    .pipe($.notify({message: "Compilation file: <%= file.relative %>"}));
});
gulp.task('compile-twig', function (callback) {
  if (_.includes(project.services, "twig")) {
    gulp.src(lib.getSrc(config.sources, 'twigPath', '/*.twig'))
      .pipe($.data(function (file) {
        return require('./' + config.sources.mainPath + '/content/' + path.basename(file.path) + '.json');
      }))
      .pipe($.twig())
      .pipe(gulp.dest('./' + lib.getSrc(config.dist, 'htmlPath')));
  }

  callback();
});
/**********************************************/
/**********************************************/

/**********************************************/
/************* Optimization ********************/
gulp.task('optimize-images', function (callback) {
  if (_.includes(project.services, "images")) {
    var sources = lib.getSrc(config.sources, 'imgPath', '/*.*');
    var ext     = lib.getSrc(config.dist, 'imgPath');

    // Check configuration
    if (_.size(sources) !== _.size(ext)) {
      gulp.src('.')
        .pipe($.notify({message: "There are not as many source folders as dist folders", "icon": path.join(__dirname, "gulp.gif")}));
      callback();
    }

    _.each(sources, function (source, indexPath) {
      gulp.src(source)
        .pipe($.plumber())
        .pipe(imageop(
          {
            optimizationLevel: 7,
            progressive: true,
            interlaced: true
          }
        ))
        .pipe(gulp.dest(ext[indexPath]))
        .on('error', callback);
    });
  }

  callback();
});
/**********************************************/
/**********************************************/

gulp.task('watch', function (callback) {
  if (_.includes(project.services, "webserver")) {
    // Create a web server
    gulp.src(config.dist.mainPath)
      .pipe($.webserver({
        host: "0.0.0.0",
        port: 1234,
        livereload: true,
        directoryListing: false,
        fallback: 'index.html',
        open: true,
        https: false
      }));
  }

  // Watch files modification 
  if (_.includes(project.services, "less")) {
    gulp.watch(lib.getSrc(config.sources, 'lessPath', '/*.less'), ['compile-less']);
  }
  if (_.includes(project.services, "sass")) {
    gulp.watch(lib.getSrc(config.sources, 'sassPath', '/*.scss'), ['compile-sass']);
  }

  // @TODO : Multiple sources/dist trees
  gulp.watch(config.sources.mainPath + config.sources.jsPath + '/*.js', ['test-lint-js', 'compile-js']);

  if (_.includes(project.services, "images")) {
    gulp.watch(lib.getSrc(config.sources, 'impPath', '/*.*'), ['optimize-images']);
  }
  if (_.includes(project.services, "twig")) {
    gulp.watch(lib.getSrc(config.sources, 'twigPath', '/*.twig'), ['compile-twig']);
    gulp.watch(lib.getSrc(config.dist, 'htmlPath', '/*.html'), ['test-validation-html']);
  }
  if (_.includes(project.services, "html")) {
    gulp.watch(lib.getSrc(config.sources, 'htmlPath', '/*.html'), ['test-validation-html']);
  }

  callback();
});

// Launcher : execute main gulpfile task, sub gulpfile tasks after
if (project) {
  $.hub(['gulpfile.js', './config/' + project.config + '/gulpfile.js']);
}