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
  var translation = _.result(translations, parameters, '');

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
