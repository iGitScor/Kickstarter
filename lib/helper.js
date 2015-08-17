var fs        = require('fs'),
    path      = require('path'),
    _         = require('lodash');

exports.isDefined = function (value) {
  return !_.isUndefined(value);
};

exports.isFunction  = _.isFunction;
exports.isString    = _.isString;
exports.isObject    = _.isObject;
exports.isArray     = _.isArray;

exports.ucFirst = function (word) {
  return word.charAt(0).toUpperCase() + word.substr(1);
};

exports.dashToCamel = function (dash) {
  var words = dash.split('-');
  return words.shift() + words.map(exports.ucFirst).join('');
};
