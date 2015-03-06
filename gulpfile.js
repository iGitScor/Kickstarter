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
var config;
var project;
var kickstarter = require('./kickstarter.json');
function getSrc(tree, type, extension) {
  var trees = tree.trees;
  if (extension === undefined) {
    extension = '';
  }

  // Multiple sources
  if (_.isArray(trees)) {
    var src = [];
    _.each(trees, function (item) {
      src.push(tree.mainPath + _.result(item, type) + extension);
    });

    return src;
  }

  return [tree.mainPath + tree[type] + extension];
}
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

// Initialize projects configuration
var configFolders = {
  choices: getFolders()
};
// Retrieve current project configuration
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
    // -  the script is launched with the force parameter 
    if (!appConfigExist || !loadConfig.config || !loadConfig.services || _.includes(process.argv, "--force")) {
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
  if (_.includes(project.services, "dist")) {
    gulp.src([
      config.bowerDir + config.sources.faPath + '/**.*',
      config.sources.mainPath + config.sources.iconPath + '/**/*.*'
    ])
      .pipe(gulp.dest(config.dist.mainPath + config.dist.iconPath));
  }

  callback();
});
gulp.task('dist-external', function (callback) {
  if (_.includes(project.services, "dist")) {
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
  return gulp.src(getSrc(config.dist, 'cssPath', '/*.css'))
    .pipe($.plumber())
    .pipe(browserSync.reload({stream: true, once: false}))
    .pipe($.csslint())
    .pipe($.notify({message: "CSS Lint file: <%= file.relative %>"}))
    .pipe($.csslint.reporter());
});
gulp.task('test-lint-js', function () {
  return gulp.src(getSrc(config.sources, 'jsPath', '/*.js'))
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
  return gulp.src(_.merge(getSrc(config.dist, 'htmlPath', '/*.html'), getSrc(config.sources, 'htmlPath', '/*.html')))
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
    var sources = getSrc(config.sources, 'lessPath', '/*.less');
    var ext     = getSrc(config.dist, 'cssPath');

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
          function () {
            gulp.src('.')
              .pipe(
                $.notify({message: "A pony has encountered a rainbow issue", "icon": path.join(__dirname, "gulp.gif")})
              );
            callback();
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
    var sources = getSrc(config.sources, 'sassPath', '/*.scss');
    var ext     = getSrc(config.dist, 'cssPath');

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
          function () {
            gulp.src('.')
              .pipe(
                $.notify({message: "A pony has encountered a rainbow issue", "icon": path.join(__dirname, "gulp.gif")})
              );
            callback();
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
    gulp.src(getSrc(config.sources, 'twigPath', '/*.twig'))
      .pipe($.data(function (file) {
        return require('./' + config.sources.mainPath + '/content/' + path.basename(file.path) + '.json');
      }))
      .pipe($.twig())
      .pipe(gulp.dest(getSrc(config.dist, 'htmlPath')));
  }

  callback();
});
/**********************************************/
/**********************************************/

/**********************************************/
/************* Optimization ********************/
gulp.task('optimize-images', function (callback) {
  if (_.includes(project.services, "images")) {
    var sources = getSrc(config.sources, 'imgPath', '/*.*');
    var ext     = getSrc(config.dist, 'imgPath');

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

gulp.task('watch', function () {
  if (_.includes(project.services, "webserver")) {
    // Create a web server
    gulp.src(config.dist.mainPath + config.dist.htmlPath)
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
    gulp.watch(getSrc(config.sources, 'lessPath', '/*.less'), ['compile-less']);
  }
  if (_.includes(project.services, "sass")) {
    gulp.watch(getSrc(config.sources, 'sassPath', '/*.scss'), ['compile-sass']);
  }

  // @TODO : Multiple sources/dist trees
  gulp.watch(config.sources.mainPath + config.sources.jsPath + '/*.js', ['test-lint-js', 'compile-js']);

  if (_.includes(project.services, "images")) {
    gulp.watch(getSrc(config.sources, 'impPath', '/*.*'), ['optimize-images']);
  }
  if (_.includes(project.services, "twig")) {
    gulp.watch(getSrc(config.sources, 'twigPath', '/*.twig'), ['compile-twig']);
    gulp.watch(getSrc(config.dist, 'htmlPath', '/*.html'), ['test-validation-html']);
  }
  if (_.includes(project.services, "html")) {
    gulp.watch(getSrc(config.sources, 'htmlPath', '/*.html'), ['test-validation-html']);
  }
});
