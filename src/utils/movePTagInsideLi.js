const { DOMParser, XMLSerializer } = require('xmldom');

function moveTagsToNearestLi(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const tagNames = new Set(['p', 'ul', 'table', 'note',]);

    function traverseAndMoveTags(node) {
        if (!node) return;
        let child = node.firstChild;
        while (child) {
            let nextSibling = child.nextSibling;

            if (tagNames.has(child.nodeName)) {
                let previousNode = child.previousSibling;
                while (previousNode && previousNode.nodeName !== 'li') {
                    previousNode = previousNode.previousSibling;
                }

                if (previousNode && previousNode.nodeName === 'li') {
                    previousNode.appendChild(child);
                }
            } else {
                traverseAndMoveTags(child);
            }

            child = nextSibling;
        }
    }

    traverseAndMoveTags(xmlDoc.documentElement);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
}

module.exports = moveTagsToNearestLi;




// const { DOMParser, XMLSerializer } = require('xmldom');
// function moveTagsToNearestLi(xmlString) {

//     const parser = new DOMParser();
//     const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

//     function moveTagToNearestLi(tagName) {
//         const tags = xmlDoc.getElementsByTagName(tagName);

//         for (let i = tags.length - 1; i >= 0; i--) {
//             const tag = tags[i];

//             let previousNode = tag.previousSibling;
//             while (previousNode && previousNode.nodeName !== 'li') {
//                 previousNode = previousNode.previousSibling;
//             }

//             if (previousNode && previousNode.nodeName === 'li') {

//                 previousNode.appendChild(tag);
//             }
//         }
//     }

  
//     moveTagToNearestLi('p');
//     moveTagToNearestLi('note');
//     moveTagToNearestLi('ul');
//     moveTagToNearestLi('table');
//     const serializer = new XMLSerializer();
//     return serializer.serializeToString(xmlDoc);
// }
// module.exports = moveTagsToNearestLi
