var path  = require('path'), 
    _     = require('lodash');

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
  var sourcesForDist = [];
  _.each(sources, function (source) {
    if (_.contains(source, '->')) {
      mapping[source.split('->')[0]] = (source.split('->')[1]);
    } else {
      sourcesForDist.push(source);
    }
  });
  mapping[sourcesForDist] = dist;

  return mapping;
};

exports.getSources = function (sources) {
  var pathes = [];
  _.each(sources, function (source) {
    if (_.contains(source, '->')) {
      pathes.push(source.split('->')[0]);
    } else {
      pathes.push(source);
    }
  });

  return pathes;
};

exports.getRecursiveSources = function (sources) {
  var sources = this.getSources(sources);
  var recursivesSources = [];
  _.each(sources, function (source) {
    recursivesSources.push(path.join(path.dirname(source), '/**/*.*'));
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
