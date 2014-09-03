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
