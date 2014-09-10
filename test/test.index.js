/* jshint expr: true */
/* global chai, before, describe, it */
process.env.NODE_ENV = 'test';

var util = require('util');
var fs = require('fs');
var expect = require('chai').expect;

var introvert = require('../index.js');

var FIXTURES_PATH = __dirname + '/fixtures';

function f(name) {
  return FIXTURES_PATH + '/' + name;
}

describe('processImports', function () {
  var options;

  beforeEach(function () {
    options = {
      input: [
        f('components/x-app/x-app.html'),
        f('components/x-alpha/x-alpha.html')
      ],
      output: f('components.js'),
      'file-output': false,
      'minify-js': false,
      'minify-css': false
    };
  });

  it('should contain all the expected dependencies', function () {
    var library = introvert.buildLibrary(options);
    expect(library).to.not.be.empty;
    ['dep', 'beta', 'alpha', 'app'].forEach(function (name) {
      expect(library).to.contain('<!-- x-' + name + '.html -->');
      expect(library).to.contain('// x-' + name + '.js');
      expect(library).to.contain('/* x-' + name + '.css */');
    });
  });

  it('should not contain skipped dependencies', function () {
    options['skip'] = [f('components/path/to/x-dep.html')];
    var library = introvert.buildLibrary(options);
    expect(library).to.not.be.empty;
    var name = 'dep';
    expect(library).not.to.contain('<!-- x-' + name + '.html -->');
    expect(library).not.to.contain('// x-' + name + '.js');
    expect(library).not.to.contain('/* x-' + name + '.css */');
  });

  it('should by default inline all images in CSS', function () {
    var library = introvert.buildLibrary(options);
    expect(library).to.contain('background: url(data:image/png;base64,');
  });

  it('should support an option to not inline all images in CSS', function () {
    options['css-image-inlining'] = false;
    var library = introvert.buildLibrary(options);
    expect(library).to.not.contain('background: url(data:image/png;base64,');
  });

  it('should by default rewrite all URL paths in CSS relative to output', function () {
    options['css-image-inlining'] = false;
    var library = introvert.buildLibrary(options);
    expect(library).to.contain('background: url(img/dino-head.png)');
  });

  it('should support an option to not rewrite all URL paths in CSS relative to output', function () {
    options['css-image-inlining'] = false;
    options['css-url-rewriting'] = false;
    var library = introvert.buildLibrary(options);
    expect(library).to.contain('background: url(../../../img/dino-head.png)');
  });

});
