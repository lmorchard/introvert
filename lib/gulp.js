var path = require('path');
var _ = require('lodash');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var through = require('through');

module.exports = function (outfn, options) {
  var introvert = require(__dirname + '/../index');

  options = _.defaults(options || {}, {
  });

  var cwd = process.cwd();
  var outpath = path.resolve(process.cwd(), outfn);
  var outfile = new File({
    cwd: process.cwd(),
    path: outpath,
    base: path.dirname(outpath)
  });

  var files = [];
  function acceptComponent (file) {
    files.push(path.resolve(cwd, file.path));
  }

  function endStream () {
    options.input = files;
    options['file-output'] = false;
    outfile.contents = new Buffer(introvert.buildLibrary(options), 'utf8');
    this.emit('data', outfile);
    this.emit('end');
  }

  return through(acceptComponent, endStream);
}
