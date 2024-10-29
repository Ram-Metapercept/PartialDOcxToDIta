
const { DOMParser, XMLSerializer } = require("xmldom");
const generateRandomId = require("./generateRandomId")

function addRandomIdToTopics(xmlString) {

    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, "text/xml");

    let topics = xmlDoc.getElementsByTagName("topic");

    for (let i = 0; i < topics.length; i++) {

        let randomId = generateRandomId();


        let idAttribute = xmlDoc.createAttribute("id");
        idAttribute.value = randomId;


        topics[i].setAttributeNode(idAttribute);
    }
    let serializer = new XMLSerializer();
    let modifiedXmlString = serializer.serializeToString(xmlDoc);

    return modifiedXmlString;
}


module.exports = addRandomIdToTopics