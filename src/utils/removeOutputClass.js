const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

function removeOutputClass(xmlString) {

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const titleElement = xmlDoc.getElementsByTagName('title')[0];

    if (titleElement.hasAttribute('outputclass')) {
        titleElement.removeAttribute('outputclass');
    }

    const serializer = new XMLSerializer();
    const updatedXmlString = serializer.serializeToString(xmlDoc);

    return updatedXmlString;
}

module.exports =removeOutputClass