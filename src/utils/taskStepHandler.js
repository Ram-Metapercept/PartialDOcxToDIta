const { HTMLToJSON } = require("html-to-json-parser");
const { JSONToHTML } = require("html-to-json-parser");
const taskListFixerJson = require("./taskListFixer");

async function taskStepHandler(dtdTaskResult) {
  let data = await dtdTaskResult;

  let result = await HTMLToJSON(data.content, false);

  if (Array.isArray(result)) {
    result.forEach((ele) => {
      if (ele.type === "body" && Array.isArray(ele.content)) {
        ele.content.forEach((bodyEle, indx) => {
          if (
            typeof bodyEle === "string" &&
            bodyEle.trim() !== "\n" &&
            bodyEle.trim() !== "\n\n" &&
            bodyEle.trim() !== ""
          ) {
            ele.content[indx] = {
              type: "p",
              content: [bodyEle],
            };
          }
        });
      }
    });
  }

  let responseTaskList = taskListFixerJson(result, {}, "");

  let htmlRes = await JSONToHTML(responseTaskList);

  return htmlRes;
}

module.exports = taskStepHandler;