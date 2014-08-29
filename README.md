# introvert

[![Build Status](https://travis-ci.org/lmorchard/introvert.svg?branch=master)](https://travis-ci.org/lmorchard/introvert)

Combine a dependent set of Web Components into one JavaScript library

## Installation

TODO: Someday this may appear on npm

## Usage

    ./bin/introvert test/fixtures/index.html > index.js

## Options

TODO: Options would be nice to have!

## Notes

This is an experiment in cramming all the assets for a set of dependendent web
components into one JS library package. The results look something like this:
```javascript
;(function () {
  function __loadHTML(html) {
    var doc = document.implementation.createHTMLDocument('import');
    var meta = doc.createElement('meta');
    meta.setAttribute('charset', 'utf-8');
    doc.head.appendChild(meta);
    doc.body.innerHTML = html;
    return doc;
  }

(function (_ownerDocument) {

(function () {
  // x-dep.js

  var importDoc;
  if (typeof _ownerDocument !== 'undefined') {
    importDoc = _ownerDocument;
  } else {
    var currentScript = document._currentScript || document.currentScript;
    importDoc = currentScript.ownerDocument;
  }

  var template = importDoc.querySelector('template');

  /* ... */
});

})(__loadHTML("<!-- x-dep.html -->\n<template>\n  <style>/* x-dep.css */\n</style>\n  <img src=\"http://www.polymer-project.org/images/logos/p-logo.svg\">\n</template>\n\n\n"));

(function (_ownerDocument) {

(function () {
  // x-app.js

  var importDoc;
  if (typeof _ownerDocument !== 'undefined') {
    importDoc = _ownerDocument;
  } else {
    var currentScript = document._currentScript || document.currentScript;
    importDoc = currentScript.ownerDocument;
  }

  var template = importDoc.querySelector('template');

  /* ... */
});

})(__loadHTML("<!-- x-app.html -->\n\n\n<template>\n  <style>/* x-app.css */\n</style>\n  <x-dep></x-dep>\n</template>\n\n\n"));

})()
```
