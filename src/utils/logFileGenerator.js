const fs = require("fs");

function logFileGenerator(logData, outputDirName) {
  const logContent = `***************************************************
***************************************************
Unandled Tags:
***************************************************
${Object.keys(logData.missingTags).join("\n")}
  
Handled Tags:
***************************************************
${Object.keys(logData.handledTags).join("\n")}

***************************************************
Skipped Files:
***************************************************
${logData.skippedFiles.join("\n")}
`;

  fs.writeFileSync(`${outputDirName}/log.txt`, logContent);
}

module.exports = logFileGenerator;
