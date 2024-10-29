const fs = require("fs").promises;
const cheerio = require("cheerio");
const path = require("path");


async function fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  async function generateUniqueFileName(directory, baseName, ext) {
    let counter = 0;
    let newFileName = `${baseName}${ext}`;
    let newFilePath = path.join(directory, newFileName);
  
    while (await fileExists(newFilePath)) {
      counter++;
      newFileName = `${baseName}_${counter}${ext}`;
      newFilePath = path.join(directory, newFileName);
    }
  
    return newFilePath;
  }
  
  async function processDitamap(filePath, targetOutputclass,directory) {
    try {
      const data = await fs.readFile(filePath, "utf-8");

      const $ = cheerio.load(data, { xmlMode: true });
  
      let changesMade = false;
  
      function hasMoreThanTwoNestedTopicrefs(element) {
        return $(element).children("topicref").length >= 1;
      }
  
      const topicrefs = $("topicref").toArray();
      for (const element of topicrefs) {
        const topicref = $(element);
        // console.log(topicref.toString())

        const outputclass = parseInt(topicref.attr("outputclass"));

        if (
          outputclass === targetOutputclass &&
          hasMoreThanTwoNestedTopicrefs(topicref)
        ) {
         
          const href = topicref.attr("href");
          const navtitle = topicref.attr("navtitle");

          const baseName = path.basename(href, path.extname(href));

          const newFilePath = await generateUniqueFileName(
            directory,
            baseName,
            ".ditamap"
          );
 

          let newFileContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
          newFileContent +=
            '<!DOCTYPE map PUBLIC "-//OASIS//DTD DITA Map//EN" "map.dtd">\n';
          newFileContent += "<map>\n";
          newFileContent += `  <title>${navtitle}</title>\n`;
          newFileContent += $.html(topicref) + "\n";
          newFileContent += "</map>";
  
          try {
            await fs.writeFile(newFilePath, newFileContent, "utf-8");
          } catch (writeError) {
            console.log(
              "\x1b[31m%s\x1b[0m",
              `Error writing file ${newFilePath}:`,
              writeError
            );
            return;
          }
  
          changesMade = true;
  
          topicref.replaceWith(
            `<mapref href="${path.basename(
              newFilePath
            )}" navtitle="${navtitle}" format="ditamap"/>`
          );
        }
      }
  
      if (changesMade) {
        try {
          await fs.writeFile(filePath, $.xml(), "utf-8");
        } catch (writeError) {
          console.log(
            "\x1b[31m%s\x1b[0m",
            `Error writing file ${filePath}:`,
            writeError
          );
        }
      }
    } catch (error) {
      console.log(
        "\x1b[31m%s\x1b[0m",
        `Error processing file ${filePath}:`,
        error
      );
    }
  }
  
  async function childDitamapRecursiveProcess(directory, targetOutputclass) {
    try {
      const files = await fs.readdir(directory);

      const processPromises = files.map(async (file) => {
        const filePath = path.join(directory, file);
   
        const stats = await fs.stat(filePath);
  
        if (stats.isDirectory()) {
          return childDitamapRecursiveProcess(filePath, targetOutputclass);
        } else if (path.extname(file) === ".ditamap") {
          return processDitamap(filePath, targetOutputclass,directory);
        }
      });
  
      await Promise.all(processPromises); // Concurrently process files
    } catch (error) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        `Error reading directory ${directory}:`,
        error
      );
    }
  }
  
  module.exports = childDitamapRecursiveProcess;













