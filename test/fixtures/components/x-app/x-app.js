(function () {
  // x-app.js
  console.log("x-app define");

  var importDoc;
  if (typeof _ownerDocument !== 'undefined') {
    importDoc = _ownerDocument;
  } else {
    var currentScript = document._currentScript || document.currentScript;
    importDoc = currentScript.ownerDocument;
  }

  var XAppElementPrototype = Object.create(HTMLElement.prototype);

  XAppElementPrototype.createdCallback = function () {
    var template = importDoc.querySelector('template');
    var shadowRoot = this.createShadowRoot();
    shadowRoot.appendChild(template.content.cloneNode(true));
  };

  window.XAppElement = document.registerElement('x-app', {
    prototype: XAppElementPrototype
  });
})();
