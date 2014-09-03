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

var COMPONENTS_JS = f('js/components.js');

describe('processImports', function () {
  var library;

  before(function () {
    try { fs.unlinkSync(COMPONENTS_JS); } catch (e) { }
    introvert.buildLibraryFile({
      input: [
        f('components/x-app/x-app.html'),
        f('components/x-alpha/x-alpha.html')
      ],
      output: COMPONENTS_JS
    });
    library = fs.readFileSync(COMPONENTS_JS, {encoding: 'utf8'});
    expect(library).to.not.be.empty;
  });

  it('should contain all the HTML, JS, and CSS from dependencies', function () {
    ['dep', 'beta', 'alpha', 'app'].forEach(function (name) {
      expect(library).to.contain('<!-- x-' + name + '.html -->');
      expect(library).to.contain('// x-' + name + '.js');
      expect(library).to.contain('/* x-' + name + '.css */');
    });
  });

});
