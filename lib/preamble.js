;(function () {
  function __loadHTML(html) {
    var doc = document.implementation.createHTMLDocument('import');
    var meta = doc.createElement('meta');
    meta.setAttribute('charset', 'utf-8');
    doc.head.appendChild(meta);
    doc.body.innerHTML = html;
    return doc;
  }
