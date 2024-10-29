const { DOMParser, XMLSerializer } = require("xmldom");
// ----------------------------------------- complete working code -----------------------------------------
function NestinTopicTag(xmlString) {
 
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
    const body = xmlDoc.getElementsByTagName("body")[0];
    const topics = body.getElementsByTagName("topic");
  
    for (let i = 0; i < topics.length; i++) {
      const title = topics[i].getElementsByTagName("title")[0];
      if (title) {
        const outputclass = title.getAttribute("outputclass");
        if (outputclass === "h1") {
          let currentTopic = topics[i];
          let nextSibling = currentTopic.nextSibling;
          let subTopics = [];
  
        
          while (nextSibling && nextSibling.nodeName === "topic") {
            const subTitle = nextSibling.getElementsByTagName("title")[0];
            if (subTitle) {
              const subOutputclass = subTitle.getAttribute("outputclass");
              if (
                subOutputclass === "h2" ||
                subOutputclass === "h3" ||
                subOutputclass === "h4" ||
                subOutputclass === "h5" || 
                subOutputclass === "h6"
              ) {
                
                subTopics.push(nextSibling);
              } else {
                break; 
              }
            } else {
              break; 
            }

            nextSibling = nextSibling.nextSibling;
          }
  
          if (subTopics.length > 0) {
            const h1Topic = topics[i];
            for (const subTopic of subTopics) {
              h1Topic.appendChild(subTopic);
            }
          }
        } else if (outputclass === "h2" || outputclass === "h3" || outputclass === "h4" || outputclass === "h5" || outputclass === "h6") {
          let currentTopic = topics[i];
          let nextSibling = currentTopic.nextSibling;
          let subTopics = [];
  
       
          while (nextSibling && nextSibling.nodeName === "topic") {
            const subTitle = nextSibling.getElementsByTagName("title")[0];
            if (subTitle) {
              const subOutputclass = subTitle.getAttribute("outputclass");
              if (
                (outputclass === "h2" && subOutputclass === "h3") ||
                (outputclass === "h3" && (subOutputclass === "h4" || subOutputclass === "h5" || subOutputclass === "h6")) ||
                (outputclass === "h4" && (subOutputclass === "h5" || subOutputclass === "h6")) ||
                (outputclass === "h5" && subOutputclass === "h6")
              ) {
              
                subTopics.push(nextSibling);
              } else {
                break; 
              }
            } else {
              break;
            }

            nextSibling = nextSibling.nextSibling;
          }
  
          if (subTopics.length > 0) {
            const currentTopic = topics[i];
            for (const subTopic of subTopics) {
              currentTopic.appendChild(subTopic);
            }
          }
        }
      }
    }
    const serializer = new XMLSerializer();
    const modifiedXmlString = serializer.serializeToString(xmlDoc);
  
    return modifiedXmlString;
  }


module.exports = NestinTopicTag;

