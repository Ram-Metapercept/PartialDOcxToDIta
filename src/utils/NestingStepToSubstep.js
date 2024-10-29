
const { DOMParser, XMLSerializer } = require("xmldom");

function moveStepsOutsideCmd(xmlString) {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const cmdElements = xmlDoc.getElementsByTagName("cmd");

    for (let i = 0; i < cmdElements.length; i++) {
        const cmdElement = cmdElements[i];
        let stepsElement = null;

        for (let j = 0; j < cmdElement.childNodes.length; j++) {
            const childNode = cmdElement.childNodes[j];
            if (childNode.nodeName === "steps") {
                stepsElement = childNode;
                break;
            }
        }

        if (stepsElement) {

            const substepsElement = xmlDoc.createElement("substeps");

            for (let k = 0; k < stepsElement.childNodes.length; k++) {
                const stepNode = stepsElement.childNodes[k];
                if (stepNode.nodeName === "step") {
                    const substepElement = xmlDoc.createElement("substep");

                    while (stepNode.firstChild) {
                        substepElement.appendChild(stepNode.firstChild);
                    }

                    substepsElement.appendChild(substepElement);
                }
            }
            cmdElement.parentNode.insertBefore(substepsElement, cmdElement.nextSibling);
            cmdElement.parentNode.removeChild(stepsElement);
        }
    }

    return serializer.serializeToString(xmlDoc);
}

module.exports = moveStepsOutsideCmd;











