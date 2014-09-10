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
  '  --no-file-output: Output to stdout instead of file',
  '  --verbose, -v: More verbose logging',
  '  --help, -h, -?: Print this message',
  '  --no-css-image-inlining: Skip inlining images with data: URLs ',
  '  --no-css-url-rewriting: Skip rewriting relative URLs in CSS'
];

function printHelp () {
  console.log(help.join('\n'));
  process.exit(0);
}

var options = nopt(
  {
    'help': Boolean,
    'output': path,
    'verbose': Boolean,
    'css-image-inlining': Boolean,
    'css-url-rewriting': Boolean,
    'file-output': Boolean,
    'skip': Array
  },
  {
    '?': ['--help'],
    'h': ['--help'],
    'o': ['--output'],
    'v': ['--verbose'],
    'I': ['--css-image-inlining'],
    'U': ['--css-url-rewriting']
  }
);

module.exports = function () {
  if (options.help || process.argv.length === 2) {
    printHelp();
  }
  var argv = options.argv.remain;
  if (argv[0]) {
    options.input = argv.map(function (arg) {
      return path.resolve(arg);
    });
  }
  var src = introvert.buildLibrary(options);
  if (!options['file-output']) {
    process.stdout.write(src);
  }
};
