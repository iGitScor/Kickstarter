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

describe('kickstarter', function () {
  var loadFile = require('mocks').loadFile;
  var m = null;

  beforeEach(function () {
    m = loadFile(path.join(__dirname, '/../lib/kickstarter.js'), { glob: require('glob') });
  });

  describe('generateMapping', function () {
    it('should be empty if source is empty', function () {
      var source = [];
      var dist = 'dist';
      expect(Object.keys(m.module.exports.generateMapping(source, dist)).length)
        .to.equal(0);
    });

    it('should be empty if dist is null', function () {
      var source = {};
      var dist = 'dist';
      expect(Object.keys(m.module.exports.generateMapping(source, dist)).length)
        .to.equal(0);
    });

    it('should be empty if source and dist are incorrect', function () {
      var source = null;
      var dist = 12;
      expect(Object.keys(m.module.exports.generateMapping(source, dist)).length)
        .to.equal(0);
    });

    it('should handle source including dist', function () {
      var source = ['source->dist'];
      var dist = null;
      expect(Object.keys(m.module.exports.generateMapping(source, dist)).length)
        .to.equal(1);
      expect(m.module.exports.generateMapping(source, dist).source)
        .to.equal('dist');
    });

    it('should handle multiple sources', function () {
      var source = ['source1', 'source2'];
      var dist = 'dist';
      expect(Object.keys(m.module.exports.generateMapping(source, dist)).length)
        .to.equal(1);
      expect(m.module.exports.generateMapping(source, dist)['source1,source2'])
        .to.equal('dist');
    });

    it('should keep source order', function () {
      var source = ['sourceB', 'sourceA'];
      var dist = 'dist';
      expect(m.module.exports.generateMapping(source, dist)['sourceB,sourceA'])
        .to.equal('dist');
    });
  });

  describe('getSources', function () {
    it('should be empty if source is empty', function () {
      var sources = [];
      expect(m.module.exports.getSources(sources).length)
        .to.equal(0);
    });

    it('should handle source including dist', function () {
      var sources = ['source->dist'];
      expect(m.module.exports.getSources(sources).length)
        .to.equal(1);
      expect(m.module.exports.getSources(sources)[0])
        .to.equal('source');
    });

    it('should handle multiple sources', function () {
      var sources = ['sourceA', 'sourceB'];
      expect(m.module.exports.getSources(sources).length)
        .to.equal(2);
      expect(m.module.exports.getSources(sources)[0])
        .to.equal('sourceA');
      expect(m.module.exports.getSources(sources)[1])
        .to.equal('sourceB');
    });

    it('should handle multiple sources with some ones including dist', function () {
      var sources = ['sourceA', 'sourceB->dist'];
      expect(m.module.exports.getSources(sources).length)
        .to.equal(2);
      expect(m.module.exports.getSources(sources)[0])
        .to.equal('sourceA');
      expect(m.module.exports.getSources(sources)[1])
        .to.equal('sourceB');
    });

    it('should eliminate duplicated sources', function () {
      var sources = ['source1', 'source1'];
      expect(m.module.exports.getSources(sources).length)
        .to.equal(1);
    });

    it('should eliminate duplicated sources with some ones including dist', function () {
      var sources = ['source1', 'source1->dist'];
      expect(m.module.exports.getSources(sources).length)
        .to.equal(1);
    });
  });

  describe('getRecursiveSources', function () {
    it('should be empty if source is empty', function () {
      var sources = [];
      expect(m.module.exports.getRecursiveSources(sources).length)
        .to.equal(0);
    });

    it('should handle source including dist', function () {
      var sources = ['source->dist'];
      expect(m.module.exports.getRecursiveSources(sources).length)
        .to.equal(1);
      expect(m.module.exports.getRecursiveSources(sources)[0])
        .to.equal(path.resolve('source/**/*.*'));
    });

    it('should handle multiple sources', function () {
      var sources = ['sourceA', 'sourceB'];
      expect(m.module.exports.getRecursiveSources(sources).length)
        .to.equal(2);
      expect(m.module.exports.getRecursiveSources(sources)[0])
        .to.equal(path.resolve('sourceA/**/*.*'));
      expect(m.module.exports.getRecursiveSources(sources)[1])
        .to.equal(path.resolve('sourceB/**/*.*'));
    });

    it('should handle multiple sources with some ones including dist', function () {
      var sources = ['sourceA', 'sourceB->dist'];
      expect(m.module.exports.getRecursiveSources(sources).length)
        .to.equal(2);
      expect(m.module.exports.getRecursiveSources(sources)[0])
        .to.equal(path.resolve('sourceA/**/*.*'));
      expect(m.module.exports.getRecursiveSources(sources)[1])
        .to.equal(path.resolve('sourceB/**/*.*'));
    });

    it('should eliminate duplicated sources', function () {
      var sources = ['source1', 'source1'];
      expect(m.module.exports.getRecursiveSources(sources).length)
        .to.equal(1);
    });

    it('should eliminate duplicated sources with some ones including dist', function () {
      var sources = ['source1', 'source1->dist'];
      expect(m.module.exports.getRecursiveSources(sources).length)
        .to.equal(1);
    });
  });
});
