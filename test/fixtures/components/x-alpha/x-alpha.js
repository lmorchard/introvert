(function () {
  // x-alpha.js

  var importDoc;
  if (typeof _ownerDocument !== 'undefined') {
    importDoc = _ownerDocument;
  } else {
    var currentScript = document._currentScript || document.currentScript;
    importDoc = currentScript.ownerDocument;
  }
   console.log('x-alpha define');

  var XAlphaElementPrototype = Object.create(HTMLElement.prototype);

  XAlphaElementPrototype.createdCallback = function () {
    var template = importDoc.querySelector('template');
    var shadowRoot = this.createShadowRoot();
    shadowRoot.appendChild(template.content.cloneNode(true));
  };

  XAlphaElementPrototype.attachedCallback = function () {
  };

  XAlphaElementPrototype.detachedCallback = function () {
  };

  window.XAlphaElement = document.registerElement('x-alpha', {
    prototype: XAlphaElementPrototype
  });

})();
