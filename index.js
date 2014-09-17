var util = require('util');

var fs = require('fs');
var path = require('path');
var url = require('url');

var _ = require('lodash');
var cheerio = require('cheerio');
var cleancss = require('clean-css');
var datauri = require('datauri');

function processOptions (options) {
  options = _.defaults(options || {}, {
    input: [ './index.html' ],
    output: './package.js',
    'css-image-inlining': true,
    'css-url-rewriting': true,
    'file-output': true,
    'minify-css': true,
    'minify-js': true,
    'skip': [],
    'substitutions': {}
  });

  if (options.skip.length) {
    options.skip = options.skip.map(function (item) {
      return path.resolve(item);
    });
  }

  // Resolve all the path substitutions, if any.
  options.substitutions = _.chain(options.substitutions)
    .map(function (v, k) {
      return [path.resolve(k), path.resolve(v)];
    })
    .zipObject()
    .value();

  return options;
}

function buildLibrary (options) {
  options = processOptions(options);

  var src = BUNDLE_TMPL({
    imports: processImports(options)
  });

  if (options['minify-js']) {
    var escodegen = require('escodegen');
    var esprima = require('esprima');
    var esmangle = require('esmangle');

    src = escodegen.generate(esmangle.mangle(esprima.parse(src)), {
      format: {
        renumber: true,
        hexadecimal: true,
        escapeless: true,
        compact: true,
        semicolons: false,
        parentheses: false
      }
    }) + ';';
  }

  if (options['file-output']) {
    fs.writeFileSync(options.output, src, 'utf8');
  }

  return src
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

    // Skip any paths explicitly set to skip
    if (options.skip.indexOf(inputPath) !== -1) { return; }

    var $ = readDocument(inputPath, options);
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
      path: path.relative(destPath, inputPath),
      js: extractScripts(options, $, srcPath, destPath),
      html: extractHTML(options, $, srcPath, destPath)
    };

  });

  return imports;
}

function extractHTML (options, $, srcPath, destPath) {
  var src = $.html();
  return src;
}

function extractScripts (options, $, dir) {
  var scripts = [];

  $(constants.JS_SRC).each(function() {
    var el = $(this);
    var src = el.attr('src');
    if (!src) { return; }

    var filepath = path.resolve(dir, src);
    var content = readFile(filepath, options);

    // NOTE: reusing UglifyJS's inline script printer (not exported from OutputStream :/)
    content = content.replace(/<\x2fscript([>\/\t\n\f\r ])/gi, "<\\/script$1");

    // HACK: Brute force sledgehammer to wedge the HTML imports into
    // conventional Brick component JS
    content = content.replace(
      'var importDoc = currentScript.ownerDocument;',
      'var importDoc = _ownerDocument;'
    );

    scripts.push(content);
    el.remove();
  });

  return scripts.join("\n");
}

// inline relative linked stylesheets into <style> tags
function inlineSheets(options, $, srcPath, destPath) {
  $('link[rel="stylesheet"]').each(function() {
    var el = $(this);
    var href = el.attr('href');
    if (!href) { return; }

    var filepath = path.resolve(srcPath, href);
    var content = rewriteCSS(options, srcPath, destPath, readFile(filepath, options));
    var styleDoc = cheerio.load('<style>' + content + '</style>', CHEERIO_READ);

    styleDoc('style').attr(el.attr());
    styleDoc('style').attr('href', null);
    styleDoc('style').attr('rel', null);

    el.replaceWith(styleDoc.html());
  });
}

function rewriteCSS (options, srcPath, destPath, css) {
  var RE_IS_IMG = /\.(jpg|png|gif)$/;
  if (options['css-image-inlining']) {
    css = css.replace(constants.URL, function(match) {
      var urlpath = match.replace(/["']/g, "").slice(4, -1);
      if (!constants.ABS_URL.test(urlpath) && RE_IS_IMG.test(urlpath)) {
        urlpath = datauri(path.resolve(srcPath, urlpath));
      }
      return 'url(' + urlpath + ')';
    });
  }
  if (options['css-url-rewriting']) {
    css = css.replace(constants.URL, function(match) {
      var path = match.replace(/["']/g, "").slice(4, -1);
      path = rewriteRelPath(srcPath, destPath, path);
      return 'url(' + path + ')';
    });
  }
  if (options['minify-css']) {
    var CleanCSS = require('clean-css');
    css = new CleanCSS().minify(css)
  }
  return css;
}

function rewriteRelPath(inputPath, outputPath, rel) {
  if (constants.ABS_URL.test(rel)) {
    return rel;
  }
  var abs = path.resolve(inputPath, rel);
  var relPath = path.relative(outputPath, abs);
  return relPath.split(path.sep).join('/');
}

function readFile (file, options) {
  if (file in options.substitutions) {
    file = options.substitutions[file];
  }
  var content = fs.readFileSync(file, 'utf8');
  return content.replace(/^\uFEFF/, '');
}

function readDocument (filename, options) {
  return cheerio.load(readFile(filename, options), CHEERIO_READ);
};

var BUNDLE_TMPL_SRC = fs.readFileSync(__dirname + '/lib/bundle.tmpl.js');
var BUNDLE_TMPL = _.template(BUNDLE_TMPL_SRC);

var CHEERIO_READ = {
  decodeEntities: false
};

var JS = 'script:not([type]), script[type="text/javascript"]';
var URL_ATTR = ['href', 'src', 'action', 'style'];
var constants = {
  IMPORTS: 'link[rel="import"][href]',
  JS: JS,
  JS_SRC: JS.split(',').map(function(s){ return s + '[src]'; }).join(','),
  JS_INLINE: JS.split(',').map(function(s) { return s + ':not([src])'; }).join(','),
  EOL: require('os').EOL,
  ABS_URL: /(^data:)|(^http[s]?:)|(^\/)/,
  URL: /url\([^)]*\)/g,
  URL_ATTR: URL_ATTR,
  URL_ATTR_SEL: '[' + URL_ATTR.join('],[') + ']',
  URL_TEMPLATE: '{{.*}}',
  CSS: 'style:not([type]), style[type="text/css"]'
};

module.exports = {
  buildLibrary: buildLibrary,
  processImports: processImports,
  gulp: require(__dirname + '/lib/gulp')
};
