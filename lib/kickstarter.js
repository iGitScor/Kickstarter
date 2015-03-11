var fs    = require('fs'),
  path    = require('path'),
  _       = require('lodash');

var config, project;
var kickstarter = require('../kickstarter.json');

/*************************************************************
 *************************************************************
 * Getters methods
 */
exports.init = function () {
  this.getConfig();
};

exports.getConfiguration = function () {
  return config;
};

exports.getProject = function () {
  return project;
};

/*************************************************************
 * Library methods
 */
exports.getSrc = function (tree, type, extension) {
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
};

exports.getFolders = function () {
  return fs.readdirSync('./config')
    .filter(function (file) {
      return fs.statSync(path.join('./config', file)).isDirectory();
    });
};

exports.getConfig = function () {
  try {
    project = require('../' + kickstarter.configuration.project);
    if (project.config) {
      config = require('../config/' + project.config + '/config.json');
    }
  } catch (exception) {
    // Display that the configuration is missing only if we run another tasks than configuration one.
    if (_.last(process.argv) !== 'configuration') {
      console.warn('The project is not configured. Please run gulp configuration.');
    }
  }
};
/*************************************************************
 *************************************************************/
