
function extractHTML(htmlString) {

  const startIndex = htmlString.indexOf("<html");
  const endIndex = htmlString.lastIndexOf("</html>") + "</html>".length;

  const extractedHTML = htmlString.substring(startIndex, endIndex);
  return extractedHTML;
}

module.exports = extractHTML;
