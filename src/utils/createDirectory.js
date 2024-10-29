const fs = require("fs");
const path = require("path");

function createDirectory(directory) {
  if (!fs.existsSync(directory)) {
    createDirectory(path.dirname(directory)); 
    fs.mkdirSync(directory); 
  }
}

module.exports = createDirectory;
