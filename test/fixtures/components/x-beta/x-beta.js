(function () {
  // x-beta.js

  var importDoc;
  if (typeof _ownerDocument !== 'undefined') {
    importDoc = _ownerDocument;
  } else {
    var currentScript = document._currentScript || document.currentScript;
    importDoc = currentScript.ownerDocument;
  }
   console.log('x-beta define');

  var XBetaElementPrototype = Object.create(HTMLElement.prototype);

  XBetaElementPrototype.createdCallback = function () {
    var template = importDoc.querySelector('template');
    var shadowRoot = this.createShadowRoot();
    shadowRoot.appendChild(template.content.cloneNode(true));
  };

  XBetaElementPrototype.attachedCallback = function () {
  };

  XBetaElementPrototype.detachedCallback = function () {
  };

  window.XBetaElement = document.registerElement('x-beta', {
    prototype: XBetaElementPrototype
  });

})();
