const e = require("cors");
const { DOMParser, XMLSerializer } = require("xmldom");

async function tagsValidator(content) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");
  const body = xmlDoc.getElementsByTagName("body")[0];
  const titleElement = xmlDoc.getElementsByTagName("title")[0];

  if (!body) {
    let hasContentAfterTitle = false;

    let nextElement = titleElement.nextSibling;
    while (nextElement) {
      if (nextElement.nodeType === 1) {
    
        hasContentAfterTitle = true;
        break;
      }
      nextElement = nextElement.nextSibling;
    }

    if (
       (titleElement.getAttribute("outputclass") === "h1" ||
        titleElement.getAttribute("outputclass") === "h2" ||
        titleElement.getAttribute("outputclass") === "h3" ||
        titleElement.getAttribute("outputclass") === "h4" ||
        titleElement.getAttribute("outputclass") === "h5" ||
        titleElement.getAttribute("outputclass") === "h6") 
        &&
      hasContentAfterTitle

    ) {

      const bodyElement = xmlDoc.createElement("body");
      nextElement = titleElement.nextSibling;
      while (nextElement) {
        const temp = nextElement.nextSibling;
        bodyElement.appendChild(nextElement);
        nextElement = temp;
        
      }

    
      titleElement.parentNode.insertBefore(
        bodyElement,
        titleElement.nextSibling
      );
    }

    const modifiedXmlContent = new XMLSerializer().serializeToString(xmlDoc);

    return modifiedXmlContent;
  } else {
    return content;
  }
}

module.exports = tagsValidator;
