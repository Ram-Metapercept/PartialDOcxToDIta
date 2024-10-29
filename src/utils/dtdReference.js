const { DOMParser, XMLSerializer } = require("xmldom");

async function isFirstTableInBody(content) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");
  const body = xmlDoc.getElementsByTagName("body")[0];

  let foundUL = false;

  for (let node = body?.firstChild; node; node = node?.nextSibling) {
    if (node.nodeType === 3 && /^\s*$/.test(node.nodeValue)) {
      continue; 
    }
    
    // Check if the first meaningful node is <ul>
    if (node?.nodeType === 1 && node?.nodeName === "ul") {
      foundUL = true; 
      continue; 
    }

   
    if (node?.nodeType === 1 && node?.nodeName === "table") {
   
  
      if (foundUL || node?.nodeName === "table") {
      
        let tbody = node.getElementsByTagName("tbody")[0];
        let rowCount = 0;

        if (tbody) {
          let rowNodes = tbody.getElementsByTagName("row");
          for (let i = 0; i < rowNodes.length; i++) {
            let rowNode = rowNodes[i];

            if (rowNode?.nodeName === "row") {
              rowCount++;
            }
          }
        }

        if (rowCount >= 7) {
          
          const serializer = new XMLSerializer();
          const modifiedContent = serializer
            .serializeToString(xmlDoc)
            .replace(/<topic/g, "<reference")
            .replace(/<\/topic>/g, "</reference>")
            .replace(/<body>/, "<refbody>")
            .replace(/<\/body>/, "</refbody>");
          let a=wrapUlInSection(modifiedContent)
          let modifiedContentWrappedIntoSection = wrapInSection(a);

          return { content: modifiedContentWrappedIntoSection, boolValue: true };
        }
      }
    }

    break; 
  }

  return { content, boolValue: false };
}




function wrapInSection(xmlContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  const table = xmlDoc.getElementsByTagName("table")[0];
  if (!table) return xmlContent; 

  const postReq = xmlDoc.createElement("section");

  let nextNode = table.nextSibling;

  
  while (nextNode) {
    const currentNode = nextNode;
    nextNode = currentNode.nextSibling;
    if (currentNode.nodeType === 1) {
      postReq.appendChild(currentNode);
    }
  }

  if (postReq.hasChildNodes()) {
    table.parentNode.insertBefore(postReq, table.nextSibling);
  }

  const serializer = new XMLSerializer();
  const modifiedXmlContent = serializer.serializeToString(xmlDoc);

  return modifiedXmlContent;
}

function wrapUlInSection(xmlContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const refbody = xmlDoc.getElementsByTagName("refbody")[0];

  const section = xmlDoc.createElement("section");

  const children = Array.from(refbody.childNodes);

  for (const child of children) {
    if (child.nodeName === "ul") {
      let nextSibling = child.nextSibling;

      while (
        nextSibling &&
        nextSibling.nodeType === 3 &&
        nextSibling.textContent.trim() === ""
      ) {
        nextSibling = nextSibling.nextSibling;
      }

      if (nextSibling && nextSibling.nodeName === "table") {
        section.appendChild(child);
      }
    } else if (child.nodeName === "table") {
      break;
    }
  }

  if (section.childNodes.length > 0) {
    refbody.insertBefore(section, refbody.firstChild);
  }

  const serializer = new XMLSerializer();
  const modifiedXmlContent = serializer.serializeToString(xmlDoc);

  return modifiedXmlContent;
}


module.exports = isFirstTableInBody;