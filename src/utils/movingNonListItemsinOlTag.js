const { DOMParser, XMLSerializer } = require('xmldom');
const xpath = require('xpath');

function moveNontListElementToOl(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  const nodesToMove = xpath.select("//ol/following-sibling::*[self::p or self::table or self::note or self::ul]", doc);

  nodesToMove.forEach(node => {
    const previousOl = xpath.select("preceding-sibling::ol[1]", node)[0];
    if (previousOl) {
      previousOl.appendChild(node);
    }
  });

  const xmlStringTransformed = new XMLSerializer().serializeToString(doc);

  return xmlStringTransformed;
}

module.exports = moveNontListElementToOl;