const { DOMParser, XMLSerializer } = require('xmldom');

function moveTgroupClosingTagBeforeTable(inputXML) {

   
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(inputXML, "text/xml");

    var tables = xmlDoc.getElementsByTagName('table');

    for (var i = 0; i < tables.length; i++) {
        var table = tables[i];

        var tgroup = table.getElementsByTagName('tgroup')[0];
        if (tgroup) {
        let  newTgroup=tgroup
 
            let item=tgroup.getAttribute('cols')
         
            for (var j = 0; j < item; j++) {
                var colspec = xmlDoc.createElement('colspec');
                colspec.setAttribute('colname', 'c' + (j + 1));
                newTgroup.appendChild(colspec);
            }
          
            
            var tbody = table.getElementsByTagName('tbody')[0];
            var thead = table.getElementsByTagName('thead')[0];
            if(thead){
                table.insertBefore(newTgroup, thead);
                newTgroup.appendChild(thead);        
            }
            table.insertBefore(newTgroup, tbody);

            newTgroup.appendChild(tbody);
        }
    }

    var serializer = new XMLSerializer();
    var modifiedXML = serializer.serializeToString(xmlDoc);
    return modifiedXML;
}
module.exports = moveTgroupClosingTagBeforeTable;
