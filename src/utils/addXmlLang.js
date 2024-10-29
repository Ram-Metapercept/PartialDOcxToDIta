const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

function addXmlLangAttribute(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const tags = ['topic', 'task', 'reference', 'concept'];
    tags.forEach(tag => {
        const elements = xmlDoc.getElementsByTagName(tag);
        for (let i = 0; i < elements.length; i++) {
            elements[i].setAttribute('xml:lang', 'en-us');
        }
    });

    const serializer = new XMLSerializer();
    const updatedXmlString = serializer.serializeToString(xmlDoc);
    return updatedXmlString;
}

module.exports = addXmlLangAttribute