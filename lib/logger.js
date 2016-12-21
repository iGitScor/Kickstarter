/**
 * This file is part of the Kickstarter.
 *
 * (c) iGitScor <http://github.com/iGitScor/kicksterter>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * This is the logger module for Kickstarter.
 *
 * It uses [log4js](https://github.com/nomiddlename/log4js-node) to handle and
 * configure all logging that happens inside of Kickstarter.
 */

var log4js    = require('log4js');
var helper    = require('./helper');
var constant  = require('./constants');

var LogWrapper = function (name, level) {
  this.logger = log4js.getLogger(name);
  this.logger.setLevel(level);
};

var levels = ['error', 'warn', 'info', 'debug'];
levels.forEach(function (level) {
  LogWrapper.prototype[level] = function () {
    this.logger[level].apply(this.logger, arguments);
  };
});

/*************************************************************
 * Public methods
 */

/**
 * Setup the logger by passing in the configuration options.
 * It needs three argumentes:
 *   setup(logLevel, colors, appenders)
 *
 * `logLevel`: *String* Defines the global log level.
 * `colors`: *Boolean* Use colors in the stdout or not.
 * `appenders`: *Array* This will be passed as appenders to log4js
 *
 * to allow for fine grained configuration of log4js.
 * see https://github.com/nomiddlename/log4js-node.
 */

var setup = function (level, colors, appenders) {
  // Turn color on/off on the console appenders with pattern layout
  var pattern = colors ? constant.COLOR_PATTERN : constant.NO_COLOR_PATTERN;

  // If there are no appenders use the default one
  appenders = helper.isDefined(appenders) ? appenders : [constant.CONSOLE_APPENDER];

  appenders = appenders.map(function (appender) {
    if (appender.type === 'console') {
      if (helper.isDefined(appender.layout) && appender.layout.type === 'pattern') {
        appender.layout.pattern = pattern;
      }
    }
    return appender;
  });

  // Pass the values to log4js
  log4js.setGlobalLogLevel(level);
  log4js.configure({
    appenders: appenders
  });
};

/**
 * Create a new logger.
 * There are two optional arguments
 *   `name`, which defaults to `kickstarter` and
 *      If the `name = 'socket.io'` this will create a special wrapper
 *      to be used as a logger for socket.io.
 *   `level`, which defaults to the global level
 */

var create = function (name, level) {
  if (name === 'socket.io') {
    return new LogWrapper('socket.io', level);
  } else {
    var logger = log4js.getLogger(name || 'kickstarter');
    if (helper.isDefined(level)) {
      logger.setLevel(level);
    }
    return logger;
  }
};

exports.create = create;
exports.setup = setup;
