
const { DOMParser, XMLSerializer } = require("xmldom");

function dtdConcept(content) {
  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    const serializer = new XMLSerializer();
    let modifiedContent = serializer
      .serializeToString(xmlDoc)
      .replace(/<topic/g, "<concept")
      .replace(/<\/topic>/g, "</concept>")
      .replace(/<body>/, "<conbody>")
      .replace(/<\/body>/, "</conbody>");

    resolve({ content: modifiedContent, boolValue: true });
  });
}

module.exports = dtdConcept;