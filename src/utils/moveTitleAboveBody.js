const { DOMParser, XMLSerializer } = require("xmldom");
const generateRandomId = require("./generateRandomId");

 function moveTitleAboveBody(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const titles = xmlDoc.getElementsByTagName("title");
  const titlesAlts = xmlDoc.getElementsByTagName("titlealts");
  const topic = xmlDoc.getElementsByTagName("topic")[0];

  const title = titles[0];
  const titlealts = titlesAlts[0];
  if (
    titlesAlts.length > 0 &&
    titlesAlts[0].parentNode.tagName.toLowerCase() === "body"
  ) {
    xmlDoc.documentElement.removeChild(titlealts);
    xmlDoc.documentElement.insertBefore(
      titlealts,
      xmlDoc.documentElement.firstChild
    );
  }
  if (
    titles.length > 0 &&
    titles[0].parentNode.tagName.toLowerCase() === "body"
  ) {

    title.removeAttribute("outputclass");
    xmlDoc.documentElement.removeChild(title);

    xmlDoc.documentElement.insertBefore(
      title,
      xmlDoc.documentElement.firstChild
    );
  }

  if (titles.length > 0) {
    topic.setAttribute(
      "id",
      title.childNodes[0]?.data 
        // .replaceAll(/'/g, "")
        // .replaceAll(" ", "_")
        // .toLowerCase()
        // .substring(0, 7)
        +
        "_" +
        generateRandomId(6)
    );
  } else {
    topic?.setAttribute("id", generateRandomId(6));
  }

  return new XMLSerializer().serializeToString(xmlDoc);
}

module.exports = moveTitleAboveBody;
