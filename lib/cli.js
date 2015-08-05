var path      = require('path'),
    fs        = require('fs'),
    optimist  = require('optimist'),
    helper    = require('./helper'),
    constant  = require('./constants');

var processArgs = function (argv, options, fs, path) {
  if (argv.help) {
    console.log(optimist.help());
    process.exit(0);
  }

  if (argv.version) {
    console.log('Kickstarter version: ' + constant.VERSION);
    process.exit(0);
  }

  // TODO(vojta): warn/throw when unknown argument (probably mispelled)
  Object.getOwnPropertyNames(argv).forEach(function (name) {
    var argumentValue = argv[name];
    if (name !== '_' && name !== '$0') {
      if (Array.isArray(argumentValue)) {
        // If the same argument is defined multiple times, override.
        argumentValue = argumentValue.pop();
      }
      options[helper.dashToCamel(name)] = argumentValue;
    }
  });

  if (helper.isString(options.autoWatch)) {
    options.autoWatch = options.autoWatch === 'true';
  }

  if (helper.isString(options.colors)) {
    options.colors = options.colors === 'true';
  }

  if (helper.isString(options.logLevel)) {
    options.logLevel = constant['LOG_' + options.logLevel.toUpperCase()] || constant.LOG_DISABLE;
  }

  if (helper.isString(options.singleRun)) {
    options.singleRun = options.singleRun === 'true';
  }

  if (helper.isString(options.browsers)) {
    options.browsers = options.browsers.split(',');
  }

  if (options.reportSlowerThan === false) {
    options.reportSlowerThan = 0;
  }

  if (helper.isString(options.reporters)) {
    options.reporters = options.reporters.split(',');
  }

  if (helper.isString(options.removedFiles)) {
    options.removedFiles = options.removedFiles.split(',');
  }

  if (helper.isString(options.addedFiles)) {
    options.addedFiles = options.addedFiles.split(',');
  }

  if (helper.isString(options.changedFiles)) {
    options.changedFiles = options.changedFiles.split(',');
  }

  if (helper.isString(options.refresh)) {
    options.refresh = options.refresh === 'true';
  }

  var configFile = argv._.shift();

  if (!configFile) {
    // default config file (if exists)
    if (fs.existsSync('./kickstarter.conf.js')) {
      configFile = './kickstarter.conf.js';
    }
  }

  options.configFile = configFile ? path.resolve(configFile) : null;

  return options;
};

var parseClientArgs = function (argv) {
  // extract any args after '--' as clientArgs
  var clientArgs = [];
  argv = argv.slice(2);
  var idx = argv.indexOf('--');
  if (idx !== -1) {
    clientArgs = argv.slice(idx + 1);
  }
  return clientArgs;
};

// return only args that occur before `--`
var argsBeforeDoubleDash = function (argv) {
  var idx = argv.indexOf('--');

  return idx === -1 ? argv : argv.slice(0, idx);
};

var describeShared = function () {
  optimist
    .usage('Kickstarter - bootstrap projects tools.\n\n' +
      'Usage:\n' +
      '  $0 <command>\n\n' +
      'Commands:\n' +
      '  start [<configFile>] [<options>] Start the kickstarter.\n' +
      '  init [<configFile>] Initialize a config file.\n' +
      '  completion Shell completion for kickstarter.\n\n' +
      'Run --help with particular command to see its description and available options.')
    .describe('help', 'Print usage and options.')
    .describe('version', 'Print current version.');
};

var describeInit = function () {
  optimist
    .usage('Kickstarter - bootstrap projects tools.\n\n' +
      'INIT - Initialize a config file.\n\n' +
      'Usage:\n' +
      '  $0 init [<configFile>]')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
    .describe('help', 'Print usage and options.');
};

var describeStart = function () {
  optimist
    .usage('Kickstarter - bootstrap projects tools.\n\n' +
      'START - Start the kickstarter.\n\n' +
      'Usage:\n' +
      '  $0 start [<configFile>] [<options>]')
    .describe('task', 'Task to run.')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
    .describe('help', 'Print usage and options.');
};

var describeCompletion = function () {
  optimist
    .usage('Kickstarter - bootstrap projects tools.\n\n' +
      'COMPLETION - Bash/ZSH completion for karma.\n\n' +
      'Installation:\n' +
      '  $0 completion >> ~/.bashrc\n')
    .describe('help', 'Print usage.');
};

exports.process = function () {
  var argv = optimist.parse(argsBeforeDoubleDash(process.argv.slice(2)));
  var options = {
    cmd: argv._.shift()
  };

  switch (options.cmd) {
    case 'start':
      describeStart();
      break;

    case 'init':
      describeInit();
      break;

    case 'completion':
      describeCompletion();
      break;
      
    case 'help':
      describeShared();
      optimist.showHelp();
      break;

    default:
      describeShared();
      if (!options.cmd) {
        processArgs(argv, options, fs, path);
        console.error('Command not specified.');
      } else {
        console.error('Unknown command "' + options.cmd + '".');
      }
      optimist.showHelp();
      process.exit(1);
  }

  return processArgs(argv, options, fs, path);
};

exports.run = function () {
  var config = exports.process();
  switch (config.cmd) {
    case 'start':
      require('./start').start(config);
      break;
    case 'init':
      require('./init').init(config);
      break;
    case 'completion':
      require('./completion').completion(config);
      break;
    case 'help':
      config.task = 'help';
      require('./start').start(config);
      break;
  }
};

// just for testing
exports.processArgs = processArgs;
exports.parseClientArgs = parseClientArgs;
exports.argsBeforeDoubleDash = argsBeforeDoubleDash;
