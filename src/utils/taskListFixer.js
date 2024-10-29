const { schema } = require("../schema");

const processContent = (contentArray) => {
  return contentArray.map((item) => {
    if (typeof item === "object") {
      if (item.type === "steps") {
        item.type = "ul";
        item.content.forEach((step) => {
          if (typeof step === "object") {
            step.type = "li";
            step.content = [...step.content[0].content];
          }
        });
      } else if (item.type === "step") {
        item.type = "li";
        item.content = [...item.content[0].content];
      }
    }
    return item;
  });
};

function taskListFixerJson(
  json ,
  parentDetails /*details of immediate parent of any tag*/,
  parentDivClass
) {
  if (typeof json === "object" && json !== null) {
    const type = json.type;

    let currentDivClass;

    // replace or remove switch case based on schema and custom condition as per project requirements
    switch (type) {
      case "cmd":
        json?.content?.map((cmdEle) => {
          if (typeof cmdEle === "object") {
            if (cmdEle.type === "ol" || cmdEle.type === "ul") {
              cmdEle.type = "substeps";
              cmdEle.content.map((innEle) => {
                innEle.type = "substep";
              });
            }
          }

          if (cmdEle.type === "pre") {
            cmdEle.type = "codeph";
          }
        });
        json.content = json.content
          .map((cmdEle) => {
            if (
              typeof cmdEle === "object" &&
              cmdEle.type === "p" &&
              Array.isArray(cmdEle.content) &&
              cmdEle.content.length > 0 &&
              cmdEle.content[0]?.type === "xref"
            ) {
              return cmdEle.content[0];
            } else {
              return cmdEle;
            }
          })
          .filter(Boolean);

        json.content.map((ele) => {
          if (typeof ele === "object" && ele.type === "steps") {
            ele.type = "substeps";
            ele.content.map((inStep) => {
              if (typeof inStep === "object" && inStep.type === "step") {
                inStep.type = "substep";
              }
            });
          }
        });

        break;

      case "postreq":
        json?.content?.forEach((ele) => {
          if (ele.type === "ol" || ele.type === "ul") {
            ele.type = "div";
            ele.content = ele.content.map((subEle) => {
              if (subEle.type === "step") {
                subEle.type = "li";
                subEle.content = [...subEle.content[0].content];

                subEle.content = processContent(subEle.content);
              }
              return subEle;
            });
          }

          if (ele.type === "steps") {
            ele.type = "ul";
            ele.content.forEach((step) => {
              if (typeof step === "object") {
                step.type = "li";
                step.content = [...step.content[0].content];
              }
            });
          }
        });
        break;

      default:
        break;
    }

    if (schema[json.type]) {
      if (Array.isArray(json.content)) {
        json.content = json.content.map((ele) =>
          taskListFixerJson(
            ele,
            json.type ? json : parentDetails,
            currentDivClass
          )
        );
      } else if (Array.isArray(json.content)) {
        json.type = "";
        delete json.attributes;
        json.content.map((ele) =>
          taskListFixerJson(
            ele,
            json.type ? json : parentDetails,
            currentDivClass
          )
        );
      }
      return json;
    } else if (Array.isArray(json.content)) {
      json.type = "";
      delete json.attributes;
      json.content.map((ele) =>
        taskListFixerJson(
          ele,
          json.type ? json : parentDetails,
          currentDivClass
        )
      );
    } else if (!json.content) {
      json.type = "";
      delete json.attributes;
      return json;
    }
  }
  return json;
}

module.exports = taskListFixerJson;