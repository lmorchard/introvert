var util = require('util');

var fs = require('fs');
var path = require('path');

var cheerio = require('cheerio');
var cleancss = require('clean-css');
var url = require('url');

function processIndexDocumentFile (filename) {
  var imports = processImports(filename);
};

function processImports (filename, $, rootPath, imports) {

  filename = fs.realpathSync(filename);
  var basePath = path.dirname(filename);
  $ = $ || readDocument(filename);
  rootPath = rootPath || basePath;
  imports = imports || {};

  $(constants.IMPORTS).each(function() {
    var el = $(this);
    el.remove();

    var href = el.attr('href');

    var importPath = fs.realpathSync(path.resolve(basePath, href));
    var importBasePath = path.dirname(importPath);
    var importDoc = readDocument(importPath);

    processImports(importPath, importDoc, rootPath, imports);

    var out = { path: importPath };
    out.js = extractScripts(importDoc, importBasePath);
    inlineSheets(importDoc, importBasePath);
    out.html = importDoc.html();

    imports[importPath.replace(rootPath, '.')] = out;
  });

  return imports;
}

function buildLibrary (imports) {
  var out = [fs.readFileSync(__dirname + '/lib/preamble.js')];
  for (var k in imports) {
    var i = imports[k];
    out.push("(function (_ownerDocument) {");
    out.push("");
    out.push(i.js);
    out.push("})(__loadHTML(" + JSON.stringify(i.html) + "));");
    out.push("");
  }
  out.push("})();");
  return out.join("\n");
}

function extractScripts ($, dir) {
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
function inlineSheets($, basePath) {
  $('link[rel="stylesheet"]').each(function() {
    var el = $(this);
    var href = el.attr('href');
    if (href) {
      var filepath = path.resolve(basePath, href);
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
  processImports: processImports,
  buildLibrary: buildLibrary
};
