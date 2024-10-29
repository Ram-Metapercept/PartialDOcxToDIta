
const { DOMParser, XMLSerializer } = require('xmldom');


function moveInfoContentOutSideCMd(xmlString) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlString, "text/xml");

    var cmdElements = xmlDoc.getElementsByTagName("cmd");

    var serializer = new XMLSerializer();
    
    for (var i = 0; i < cmdElements.length; i++) {
        var cmdElement = cmdElements[i];
        
        var infoElements = cmdElement.getElementsByTagName("info");
        
        if (infoElements.length > 0) {
            var infoElement = infoElements[0];

            var newParent = cmdElement.parentNode;

            newParent.insertBefore(infoElement, cmdElement.nextSibling);
        }
    }
    return serializer.serializeToString(xmlDoc);
}


module.exports=moveInfoContentOutSideCMd















// const { DOMParser, XMLSerializer } = require('xmldom');

// function moveContextContentOutSideCmd(xmlString) {
//     var parser = new DOMParser();
//     var xmlDoc = parser.parseFromString(xmlString, "text/xml");

//     var cmdElements = xmlDoc.getElementsByTagName("cmd");

//     var serializer = new XMLSerializer();
    
//     for (var i = 0; i < cmdElements.length; i++) {
//         var cmdElement = cmdElements[i];
        
//         // Get the context element inside the cmd tag
//         var contextElements = cmdElement.getElementsByTagName("context");
        
//         if (contextElements.length > 0) {
//             var contextElement = contextElements[0];

//             // Create the new info element and append the context element
//             var infoElement = xmlDoc.createElement("info");
//             infoElement.appendChild(contextElement);

//             // Move info outside the cmd tag
//             var newParent = cmdElement.parentNode;
//             newParent.insertBefore(infoElement, cmdElement.nextSibling);
//         }
//     }
//     return serializer.serializeToString(xmlDoc);
// }



// module.exports = moveContextContentOutSideCmd;












// const { DOMParser, XMLSerializer } = require('xmldom');

// function moveInfoTagOutsideCmd(xmlString) {
//     var parser = new DOMParser();
//     var xmlDoc = parser.parseFromString(xmlString, "text/xml");

//     var cmdElements = xmlDoc.getElementsByTagName("cmd");

//     var serializer = new XMLSerializer();

//     for (var i = 0; i < cmdElements.length; i++) {
//         var cmdElement = cmdElements[i];
        
//         // Get the info element inside the cmd tag
//         var infoElements = cmdElement.getElementsByTagName("info");

//         if (infoElements.length > 0) {
//             var infoElement = infoElements[0];

//             // Move info outside the cmd tag
//             var newParent = cmdElement.parentNode;
//             newParent.insertBefore(infoElement, cmdElement.nextSibling);
//         }
//     }

//     return serializer.serializeToString(xmlDoc);
// }

// module.exports = moveInfoTagOutsideCmd;
