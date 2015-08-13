var translations;
var _ = require('lodash');

var translator = function (parameters, key) {
  var translation = _.result(translations, parameters, '');
  return _.isString(translation) ? translation : '';
};

exports.initWithContent = function (content) {
  translations = content;
};

exports.getFilters = function () {
  return [
    {
      name: "trans",
      func: translator
    }
  ];
};