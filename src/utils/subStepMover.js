
const { DOMParser, XMLSerializer } = require("xmldom");

async function subStepsMover(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const steps = xmlDoc.getElementsByTagName("step");

  Array.from(steps).forEach((step) => {
    const cmd = step.getElementsByTagName("cmd")[0];
   
    if (!cmd) return;

    const substeps = Array.from(cmd.getElementsByTagName("substeps"));
    substeps.forEach((substepsElement) => {
      step.appendChild(substepsElement);
    });
  });

  const serializer = new XMLSerializer();
  let result = serializer.serializeToString(xmlDoc);

  result = pTagRemover(result);

  return result;
}

function pTagRemover(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const cmdTags = xmlDoc.getElementsByTagName("cmd");

  const cmdArray = Array.from(cmdTags);

  for (let cmd of cmdArray) {
    const pTags = cmd.getElementsByTagName("p");
    while (pTags.length > 0) {
      const pTag = pTags[0];

      while (pTag.firstChild) {
        cmd.insertBefore(pTag.firstChild, pTag);
      }

      cmd.removeChild(pTag);
    }
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
}

module.exports = subStepsMover;
