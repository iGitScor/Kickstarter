/**
 * This file is part of the Kickstarter.
 *
 * (c) iGitScor <http://github.com/iGitScor/kicksterter>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

var path    = require('path');
var chai    = require('chai');
var expect  = chai.expect;

describe('kickstarter twig filters', function () {
  var loadFile  = require('mocks').loadFile;
  var m         = null;
  var content   = {};

  beforeEach(function () {
    m = loadFile(path.join(__dirname, '/../lib/start/twig.filters.js'), { glob: require('glob') });
    content = {
      domain: {
        subdomain: {
          key: 'value'
        }
      }
    };
    m.module.exports.initWithContent(content);
  });

  describe('transFilter', function () {
    it('should return string translation', function () {
      expect(m.translator('domain.subdomain.key', []))
        .to.be.a('string');
      expect(m.translator('domain.subdomain.key', []))
        .to.be.equal('value');
    });

    it('should return empty string if translation is not found', function () {
      expect(m.translator('domain.subdomain.missingkey', []))
        .to.be.equal('');
    });

    it('should return empty string if translation is not a string', function () {
      expect(m.translator('domain.subdomain', []))
        .to.be.equal('');
    });
  });
});
