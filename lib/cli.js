var util = require('util');
var path = require('path');
var fs = require('fs');
var nopt = require('nopt');

var introvert = require(__dirname + '/../index.js');

module.exports = function () {
  var filename = process.argv[2]
  var imports = introvert.processImports(filename);
  var library = introvert.buildLibrary(imports);
  process.stdout.write(library);
};
