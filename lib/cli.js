var util = require('util');
var path = require('path');
var fs = require('fs');
var nopt = require('nopt');

var introvert = require(__dirname + '/../index.js');

var help = [
  'introvert: Concatenate a set of Web Components into one JS library',
  '',
  'Usage:',
  '  introvert [OPTIONS] <html file>',
  '',
  'Options:',
  '  --output, -o: Output file name (defaults to introvertd.html)',
  '  --verbose, -v: More verbose logging',
  '  --help, -h, -?: Print this message'
];

function printHelp () {
  console.log(help.join('\n'));
  process.exit(0);
}

var options = nopt(
  {
    'help': Boolean,
    'output': path,
    'verbose': Boolean
  },
  {
    '?': ['--help'],
    'h': ['--help'],
    'o': ['--output'],
    'v': ['--verbose']
  }
);

module.exports = function () {

  if (options.help || process.argv.length === 2) {
    printHelp();
  }

  var argv = options.argv.remain;

  if (argv[0]) {
    options.input = path.resolve(argv[0]);
  }

  introvert.setOptions(options, function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var imports = introvert.processImports(options.input);
    var library = introvert.buildLibrary(imports);
    process.stdout.write(library);
  });

};
