const { DOMParser, XMLSerializer } = require("xmldom");
function addTopicTag(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const body = xmlDoc.getElementsByTagName("body")[0];

  let titles = [];
  let currentNode = body.firstChild;

  while (currentNode) {
    if (currentNode.nodeName === "title") {
      titles.push(currentNode);
    }
    currentNode = currentNode.nextSibling;
  }

  let topics = [];

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const nextTitle = i < titles.length - 1 ? titles[i + 1] : null;

    const topic = xmlDoc.createElement("topic");
    const titleClone = title.cloneNode(true);

    const titleClass = titleClone.getAttribute("class");
    const titleOutputClass = titleClone.getAttribute("outputclass");

    if (titleClass) {
      titleClone.setAttribute("class", titleClass);
    }

    if (titleOutputClass) {
      titleClone.setAttribute("outputclass", titleOutputClass);
    }

    topic.appendChild(titleClone);

    currentNode = title.nextSibling;
    const bodyElement = xmlDoc.createElement("body");

    while (currentNode && currentNode !== nextTitle) {
      if (currentNode.nodeName !== "title" && currentNode.nodeName !== "shortdesc") {
        const nextNode = currentNode.nextSibling;
        bodyElement.appendChild(currentNode);
        currentNode = nextNode;
      } else {
        currentNode = currentNode.nextSibling;
      }
    }

    topic.appendChild(bodyElement);
    topics.push(topic);
  }

  topics.forEach((topic) => {
    body.appendChild(topic);
  });

  titles.forEach((title) => {
    body.removeChild(title);
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
}
module.exports = addTopicTag;