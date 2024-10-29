
const { DOMParser, XMLSerializer } = require('xmldom');
function removeBoldTag(xmlString) {

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const topicNode = xmlDoc.getElementsByTagName("topic")[0];
    const titleNodes = topicNode.getElementsByTagName("title");

    for (let i = 0; i < titleNodes.length; i++) {
        const titleNode = titleNodes[i];
        const boldNodes = titleNode.getElementsByTagName("b");

        while (boldNodes.length > 0) {
            const boldNode = boldNodes[0];
            const textContent = boldNode.textContent;
            const textNode = xmlDoc.createTextNode(textContent);
            titleNode.replaceChild(textNode, boldNode);
        }
    }

    const modifiedXmlString = new XMLSerializer().serializeToString(xmlDoc);

    return modifiedXmlString;
}


function removeBoldTagFromImage(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const boldTags = xmlDoc.getElementsByTagName('b');

    for (let i = 0; i < boldTags.length; i++) {
        const boldTag = boldTags[i];
        let containsImage = false;

        for (let j = 0; j < boldTag.childNodes.length; j++) {
            if (boldTag.childNodes[j].nodeName.toLowerCase() === 'image') {
                containsImage = true;
                break;
            }
        }

        if (containsImage) {
            const parent = boldTag.parentNode;

            while (boldTag.firstChild) {
                parent.insertBefore(boldTag.firstChild, boldTag);
            }

            parent.removeChild(boldTag);

            i--;
        }
    }

    const serializer = new XMLSerializer();
    const newXmlString = serializer.serializeToString(xmlDoc);

    return newXmlString;
}



module.exports={removeBoldTag,removeBoldTagFromImage}

