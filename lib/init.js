/**
 * This file is part of the Kickstarter.
 *
 * (c) iGitScor <http://github.com/iGitScor/kicksterter>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var readline      = require('readline');
var path          = require('path');
var glob          = require('glob');
var _             = require('lodash');

var helper        = require('./helper');
var logger        = require('./logger');
var constant      = require('./constants');

var log           = logger.create('init');

var StateMachine  = require('./init/state_machine');
var COLOR_SCHEME  = require('./init/color_schemes');
var formatters    = require('./init/formatters');

var logQueue = [];
var printLogQueue = function () {
  while (logQueue.length) {
    logQueue.shift()();
  }
};

var NODE_MODULES_DIR = path.resolve(__dirname, '../..');

// Kickstarter is not in node_modules, probably a symlink,
// use current working dir.
if (!/node_modules$/.test(NODE_MODULES_DIR)) {
  NODE_MODULES_DIR = path.resolve('node_modules');
}

var validatePattern = function (pattern) {
  if (!glob.sync(pattern).length) {
    log.warn('There is no file matching this pattern.\n');
  }
};

var questions = [{
  id: 'project',
  question: 'In what type of project do you use Kickstarter ?',
  hint: 'Press tab to list possible options. Enter to move to the next question.',
  options: ['Symfony 2', 'Plain project']
}, {
  id: 'server',
  question: 'Do you want the kickstarter to create a web server ?',
  hint: 'Press tab to list possible options.',
  options: ['yes', 'no'],
  boolean: true
}, {
  id: 'serverPath',
  question: 'What is the main location of your application ?',
  hint: 'Enter entire path',
  condition: function (answers) {
    return answers.server;
  }
}, {
  id: 'twig',
  question: 'Do you want the kickstarter to compile twig templates ?',
  hint: 'Press tab to list possible options.',
  options: ['yes', 'no'],
  boolean: true
}, {
  id: 'twigPath',
  question: 'What is the location of your source and twig files ?',
  hint: 'You can use glob patterns, eg. "views/*.twig" or "views/**/*.twig".\n' +
    'You can match source and dist locations, eg. "views/*.twig->dist/views"\n' +
    'If you do not match source with dist, an unique dist location will be asked\n' +
    'Enter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern,
  condition: function (answers) {
    return answers.twig;
  }
}, {
  id: 'twigDistPath',
  question: 'What is the location of your twig files will be compiled ?',
  hint: 'Enter the unique location',
  condition: function (answers) {
    return answers.twigPath;
  }
}, {
  id: 'content',
  question: 'Do you want to inject content in your twig ?',
  hint: 'Press tab to list possible options.',
  options: ['yml', 'json', 'no'],
  condition: function (answers) {
    return answers.twig;
  }
}, {
  id: 'contentPath',
  question: 'What is the location of your content files ?',
  hint: 'Enter the unique location',
  condition: function (answers) {
    return answers.content !== 'no';
  }
}, {
  id: 'html',
  question: 'Do you want the kickstarter to lint HTML ?',
  hint: 'Press tab to list possible options.',
  options: ['yes', 'no'],
  boolean: true
}, {
  id: 'htmlPath',
  question: 'What is the location of your source and html files ?',
  hint: 'You can use glob patterns, eg. "views/*.html" or "views/**/*.html".\n' +
    'Enter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern,
  condition: function (answers) {
    return answers.html;
  }
}, {
  id: 'images',
  question: 'Do you want the kickstarter to optimize images ?',
  hint: 'Press tab to list possible options.',
  options: ['yes', 'no'],
  boolean: true
}, {
  id: 'imagesPath',
  question: 'What is the location of your source and images files ?',
  hint: 'You can use glob patterns, eg. "public/images/*.(png|jpeg|jpg)" or "images/**/*.png".\n' +
    'You can match source and dist locations, eg. "public/images/*.png->dist/optimized"\n' +
    'If you do not match source with dist, an unique dist location will be asked\n' +
    'Enter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern,
  condition: function (answers) {
    return answers.images;
  }
}, {
  id: 'imagesDistPath',
  question: 'What is the location of your image files will be optimzed ?',
  hint: 'Enter the unique location',
  condition: function (answers) {
    _.each(answers.imagesPath, function (imagesPath) {
      if (_.contains(imagesPath, '->')) {
        return true;
      }
    });

    return answers.imagesPath;
  }
}, {
  id: 'csspreprocess',
  question: 'Do you want the kickstarter to compile LESS or SASS ?',
  hint: 'Press tab to list possible options.',
  options: ['less', 'sass', 'both', 'no']
}, {
  id: 'csspreprocessPath',
  question: 'What is the location of your source and less or sass files ?',
  hint: 'You can use glob patterns, eg. "styles/*.less" or "styles/**/*.sass".\n' +
    'You can match source and dist locations, eg. "styles/*.less->dist/styles"\n' +
    'If you do not match source with dist, an unique dist location will be asked\n' +
    'Enter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern,
  condition: function (answers) {
    return answers.csspreprocess !== 'no';
  }
}, {
  id: 'csspreprocessDistPath',
  question: 'What is the location of your style files will be compiled ?',
  hint: 'Enter the unique location',
  condition: function (answers) {
    _.each(answers.csspreprocessPath, function (preprocessPath) {
      if (_.contains(preprocessPath, '->')) {
        return true;
      }
    });

    return answers.csspreprocessPath;
  }
}, {
  id: 'js',
  question: 'Do you want the kickstarter to compress JS ?',
  hint: 'Press tab to list possible options.',
  options: ['yes', 'no'],
  boolean: true
}, {
  id: 'jsPath',
  question: 'What is the location of your source and js files ?',
  hint: 'You can use glob patterns, eg. "scripts/*.js" or "scripts/**/*.js".\n' +
    'Enter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern,
  condition: function (answers) {
    return answers.js;
  }
}, {
  id: 'jsApp',
  question: 'What is the location of your js main files ?',
  hint: 'You can use glob patterns, eg. "scripts/**/*.js".\n' +
    'Enter empty string to move to the next question.',
  multiple: true,
  condition: function (answers) {
    return answers.jsPath;
  }
}, {
  id: 'jsDistPath',
  question: 'What is the location of your js files will be compressed ?',
  hint: 'Enter the unique location',
  condition: function (answers) {
    _.each(answers.jsPath, function (jsPath) {
      if (_.contains(jsPath, '->')) {
        return true;
      }
    });

    return answers.jsPath;
  }
}];

var getBasePath = function (configFilePath, cwd) {
  var configParts = path.dirname(configFilePath).split(path.sep);
  var cwdParts = cwd.split(path.sep);
  var base = [];

  while (configParts.length && configParts[0] === cwdParts[0]) {
    configParts.shift();
    cwdParts.shift();
  }

  while (configParts.length) {
    var part = configParts.shift();
    if (part === '..') {
      base.unshift(cwdParts.pop());
    } else if (part !== '.') {
      base.unshift('..');
    }
  }

  return base.join(path.sep);
};

var processAnswers = function (answers, basePath) {
  var processedAnswers = {
    basePath: basePath,
  };
  processedAnswers = _.merge(processedAnswers, answers);

  return processedAnswers;
};

exports.init = function (config) {
  var useColors   = true;
  var logLevel    = constant.LOG_INFO;
  var colorScheme = COLOR_SCHEME.ON;

  if (helper.isDefined(config.colors)) {
    colorScheme = config.colors ? COLOR_SCHEME.ON : COLOR_SCHEME.OFF;
    useColors = config.colors;
  }

  if (helper.isDefined(config.logLevel)) {
    logLevel = config.logLevel;
  }

  logger.setup(logLevel, useColors);

  var rli         = readline.createInterface(process.stdin, process.stdout);
  var sm          = new StateMachine(rli, colorScheme);

  process.stdin.on('keypress', function (s, key) {
    sm.onKeypress(key);
  });

  rli.on('line', sm.onLine.bind(sm));

  // clean colors
  rli.on('SIGINT', function () {
    sm.kill();
    process.exit(0);
  });

  sm.on('next_question', printLogQueue);

  sm.process(questions, function (answers) {
    var cwd = process.cwd();
    var configFile = config.configFile || 'kickstarter.conf.js';
    var formatter = formatters.createForPath();
    var processedAnswers = processAnswers(answers, getBasePath(configFile, cwd));
    var configFilePath = path.resolve(cwd, configFile);

    formatter.writeConfigFile(configFilePath, processedAnswers);
    console.log(colorScheme.success('Config file generated at "' + configFilePath + '".\n'));
  });
};
