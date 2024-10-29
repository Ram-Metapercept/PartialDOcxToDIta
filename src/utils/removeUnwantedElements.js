
const { schema } = require("../schema");
const validateURL = require("./validateURL");
const { getHtmlDatabase, getDitaDatabase, addMissingTags, addHandledTags } = require("../utils/StateManagement.js");

function getColumnIndex(json) {
  let currentIndex = 1;
  let currentEntry = json;

  while (currentEntry.previousSibling) {
    currentEntry = currentEntry.previousSibling;
    if (currentEntry.tagName === "entry" && !currentEntry.attributes?.colspan) {
      currentIndex++;
    }
  }

  return currentIndex;
}






let htmlTagCollection = getHtmlDatabase();
let ditaTagCollection = getDitaDatabase();

function getHtmlTag(tagKey) {
  for (const tag of htmlTagCollection) {
    if (tag.key === tagKey) {
      return tag.value;
    }
  }
  return null;
}

async function getDitaTag(tagKey) {
  for (const tag of ditaTagCollection) {
    if (tag.key === tagKey) {
      return tag.value;
    }
  }
  return null;
}

async function removeUnwantedElements(json, parentDetails, parentDivClass) {
  if (typeof json === "object" && json !== null) {
    const type = json.type;
    let currentDivClass, isTagHandled = false;

    switch (type) {
      case getHtmlTag("html_link"):
        isTagHandled = true;
        json.type = "";
        delete json.attributes;
        break;
      case getHtmlTag("html_ol"):
        isTagHandled = true;
        if (json.attributes?.id === "breadcrumbs") {
          json.type = "";
          delete json.content;
          delete json.attributes;
        }
        break;
      case getHtmlTag("html_p"):
        isTagHandled = true;
        if (json.content !== undefined) {
          if (parentDetails.type === "p") {
            json.attributes = parentDetails.attributes
              ? { ...parentDetails.attributes }
              : {};
            json.attributes.class =
              (json.attributes.class || "") + ` ${parentDivClass}`;
            json.attributes.class = json.attributes.class.trim();
            parentDetails.type = "";
            delete parentDetails.attributes;
          }
          if (parentDivClass) {
            json.attributes = {};
            json.attributes.class =
              (json.attributes?.class || "") + ` ${parentDivClass}`;
            json.attributes.class = json.attributes.class.trim();
          }
        }
        break;
      case getHtmlTag("html_div"):
        isTagHandled = true;
        currentDivClass = json.attributes?.class
          ? json.attributes.class
          : parentDivClass;
        if (json.attributes?.id === "footer") {
          json.type = "";
          delete json.content;
          delete json.attributes;
        } else if (json.attributes?.id === "open-api-spec" || json.attributes?.class === "greybox" || json.attributes?.class === "page-metadata") {
          json.type = await getDitaTag(getHtmlTag("html_div"));
        } else if (schema.noteType.includes(json.attributes?.class)) {
          let mainContent = json.content[1].content;
          delete json.content;
          json.content = mainContent;
          json.type = "note";
          json.attributes["type"] = json.attributes.class;
          delete json.attributes["class"];
        } else {
          json.type = "";
          delete json.attributes;
        }
        break;
      case getHtmlTag("html_html"):
        isTagHandled = true;
        json.type = await getDitaTag(getHtmlTag("html_html"));
        break;
      case getHtmlTag("html_alttitle"):
        isTagHandled = true;
        json.type = "titlealts";
        break;
      case getHtmlTag("html_h1"):
      case getHtmlTag("html_h2"):
      case getHtmlTag("html_h3"):
      case getHtmlTag("html_h4"):
      case getHtmlTag("html_h5"):
      case getHtmlTag("html_h6"):
        isTagHandled = true;
        json.type = await getDitaTag(type);
        json.attributes = json.attributes || {};
        json.attributes.class = "- topic/title ";
        json.attributes.outputclass = type.slice(-2);
        break;
      case getHtmlTag("html_a"):
        isTagHandled = true;
        json.type = await getDitaTag(getHtmlTag("html_a"));
        const attra = json.attributes;
        if (attra.target == "_blank") {
          delete attra["target"];
        }
        if (attra["data-linktype"]) {
          attra["scope"] = attra["data-linktype"];
        } else if (validateURL(json.attributes.href)) {
          attra["scope"] = "external";
          attra["format"] = "html";
        }
        delete attra["data-linktype"];
        break;
      case getHtmlTag("html_strong"):
      case getHtmlTag("html_code"):
      case getHtmlTag("html_em"):
      case getHtmlTag("html_mark"):
      case getHtmlTag("html_blockquote"):
        isTagHandled = true;
        json.type = await getDitaTag(type);
        break;
      case getHtmlTag("html_colgroup"):
      case getHtmlTag("html_col"):
      case getHtmlTag("html_tr"):
      case getHtmlTag("html_th"):
        isTagHandled = true;
        json.type = await getDitaTag(type);
        if (json.attributes) {
          delete json.attributes.style;
        }
        break;

      case getHtmlTag("html_col"):
        isTagHandled = true;
        json.type = await getDitaTag(getHtmlTag("html_col"));
        break;
      case await getHtmlTag("html_s"):
        isTagHandled = true;
        json.type = await getDitaTag(getHtmlTag("html_s"));
        break;
      case getHtmlTag("html_tr"):
        isTagHandled = true;
        json.type = await getDitaTag(getHtmlTag("html_tr"));
        break;

      case getHtmlTag("html_td"):
        isTagHandled = true;
        delete json.attributes?.style;
        const colspanValue = json.attributes?.colspan;
        const rowspanValue = json?.attributes?.rowspan;
        if (colspanValue && colspanValue !== "1") {
          const currentIndex = getColumnIndex(json);

          const nameStart = `c${currentIndex}`;
          const nameEnd = `c${currentIndex + parseInt(colspanValue) - 1}`;
   
          json.attributes.namest = nameStart;
          json.attributes.nameend = nameEnd;
          if (json.attributes?.namest === json.attributes?.nameend) {
            delete json.attributes?.namest;
            delete json.attributes?.nameend;
          }
          delete json.attributes.colspan;
        }
        if (rowspanValue) {
          json.attributes.morerows = rowspanValue > 1 ? (rowspanValue - 1).toString() : rowspanValue;;
    
          delete json.attributes.rowspan;
        }

        json.type = await getDitaTag(getHtmlTag("html_td"));
        break;


     
  
      case "colgroup":
        isTagHandled = true;
        json.type = "tgroup";
        break;
      case getHtmlTag("html_img"):
        isTagHandled = true;
        json.type = await getDitaTag(getHtmlTag("html_img"));
        let attr = json.attributes;

        attr["href"] = attr["src"];
        delete attr["src"];
        delete attr["alt"];
        break;

      case "dl":
        isTagHandled = true;
        const dlEntries = [];
        for (let i = 0; i < json.content.length; i++) {
          const item = json.content[i];
          if (item.type === "dt") {
            const dlEntry = {
              type: "dlentry",
              content: [
                {
                  type: "dt",
                  content: [item.content[0]],
                },
              ],
            };
            dlEntries.push(dlEntry);
          } else if (item.type === "dd") {
            const lastEntry = dlEntries[dlEntries.length - 1];
            lastEntry.content.push({
              type: "dd",
              content: [item.content[0]],
            });
          }
        }
        json = { type: "dl", content: dlEntries };
        break;
      default:
        break;
    }
    if (!schema[type] && !isTagHandled) {
      addMissingTags(type, true)
    } else {

      addHandledTags(type, true);
    }
    if (schema[json.type]) {
      if (Array.isArray(json.content)) {
        json.content = await Promise.all(json.content.map((ele) =>
          removeUnwantedElements(ele, json.type ? json : parentDetails, currentDivClass)
        ));
      }
    } else if (Array.isArray(json.content)) {
      json.type = "";
      delete json.attributes;
      json.content = await Promise.all(json.content.map((ele) =>
        removeUnwantedElements(ele, json.type ? json : parentDetails, currentDivClass)
      ));
    } else if (!json.content) {
      json.type = "";
      delete json.attributes;
    }
  }
  return json;
}

module.exports = removeUnwantedElements;








