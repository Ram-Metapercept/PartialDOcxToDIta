const fs = require("fs");
const path = require("path");

async function fileValidator(folderPath) {
  try {
    const files = await fs.promises.readdir(folderPath);
    let mdCounter = 0;
    let otherCounter = 0;

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        const { mdCounter: mdCount, otherCounter: subOtherCount } =
          await fileValidator(filePath);
        mdCounter += mdCount;
        otherCounter += subOtherCount;
      } else if (stats.isFile() && /\.(md|mdx)$/i.test(file)) {
        mdCounter++;
      } else {
        otherCounter++;
      }
    }

    return { mdCounter, otherCounter };
  } catch (error) {
    console.error("Error occurred:", error);
    throw error;
  }
}

module.exports = fileValidator;
