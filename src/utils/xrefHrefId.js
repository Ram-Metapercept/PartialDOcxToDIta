const xml2js = require('xml2js');
const {addXrefJsonData } = require('./StateManagement');

function XrefHrefIds(xmlData) {
    const parser = new xml2js.Parser();
    parser.parseString(xmlData, (err, result) => {
        if (err) {
            console.error('Error parsing XML:', err);
            return;
        }
        const xrefIds = [];
        const regex1 = /<xref\s+href="([^"]+)"/g; 
        const content = xmlData.toString(); 
        let match1;
        while ((match1 = regex1.exec(content)) !== null) {
            const hrefValue = match1[1];
            if (hrefValue && !hrefValue.startsWith('http://') && !hrefValue.startsWith('https://')) {
                xrefIds.push(hrefValue);
            }
        }
        xrefIds.forEach(array => {
            addXrefJsonData(array?.replace(/^#/, ''))
        });
    });
  
}
module.exports = XrefHrefIds;
