(function () {
  // x-dep.js

  var importDoc;
  if (typeof _ownerDocument !== 'undefined') {
    importDoc = _ownerDocument;
  } else {
    var currentScript = document._currentScript || document.currentScript;
    importDoc = currentScript.ownerDocument;
  }
   console.log('x-dep define');

  var XDepElementPrototype = Object.create(HTMLElement.prototype);

  XDepElementPrototype.createdCallback = function () {
    var template = importDoc.querySelector('template');
    shimShadowStyles(template.content.querySelectorAll('style'), 'x-dep');
    var shadowRoot = this.createShadowRoot();
    shadowRoot.appendChild(template.content.cloneNode(true));
  };

  XDepElementPrototype.attachedCallback = function () {
  };

  XDepElementPrototype.detachedCallback = function () {
  };

  window.XDepElement = document.registerElement('x-dep', {
    prototype: XDepElementPrototype
  });

  function shimShadowStyles(styles, tag) {
    if (!Platform.ShadowCSS) {
      return;
    }
    for (var i = 0; i < styles.length; i++) {
      var style = styles[i];
      var cssText = Platform.ShadowCSS.shimStyle(style, tag);
      Platform.ShadowCSS.addCssToDocument(cssText);
      style.remove();
    }
  }

})();
