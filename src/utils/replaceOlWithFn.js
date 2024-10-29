
const { DOMParser, XMLSerializer } = require('xmldom');


function replaceOlLi(xmlString) {

    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, "text/xml");


    let liElements = xmlDoc.getElementsByTagName("li");

    let groupedLiElements = {};

    for (let i = 0; i < liElements.length; i++) {
        let li = liElements[i];
        let id = li.getAttribute("id");

        if (id && (id.startsWith("footnote") || id.startsWith("endnote"))) {
  
            let groupName = id

            if (!groupedLiElements[groupName]) {
                groupedLiElements[groupName] = [];
            }

            groupedLiElements[groupName].push(li);
        }
    }

    for (let groupName in groupedLiElements) {
        if (groupedLiElements.hasOwnProperty(groupName)) {

            let p = xmlDoc.createElement("p");

            let fn = xmlDoc.createElement("fn");
            fn.setAttribute("id", groupName); 

            groupedLiElements[groupName].forEach(function (li) {
                while (li.firstChild) {
                    fn.appendChild(li.firstChild);
                }
            });

            p.appendChild(fn);

            let parentOl = groupedLiElements[groupName][0].parentNode.parentNode;

            parentOl.parentNode.replaceChild(p, parentOl);
        }
    }

    let serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
}
module.exports=replaceOlLi