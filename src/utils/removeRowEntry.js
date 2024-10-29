
const { DOMParser, XMLSerializer } = require("xmldom");
function removeXrefFromRowEntry(inputXML) {

    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(inputXML, "text/xml");

    var rows = xmlDoc.getElementsByTagName('row');

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];

        var entries = row.getElementsByTagName('entry');

        for (var j = 0; j < entries.length; j++) {
            var entry = entries[j];

            var xrefs = entry.getElementsByTagName('xref');

            for (var k = 0; k < xrefs.length; k++) {
                var xref = xrefs[k];
                xref.parentNode.removeChild(xref);
            }
        }
    }

    var serializer = new XMLSerializer();
    var modifiedXML = serializer.serializeToString(xmlDoc);
    return modifiedXML;
}


module.exports=removeXrefFromRowEntry