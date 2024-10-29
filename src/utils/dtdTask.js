const { DOMParser, XMLSerializer } = require("xmldom");
const cheerio = require("cheerio")
const nlp = require("compromise");
async function dtdTask(content) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");
  const body = xmlDoc.getElementsByTagName("body")[0];

  if (!body) {
    return { content, boolValue: false };
  }

  const childElements = [];
  let node = body.firstChild;
  let count = 0;
  while (node && count < 3) {
    if (node?.nodeType === 1) {
      childElements.push(node?.nodeName);
      count++;
    }
    node = node.nextSibling;
  }

  if (childElements.length >= 1) {
    if (
      (
        childElements[0] === "p" &&
        childElements[1] === "ol") ||
      (
        childElements[0] === "p" &&
        childElements[1] === "p" &&
        childElements[2] === "ol")
      || (childElements[0] === "ol" && (verbChecker(xmlDoc))
      )

    ) {
      const $ = cheerio.load(xmlDoc.toString(), { xmlMode: true });
      $('ul, ol').each(function () {
        const stepsContent = $(this).html(); 
        const stepsTag = `<steps>${stepsContent}</steps>`;
        $(this).replaceWith(stepsTag); 
      });

      $('li').each(function () {
        const stepContent = $(this).html(); 
        const stepTag = `<step><cmd>${stepContent}</cmd></step>`;
        $(this).replaceWith(stepTag); 
      });

      $('topic').each(function () {
        const idAttr = $(this).attr('id');
        const taskTag = `<task${idAttr ? ` id="${idAttr}"` : ''}>${$(this).html()}</task>`; // Create the 'task' tag with the id attribute if it exists
        $(this).replaceWith(taskTag); 
      });
      $('body').each(function () {
        const bodyContent = $(this).html();
        const taskBodyTag = `<taskbody>${bodyContent}</taskbody>`;
        $(this).replaceWith(taskBodyTag); 
      });

      $('cmd').each((i, cmdElem) => {
        const $cmd = $(cmdElem);
        const lists = $cmd.children('ol, ul');
        const tables = $cmd.children('table');
      
        // Handle tables
        if (tables.length > 0) {
          tables.each((_, tableElem) => {
            const $table = $(tableElem);
            const infoTag = $('<info></info>').append($table.clone());
            $cmd.after(infoTag);  // Append <info> after <cmd>
            $table.remove();      // Remove the original table from <cmd>
          });
        }
      
        if (lists.length > 0) {
          const substeps = $('<substeps></substeps>');
      
          lists.each((j, listElem) => {
            const listItems = $(listElem).children('li');
      
            listItems.each((k, listItem) => {
              const substep = $('<substep></substep>');
              const listItemContents = $(listItem).contents().filter(function () {
                return !$(this).is('ol, ul');
              });
      
              // Combine text from <p>, <fig>, or text nodes
              let listItemText = '';
              listItemContents.each((_, content) => {
                if ($(content).is('p, fig') || content.nodeType === 3) {
                  listItemText += $(content).text().trim() + ' ';
                }
              });
      
              listItemText = listItemText.trim();
      
              // Only create a <cmd> tag if there's meaningful text
              if (listItemText) {
                const cmdText = $('<cmd></cmd>').text(listItemText);
                substep.append(cmdText);
              }
      
              const nestedLists = $(listItem).children('ol, ul');
              if (nestedLists.length > 0) {
                const info = $('<info></info>');
                nestedLists.each((l, nestedList) => {
                  info.append($(nestedList).clone());
                });
      
                $cmd.after(info); // Append <info> after <cmd>
              }
      
              // Only append substep if it has content (either cmdText or nested lists)
              if (substep.children().length > 0) {
                substeps.append(substep);
              }
            });
          });
      
          // Only append substeps if they have content
          if (substeps.children().length > 0) {
            $cmd.after(substeps);  // Append substeps after <cmd>
          }
      
          // Move additional contents like <p>, <fig> to <info>
          $cmd.contents().each((_, childElem) => {
            if ($(childElem).is('p, fig')) {
              const infoTag = $('<info></info>').append($(childElem).clone());
              $cmd.after(infoTag);  // Append <info> after <cmd>
              $(childElem).remove(); // Remove the original element
            }
          });
      
          lists.remove();  // Remove lists from <cmd>
        }
      
        // Remove empty <cmd> tags
        if ($cmd.is(':empty')) {
          $cmd.remove();
        }
      });
   
      let modifiedContent = $.xml()
      modifiedContent = wrapParagraphsInTaskBody(modifiedContent)
      modifiedContent = wrapPostReq(modifiedContent)
      return {
        content: modifiedContent,
        boolValue: true,
      };
    }
  }
  return { content, boolValue: false };
}

function wrapPostReq(xmlContent) {

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  const steps = xmlDoc.getElementsByTagName("steps")[0];
  const postReq = xmlDoc.createElement("postreq");

  let nextNode = steps?.nextSibling;
  while (nextNode) {
    const currentNode = nextNode;

    nextNode = currentNode?.nextSibling;
    postReq?.appendChild(currentNode);
  }

  steps?.parentNode?.insertBefore(postReq, steps?.nextSibling);

  const serializer = new XMLSerializer();
  const modifiedXmlContent = serializer.serializeToString(xmlDoc);
  return modifiedXmlContent;
}

function wrapParagraphsInTaskBody(xmlContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  const taskBody = xmlDoc.getElementsByTagName("taskbody")[0];

  if (!taskBody) {
    console.error("Error: No <taskbody> tag found in the XML.");
    return xmlContent;
  }

  const children = Array.from(taskBody.childNodes).filter(
    (node) => node.nodeType === 1
  );

  const paragraphs = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (child.tagName.toLowerCase() === "p") {
      paragraphs.push(child);
    } else if (child.tagName.toLowerCase() === "steps") {
      break;
    } else {
      if (paragraphs.length > 0) {
        break;
      }
    }
  }

  if (
    paragraphs.length > 0 &&
    children[paragraphs.length]?.tagName.toLowerCase() === "steps"
  ) {
    const contextWrapper = xmlDoc.createElement("context");

    paragraphs.forEach((p) => contextWrapper.appendChild(p));
    taskBody.insertBefore(contextWrapper, taskBody.firstChild);
  } else {
    console.warn("No <p> tags found before an <ol> tag or <ol> not found.");
  }

  const serializer = new XMLSerializer();
  const modifiedXmlContent = serializer.serializeToString(xmlDoc);

  return modifiedXmlContent;
}



function verbChecker(xmlDoc) {
  const bodyElement = xmlDoc.getElementsByTagName("body")[0];

  if (bodyElement && bodyElement.childNodes.length > 0) {
    for (let i = 0; i < bodyElement.childNodes.length; i++) {
      const node = bodyElement.childNodes[i];
      if (node.nodeType === 1) {
        const tagName = node.tagName;

        if (tagName === "ol") {
          const liElements = node.getElementsByTagName("li");

          const liArray = Array.from(liElements);

          for (let li of liArray) {
            const liText = li.textContent.trim();
            const firstWord = liText.split(/\s+/)[0];

            const doc = nlp(firstWord);
            const isVerb = doc.verbs().out("array").length > 0;

            if (isVerb) {
              return true;
            }
          }

          return false;
        }

        break;
      }
    }
  } else {
    console.log("No child elements found in the body.");
  }
}

module.exports = dtdTask;


