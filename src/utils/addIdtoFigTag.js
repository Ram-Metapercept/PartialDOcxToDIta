const { DOMParser, XMLSerializer } = require('xmldom');
const generateRandomId = require('../utils/generateRandomId.js');

function addRandomIdToFig(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const imageElements = xmlDoc.getElementsByTagName('image');
    const imageElementsArray = Array.from(imageElements);

    imageElementsArray.forEach(imageElement => {
        let parent = imageElement.parentNode;
        let insideFigOrXref = false;
        let insideLi = false;

        while (parent) {
            if (parent.tagName === 'fig' || parent.tagName === 'xref') {
                insideFigOrXref = true;
                break;
            }
            if (parent.tagName === 'li') {
                insideLi = true;
                break;
            }
            parent = parent.parentNode;
        }
        if (insideFigOrXref || insideLi) {
            return;
        }

        const figElement = xmlDoc.createElement('fig');
        figElement.appendChild(imageElement.cloneNode(true));

        const id = generateRandomId();
        figElement.setAttribute('id', id);
        imageElement.parentNode.replaceChild(figElement, imageElement);
    });

    const modifiedXmlString = new XMLSerializer().serializeToString(xmlDoc);
    return modifiedXmlString;
}

module.exports = addRandomIdToFig;
