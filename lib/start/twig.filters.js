/**
 * This file is part of the Kickstarter.
 *
 * (c) iGitScor <http://github.com/iGitScor/kicksterter>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var translations;
var _ = require('lodash');

var translator = function (parameters, key) {
  var translation;
  var translationSearch = '';
  if (_.isArray(key) && _.size(key) > 1) {
    // Replace _result specific character to search into translations
    translationSearch = key[1].replace('.', '_') + '.';
  }

  translationSearch += parameters;
  translation = _.result(translations, translationSearch, '');

  return _.isString(translation) ? translation : '';
};

exports.initWithContent = function (content) {
  translations = content;
};

exports.getFilters = function () {
  return [
    {
      name: 'trans',
      func: translator
    },
  ];
};
