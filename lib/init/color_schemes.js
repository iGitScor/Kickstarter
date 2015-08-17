/**
 * This file is part of the Meup Kickstarter.
 *
 * (c) 1001pharmacies <http://github.com/1001pharmacies/kicksterter>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var COLORS_ON = {
  RESET: '\x1B[39m',
  ANSWER: '\x1B[36m', // NYAN
  SUCCESS: '\x1B[32m', // GREEN
  QUESTION: '\x1B[1m', // BOLD
  question: function (str) {
    return this.QUESTION + str + '\x1B[22m';
  },
  success: function (str) {
    return this.SUCCESS + str + this.RESET;
  }
};

var COLORS_OFF = {
  RESET: '',
  ANSWER: '',
  SUCCESS: '',
  QUESTION: '',
  question: function (str) {
    return str;
  },
  success: function (str) {
    return str;
  }
};

exports.ON = COLORS_ON;
exports.OFF = COLORS_OFF;
