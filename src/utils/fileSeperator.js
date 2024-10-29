const generateRandomId = require("./generateRandomId")

function generateDITAMap(topics, ditaMapFilename) {
  const randomId = generateRandomId();
  let ditaMapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE map PUBLIC "-//OASIS//DTD DITA Map//EN" "map.dtd">\n<map id="${randomId}" xml:lang="en-us">\n`;

  topics.reverse().forEach((topic, index) => {

    ditaMapContent += `<topicref  href="./${topic.title}.dita" />\n`;
  });

  ditaMapContent += `</map>`;
  return ditaMapContent;
}

function fileSeparator(xmlString) {
  const topics = [];
  let index = xmlString.lastIndexOf("<topic id=");

  while (index !== -1) {
    const endTopicIndex = xmlString.indexOf("</topic>", index) + "</topic>".length;
    let topicContent = xmlString.substring(index, endTopicIndex);
    topics.push({
      content: topicContent,
      title: extractTitle(topicContent).title,
      level: extractTitle(topicContent).outputclass.split("h")[1],
    });

    xmlString = xmlString.substring(0, index) + xmlString.substring(endTopicIndex);
    index = xmlString.lastIndexOf("<topic id=");
  }

  const lastTopic = topics[topics.length - 1];
  const modifiedTitle = lastTopic.title.replace(/\s/g, '_');

  const ditaMapFilename = `${modifiedTitle}.ditamap`;

  const ditaMapContent = generateDITAMap(topics, ditaMapFilename);

  return { topics, ditaMapFilename, ditaMapContent };
}

function extractTitle(topic) {
  const titleStartIndex = topic.indexOf("<title");
  const titleEndIndex = topic.indexOf("</title>", titleStartIndex);
  const titleContent = topic.substring(

    titleStartIndex,
    titleEndIndex + "</title>".length

  );

  const titleText = titleContent.replace(/<\/?[^>]+(>|$)/g, "");

  const outputclassMatch = titleContent.match(/outputclass="([^"]+)"/);
  const outputclass = outputclassMatch ? outputclassMatch[1] : "";

  return { title: titleText.trim(), outputclass: outputclass };
}



module.exports = fileSeparator;