;(function () {

  function __loadHTML(html, path) {
    var doc = document.implementation.createHTMLDocument('import');

    var jsPath = document.currentScript.getAttribute('src');
    var spos = jsPath.lastIndexOf('/');
    var baseHref = jsPath.substr(0, spos + 1) + path;
    console.log(baseHref);

    doc._URL = baseHref;

    var base = doc.createElement('base');
    base.setAttribute('href', baseHref);
    doc.baseURI = baseHref;
    doc.head.appendChild(base);

    var meta = doc.createElement('meta');
    meta.setAttribute('charset', 'utf-8');
    doc.head.appendChild(meta);

    doc.body.innerHTML = html;
    return doc;
  }

  <% _.forEach(imports, function (i) { %>
    (function (_ownerDocument) {
      <%= i.js %>
    })(__loadHTML(<%= JSON.stringify(i.html) %>, <%= JSON.stringify(i.path) %>));
  <% }); %>

})();
