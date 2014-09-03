var util = require('util');

var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var cheerio = require('cheerio');
var cleancss = require('clean-css');
var url = require('url');

function buildLibraryFile (options) {
  options = _.defaults(options || {}, {
    input: [ './index.html' ],
    output: './package.js',
    dryrun: false
  });
  var src = BUNDLE_TMPL({
    imports: processImports(options)
  });
  fs.writeFileSync(options.output, src, 'utf8');
}

function processImports (options, /* optional: */ inputPaths, imports) {
  var destPath = path.dirname(options.output);

  imports = imports || {};
  inputPaths = inputPaths || options.input;

  _.forEach(inputPaths, function (inputPath) {
    // Normalize input path to full path.
    inputPath = path.resolve(inputPath);

    // Skip processing this input, if we already have it.
    if (imports[inputPath]) { return; }

    var $ = readDocument(inputPath);
    var srcPath = path.dirname(inputPath);

    // Look for HTML imports. Remove them and queue as bundling dependencies.
    var subPaths = [];
    $(constants.IMPORTS).each(function() {
      var el = $(this);
      var href = el.attr('href');
      el.remove();
      subPaths.push(path.resolve(srcPath, href));
    });

    // Process any dependencies.
    if (subPaths.length) {
      processImports(options, subPaths, imports);
    }

    // Process this component
    inlineSheets(options, $, srcPath, destPath);
    imports[inputPath] = {
      js: extractScripts(options, $, srcPath),
      html: $.html()
    };
  });

  return imports;
}

function extractScripts (options, $, dir) {
  var scripts = [];
  $(constants.JS_SRC).each(function() {
    var el = $(this);
    var src = el.attr('src');
    if (src) {
      var filepath = path.resolve(dir, src);
      var content = readFile(filepath);
      // NOTE: reusing UglifyJS's inline script printer (not exported from OutputStream :/)
      content = content.replace(/<\x2fscript([>\/\t\n\f\r ])/gi, "<\\/script$1");
      scripts.push(content);
      el.remove();
    }
  });
  return scripts.join("\n");
}

// inline relative linked stylesheets into <style> tags
function inlineSheets(options, $, srcPath, destPath) {
  $('link[rel="stylesheet"]').each(function() {
    var el = $(this);
    var href = el.attr('href');
    if (href) {
      var filepath = path.resolve(srcPath, href);
      // fix up paths in the stylesheet to be relative to the location of the style
      // var content = pathresolver.rewriteURL(path.dirname(filepath), outputPath, readFile(filepath));
      var content = readFile(filepath);
      var styleDoc = cheerio.load('<style>' + content + '</style>', CHEERIO_READ);
      // clone attributes
      styleDoc('style').attr(el.attr());
      // don't set href or rel on the <style>
      styleDoc('style').attr('href', null);
      styleDoc('style').attr('rel', null);
      el.replaceWith(styleDoc.html());
    }
  });
}

var BUNDLE_TMPL_SRC = fs.readFileSync(__dirname + '/lib/bundle.tmpl.js');
var BUNDLE_TMPL = _.template(BUNDLE_TMPL_SRC);

var CHEERIO_READ = {
  decodeEntities: false
};

var JS = 'script:not([type]), script[type="text/javascript"]';

var constants = {
  IMPORTS: 'link[rel="import"][href]',
  JS: JS,
  JS_SRC: JS.split(',').map(function(s){ return s + '[src]'; }).join(',')
}

function readFile (file) {
  var content = fs.readFileSync(file, 'utf8');
  return content.replace(/^\uFEFF/, '');
}

function readDocument (filename) {
  return cheerio.load(readFile(filename), CHEERIO_READ);
};

module.exports = {
  buildLibraryFile: buildLibraryFile,
  processImports: processImports
};
