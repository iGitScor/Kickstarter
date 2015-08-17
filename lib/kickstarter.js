var path  = require('path'),
  _       = require('lodash');

var config;
/*************************************************************
 *************************************************************
 * Getters methods
 */
exports.getConfiguration = function () {
  return config;
};

/*************************************************************
 * Library methods
 */
exports.init = function (processConfig) {
  loadConfig(processConfig);
};

exports.generateMapping = function (sources, dist) {
  var mapping = {};
  if (sources && _.isArray(sources) && sources.length) {
    var sourcesForDist = [];
    _.each(sources, function (source) {
      if (_.contains(source, '->')) {
        mapping[source.split('->')[0]] = (source.split('->')[1]);
      } else {
        sourcesForDist.push(source);
      }
    });
    if (sourcesForDist && dist) {
      mapping[sourcesForDist] = dist;
    }
  }

  return mapping;
};

exports.getSources = function (sources) {
  var pathes = [];
  _.each(sources, function (source) {
    if (_.contains(source, '->')) {
      if (!_.contains(pathes, source.split('->')[0])) {
        pathes.push(source.split('->')[0]);
      }
    } else {
      if (!_.contains(pathes, source)) {
        pathes.push(source);
      }
    }
  });

  return pathes;
};

exports.getRecursiveSources = function (sources) {
  sources = this.getSources(sources);
  var recursivesSources = [];
  _.each(sources, function (source) {
    var recursivePath = source;
    if (!_.contains(source, '**')) {
      var lastPathItem = _.last(source.split(path.sep));
      source = _.contains(lastPathItem, '.') || _.contains(lastPathItem, '*') ?
          path.dirname(source) : source;
      recursivePath = path.join(source, '/**/*.*');
    }
    recursivesSources.push(path.resolve(recursivePath));
  });

  return recursivesSources;
};
/*************************************************************
 *************************************************************/

/*************************************************************
 * Private methods
 */
var loadConfig = function (processConfig) {
  try {
    config = require('../kickstarter.conf.js')(processConfig);
  } catch (exception) {
    console.error(exception);
  }
};
