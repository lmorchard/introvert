var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var through = require('through');

module.exports = function (outfn, opt) {
  var introvert = require(__dirname + '/../index');

  opt = opt || {};

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
    outfile.contents = new Buffer(introvert.buildLibrary({
      input: files,
      'css-image-inlining': false,
      'css-url-rewriting': false,
      'file-output': false,
      'minify-css': false,
      'minify-js': false
    }), 'utf8');
    this.emit('data', outfile);
    this.emit('end');
  }

  return through(acceptComponent, endStream);
}
