const fs = require("fs").promises; // Use the promises API
const path = require("path");
const cheerio = require("cheerio");

async function outputClassAdder(directory) {
  try {
    const files = await fs.readdir(directory); // Now this is correct
    const ditamapFile = files.find((file) => file.endsWith(".ditamap"));

    if (!ditamapFile) {
      console.log("No .ditamap file found.");
      return;
    }

    const filePath = path.join(directory, ditamapFile);
    const content = await fs.readFile(filePath, "utf8"); // Awaited properly

    const $ = cheerio.load(content, { xmlMode: true });

    function addOutputClass(element, level) {
      $(element).attr("outputclass", level);

      $(element)
        .children("topicref")
        .each(function () {
  
          addOutputClass(this, level + 1);
        });
    }

    $("map>topicref").each(function () {
      
      addOutputClass(this, 1);
    });

    const updatedContent = $.xml().replace(/^\s*\n/gm, "");

    await fs.writeFile(filePath, updatedContent, "utf8"); // Awaited properly
  } catch (error) {
    console.error("Error processing .ditamap file:", error);
  }
}

module.exports = outputClassAdder;