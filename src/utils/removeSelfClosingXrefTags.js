

const { DOMParser, XMLSerializer } = require("xmldom");
function removeSelfClosingXrefTags(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const xrefElements = xmlDoc.getElementsByTagName('xref');
    const pElements = xmlDoc.getElementsByTagName('p');
    for (let i = xrefElements.length - 1; i >= 0; i--) {
      const xref = xrefElements[i];
      // Check if the xref element is self-closing (has no children)
      if (!xref.hasChildNodes()) {
        xref.parentNode.removeChild(xref);
      }
    }
    for (let i = pElements.length - 1; i >= 0; i--) {
        const p = pElements[i];
        if (!p.hasChildNodes()) {
          p.parentNode.removeChild(p);
        }
      }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  }
  

  module.exports=removeSelfClosingXrefTags