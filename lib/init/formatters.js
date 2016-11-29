/**
 * This file is part of the Kickstarter.
 *
 * (c) iGitScor <http://github.com/iGitScor/kicksterter>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var fs  = require('fs'),
  util  = require('util');

var JS_TEMPLATE_PATH = __dirname + '/../tpl/config.tpl.js';

var JavaScriptFormatter = function () {
  var quote = function (value) {
    return "'" + value + "'";
  };

  this.formatProject = function (content) {
    return content
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  this.formatFiles = function (includedFiles) {
    if (includedFiles) {
      var files = includedFiles.map(quote);
      files = files.map(function (file) {
        return '\n      ' + file;
      });

      return files.join(',');
    }

    return [];
  };

  this.formatAnswers = function (answers) {
    return {
      DATE: new Date(),
      BASE_PATH: answers.basePath,
      PROJECT: this.formatProject(answers.project),
      SERVER: answers.server ? 'true' : 'false',
      SERVERPATH: answers.serverPath || null,
      TWIG: answers.twig ? 'true' : 'false',
      TWIGSRC: this.formatFiles(answers.twigPath),
      TWIGDIST: answers.twigDistPath || null,
      CONTENT: answers.content,
      CONTENTPATH: answers.contentPath || null,
      HTML: answers.html ? 'true' : 'false',
      HTMLPATH: this.formatFiles(answers.htmlPath),
      JS: answers.js ? 'true' : 'false',
      JSAPP: this.formatFiles(answers.jsApp),
      JSSRC: this.formatFiles(answers.jsPath),
      JSDIST: answers.jsDistPah || null,
      IMAGES: answers.images ? 'true' : 'false',
      IMAGESSRC: this.formatFiles(answers.imagesPath),
      IMAGESDIST: answers.imagesDistPath || null,
      CSSPREPROCESSORS: answers.csspreprocess,
      CSSPREPROCESSORSSRC: this.formatFiles(answers.csspreprocessPath),
      CSSPREPROCESSORSDIST: answers.csspreprocessDistPath || null,
    };
  };

  this.generateConfigFile = function (answers) {
    var template = fs.readFileSync(JS_TEMPLATE_PATH).toString();
    var replacements = this.formatAnswers(answers);

    return template.replace(/%(.*)%/g, function (a, key) {
      return replacements[key];
    });
  };

  this.writeConfigFile = function (path, answers) {
    fs.writeFileSync(path, this.generateConfigFile(answers));
  };
};

exports.createForPath = function (path) {
  return new JavaScriptFormatter();
};
