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
function modifyPath(inputPath) {
  // Split the path into segments
  let segments = inputPath.split('\\');

  // Remove the second last segment
  if (segments.length > 1) {
    segments.splice(-2, 1);
  }

  // Join the segments back into a path
  let modifiedPath = segments.join('\\');

  // Remove the .dita extension if it exists
  modifiedPath = modifiedPath.replace('.dita', '');

  return modifiedPath;
}

async function generateUniqueFileName(directory, baseName, ext) {
  let counter = 0;
  let newFileName = `${baseName}${ext}`;
 
  let newFilePath = newFileName.replace(".dita","")

//   newFilePath = modifyPath(newFilePath)
  while (await fileExists(newFileName)) {
    counter++;
    newFileName = `${baseName}_${counter}${ext}`;
    
    newFilePath = path.join(directory, newFileName);
  }

  return newFilePath;
}
function removeLastTwoParts(path) {
  // Split the path by '/' into an array
  const parts = path.split('/');

  // Remove the last two parts
  const newParts = parts.slice(0, -2);

  // Join the remaining parts with '/' and return
  return newParts.join('/');
}
function removeLastParts(path) {
    // Split the path by '/' into an array
    const parts = path.split('/');
  
    // Remove the last two parts
    const newParts = parts.slice(0, -1);
  
    // Join the remaining parts with '/' and return
    return newParts.join('/');
  }
function removeFirstTwoSegment(path) {
  const parts = path.split(/[\\/]/);
  // Remove the first two segments
  const remainingParts = parts.slice(2);
  // Return the last segment of the remaining parts
  return remainingParts.join("/");
}
function removeFirstSegment(path) {
  const parts = path.split(/[\\/]/);
  // Remove the first two segments
  const remainingParts = parts.slice(2);
  // Return the last segment of the remaining parts
  return remainingParts.join("/");
}
async function processDitamap(filePath, targetOutputclass, directory) {
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


      const outputclass = parseInt(topicref.attr("outputclass"));
  

      if (
        outputclass === targetOutputclass &&
        hasMoreThanTwoNestedTopicrefs(topicref)
      ) {

        // let href = topicref.attr("href");
        //  href =  href.split("/")[href.split("/").length - 1]

        //  href=href.join("/").replace(".dita","")

        let href = topicref.attr("href");
        const navtitle = topicref.attr("navtitle");

        // const baseName = path.basename(href, path.extname(href));

         let newFilePath = `${removeLastParts(href)}.ditamap`

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
          `<mapref href="${removeFirstTwoSegment(newFilePath).replaceAll("\\", "/")
          }" navtitle="${navtitle}" format="ditamap"/>`
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

async function childDitamapRecursiveProcess3(directory, targetOutputclass) {
  try {
    const files = await fs.readdir(directory);

    const processPromises = files.map(async (file) => {
      const filePath = path.join(directory, file);

      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        return childDitamapRecursiveProcess3(filePath, targetOutputclass);
      } else if (path.extname(file) === ".ditamap") {
        return processDitamap(filePath, targetOutputclass, directory);
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

module.exports = childDitamapRecursiveProcess3;













