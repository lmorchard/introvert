/* jshint expr: true */
/* global chai, before, describe, it */
process.env.NODE_ENV = 'test';

var util = require('util');
var fs = require('fs');
var expect = require('chai').expect;

var introvert = require('../index.js');

var FIXTURES_PATH = __dirname + '/fixtures';

describe('play', function () {

});

describe('processImports', function () {

  var imports;

  before(function () {
    imports = introvert.processImports(FIXTURES_PATH + '/index.html');
  });

  it('should find all the html dependencies', function () {
    expect(imports).to.have.keys([
      './x-app/x-app.html',
      './path/to/x-dep.html'
    ]);
  });

  it('should find all the linked scripts', function () {
    expect(imports['./x-app/x-app.html'].js).to.contain('// x-app.js');
    expect(imports['./path/to/x-dep.html'].js).to.contain('// x-dep.js');
  });

  it('should inline all the linked styles', function () {
    expect(imports['./x-app/x-app.html'].html).to.contain('/* x-app.css */');
    expect(imports['./path/to/x-dep.html'].html).to.contain('/* x-dep.css */');
  });

});

describe('buildLibrary', function () {

  var imports, library;

  before(function () {
    imports = introvert.processImports(FIXTURES_PATH + '/index.html');
    library = introvert.buildLibrary(imports);
  });

  it('should contain all the HTML, JS, and CSS from dependencies', function () {
    expect(library).to.contain('<!-- x-app.html -->');
    expect(library).to.contain('<!-- x-dep.html -->');
    expect(library).to.contain('// x-app.js');
    expect(library).to.contain('// x-dep.js');
    expect(library).to.contain('/* x-app.css */');
    expect(library).to.contain('/* x-dep.css */');
  });

});
