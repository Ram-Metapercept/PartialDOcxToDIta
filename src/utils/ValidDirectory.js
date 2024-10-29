const fs = require("fs").promises;

async function isValidDirectory(folderPath) {
  try {
    await fs.access(folderPath);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = isValidDirectory;
