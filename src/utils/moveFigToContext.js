const { DOMParser, XMLSerializer } = require('xmldom');

function moveFigToContext(xmlString) {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    const task = xmlDoc.documentElement;

    let shortdesc = null;
    let context = null;

    for (let i = 0; i < task.childNodes.length; i++) {
        const node = task.childNodes[i];
        if (node.nodeName === 'shortdesc') {
            shortdesc = node;
        } else if (node.nodeName === 'taskbody') {
            for (let j = 0; j < node.childNodes.length; j++) {
                if (node.childNodes[j].nodeName === 'context') {
                    context = node.childNodes[j];
                    break;
                }
            }
        }
    }

    if (shortdesc) {
        let fig = null;
        for (let i = 0; i < shortdesc.childNodes.length; i++) {
            if (shortdesc.childNodes[i].nodeName === 'fig') {
                fig = shortdesc.childNodes[i];
                break;
            }
        }

        if (fig && context) {
         
            context.appendChild(fig);
            task.removeChild(shortdesc);
        }
    }
    return serializer.serializeToString(xmlDoc);
}
module.exports=moveFigToContext