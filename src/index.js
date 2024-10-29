const path = require("path");
const mammoth = require("mammoth")
const fs = require("fs")
const { HTMLToJSON, JSONToHTML } = require("html-to-json-parser");
const cheerio = require("cheerio");
const moveNontListElementToOl = require("./utils/movingNonListItemsinOlTag.js")
const movePandNoteTagInsideLi = require("./utils/movePTagInsideLi.js")
const addRandomIdToTopics = require("./utils/addRandomGeneratedId.js")
const moveTitleAboveBody = require("./utils/moveTitleAboveBody.js");
const moveTgroupClosingTagBeforeTable = require("./utils/moveTgroupClosingTagBeforeTable.js");
const characterToEntity = require("./utils/characterToEntity.js");
const removeUnwantedElements = require("./utils/removeUnwantedElements.js");
const extractHTML = require("./utils/extractHTML.js");
const addTopicTag = require("./utils/addTopicTag.js");
const NestinTopicTag = require("./utils/nestingTopicTag.js")
const attachIdToTitle = require("./utils/attachedIdToTitle.js")
const { converBase64ToImage } = require('convert-base64-to-image');
const fileSeparator = require("./utils/fileSeperator.js");
const tagsValidator = require("./utils/tagValidator.js");
const dtdConcept = require("./utils/dtdConcept.js");
const dtdReference = require("./utils/dtdReference.js");
const dtdTask = require("./utils/dtdTask.js");
const generateRandomId = require("./utils/generateRandomId.js");
const addIdTOFigTag = require("./utils/addIdtoFigTag.js")
const { addData, getLogData, getData, getIsBodyEmpty, resetData, setIsBodyEmpty, getJsonData, getXrefJsonData, setInputFileName, addHtmlDatabase, getHtmlDatabase, addDitaDatabase, getDitaDatabase } = require("./utils/StateManagement.js");
const { removeBoldTag, removeBoldTagFromImage } = require("./utils/RemoveBoldTagFromTitle.js");
const replaceOlWIthFn = require("./utils/replaceOlWithFn.js")
const removeXref = require("./utils/removeRowEntry.js")
const extractXrefIds = require("./utils/extractIds.js")
const XrefHrefIds = require("./utils/xrefHrefId.js")
const addXmlLangAttributes = require("./utils/addXmlLang.js")
const outputDirName = "./output/";
const removeOutputClassHeading = require("./utils/removeOutputClass.js")
const htmlTagModel = require("./models/tag/htmlTagModel.js")
const ditaTagModel = require("./models/tag/ditaTagModel.js")
require("dotenv").config({ path: "./.env" });
const insertTags = require("./utils/TagExtractionUsingCheerio.js");
const logFileGenerator = require("./utils/logFileGenerator.js");
const removeSelfClosingXrefTags = require("./utils/removeSelfClosingXrefTags.js");
const { getAiTagsList } = require("./state/allVariables.js");

const subStepMover = require("./utils/subStepMover.js")
const taskStepHandler = require("./utils/taskStepHandler.js");
const outputClassAdder = require("./utils/outputClassAdder.js");
const createDirectory = require("./utils/createDirectory.js");
const childDitamapRecursiveProcess = require("./utils/childDitamapRecursiveProcess.js");
const childDitamapRecursiveProcess3 = require("./utils/childDitamapRecursiveProcess3.js");
const childDitamapRecursiveProcess4 = require("./utils/childDitamapRecursiveProcess4.js");
async function convertDocxToDita(filePath) {
  const outputId = Math.random().toString(36).substring(7);
  const OutputPath = path.join(outputDirName, outputId);
  try {
    const mammothOptions = {

      styleMap: [
        "p.Title => h1:fresh",
        "p.AltTitle => h2:fresh",
        "p.Quote => blockquote:fresh",
        "p.Hyperlink => a:fresh",
        "p.OrderedList => ol > li:fresh",
        "p.OrderedListitem2 => ol > li > ol > li:fresh",
        "p.OrderedListitem3 => ol > li > ol > li > ol > li:fresh",
        "p.OrderedListitem4 => ol > li > ol > li > ol > li > ol > li:fresh",
        "p.OrderedListitem5 => ol > li > ol > li > ol > li > ol > li > ol > li:fresh",
        "p.OrderedListitem6 => ol > li > ol > li > ol > li > ol > li > ol > li > ol > li:fresh",
        "p.OrderedListitem7 => ol > li > ol > li > ol > li > ol > li > ol > li > ol > li > ol > li:fresh",
        "p.OrderedListitem8 => ol > li > ol > li > ol > li > ol > li > ol > li > ol > li > ol > li > ol > li:fresh",
        'p.NoteStyle => note > p:fresh',
        'p.CautionStyle => note > p:fresh',
        'p.DangerStyle => note > p:fresh'
      ],

    };
    const { value: rawHtml } = await mammoth.convertToHtml(
      { path: filePath },
      {
        ...mammothOptions
      }
    );
    let modifiedAfterToc = rawHtml.replace(/<p>Contents<\/p>(.|[\r\n])*?(<p>.*?<\/p>)/s, '').replace(/<p><a href="#_Toc[\d]+">.*?<\/a><\/p>/g, '');

    const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        ${modifiedAfterToc}
    </body>
    </html>
`;

    const $ = cheerio.load(fullHtml);
    $("table").each((index, element) => {
      let maxCols = 0;
      $(element).find("tr").each((rowIndex, rowElement) => {
        const colsInRow = $(rowElement).find("th, td").length;
        if (colsInRow > maxCols) {
          maxCols = colsInRow;
        }
      });
      $(element).prepend(`<colgroup cols="${maxCols}" />`);
    });
    $('[id], [href]').each(function () {
      let id = $(this).attr('id');
      let href = $(this).attr('href');
      if (id) {
        const cleanedId = id.replace(/[=.]/g, '');
        $(this).attr('id', cleanedId);
      }
      if (href && href.startsWith('#')) {
        const cleanedFragment = href.replace(/[=.]/g, '');
        $(this).attr('href', cleanedFragment);
      }
    });

    $('img').each((index, element) => {
      const src = $(element).attr('src');
      const base64Prefix = 'data:image/';
      if (src.startsWith(base64Prefix)) {
        const mimeType = src.substring(base64Prefix.length, src.indexOf(';'));
        const isPng = mimeType === 'png';
        const isJpeg = mimeType === 'jpeg' || mimeType === 'jpg';

        if (isPng || isJpeg) {

          const extension = isPng ? 'png' : 'jpg';
          const pathToSaveImage = `${OutputPath}/media/image${index}.${extension}`;
          const pathToSaveImagewithMedia = `media/image${index}.${extension}`;
          const path = converBase64ToImage(src, pathToSaveImage);
          $(element).attr('src', pathToSaveImagewithMedia);
        } else {
          console.log(`Image at index ${index} is not a PNG or JPEG: ${mimeType}`);
        }
      }
    });
    await insertTags(modifiedAfterToc);

    const modifiedHtml = $.html();
    const contentWithHmtlAsRootElement = extractHTML(modifiedHtml);
    let footNoteList = [];
    let result = await HTMLToJSON(contentWithHmtlAsRootElement, false);
    function removeNewlines(array) {
      return array.filter((item) => typeof item !== "string" || item !== "\n");
    }
    result.content.map((e) => {
      if (e.type === "body") {
        e.content.map((ele) => {
          if (ele.type === "section") {
            const hehe = removeNewlines(ele.content);
            footNoteList = removeNewlines(hehe[0].content);
          }
        });
      }
    });

    result = await removeUnwantedElements(
      result,
      {},
      "",
    );

    result = characterToEntity(result);
    const footNoteMap = new Map();
    footNoteList.forEach((obj) => {
      footNoteMap.set(obj.attributes.id, obj.content[0].content[0]);
    });


    result.content.forEach((e) => {
      if (e.type === "body") {
        e.content.forEach((ele) => {
          if (ele.type === "p") {
            ele.content.forEach((g) => {
              if (g.content !== undefined) {
                let footId = g.content[0].attributes?.href.split(";")[1];
                const line = footNoteMap.get(footId);
                if (line) {
                  g.type = "fn";
                  g.content = [line];
                  delete g.attributes;
                }
              }
            });
          }
          if (ele.type === "section" && ele.attributes?.class === "footnotes") {
            ele.content = [];
            ele.type = "";
            ele.attributes = {};
          }
        });
      }
    });

    JSONToHTML(result).then(async (res) => {
      try {
        const cleanedUpContent = res.replace(/<\/*>/g, "");
        const cleanedUpJson = await HTMLToJSON(cleanedUpContent, false);

        if (Array.isArray(cleanedUpJson.content)) {
          cleanedUpJson.content.forEach((ele) => {
            if (ele.type === "body" && Array.isArray(ele.content)) {
              ele.content.forEach((bodyEle, indx) => {
                if (
                  typeof bodyEle === "string" &&
                  bodyEle.trim() !== "\n" &&
                  bodyEle.trim() !== "\n\n" &&
                  bodyEle.trim() !== ""
                ) {
                  ele.content[indx] = { type: "p", content: [bodyEle] };
                }
              });
            }
          });
        }

        const modifiedDitaCode = codeRestructure(
          await JSONToHTML(characterToEntity(cleanedUpJson))
        );

        function capitalizeFirstWord(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
        }

        const removedIdFromXrefAttachedToTitle = attachIdToTitle(modifiedDitaCode);
        XrefHrefIds(removedIdFromXrefAttachedToTitle);

        let boldTagdeletion = removeBoldTag(removedIdFromXrefAttachedToTitle);
        let boldTagRemovalFromIMage = removeBoldTagFromImage(boldTagdeletion);
        let transformedFigContent = addIdTOFigTag(boldTagRemovalFromIMage);
        let addedFigTagBeforeImage = moveNontListElementToOl(transformedFigContent);
        let finallyMovedInsideOneTimeLi = movePandNoteTagInsideLi(addedFigTagBeforeImage);
        const cleanedXmlString = finallyMovedInsideOneTimeLi.replace(/<\/ol>\s*<ol>/g, '');
        let MovedNonListItemToOL = moveNontListElementToOl(cleanedXmlString);
        const cleanedLIString = MovedNonListItemToOL.replace(/<\/li>\s*<li[^>]*>\s*<ol>/g, '<ol>');
        let finallyMovedInsideSecondTimeLi = movePandNoteTagInsideLi(cleanedLIString);
        let cleanedOlTagSecondRound = finallyMovedInsideSecondTimeLi.replace(/<\/ol>\s*<ol>/g, '');

        let topicWise = fileSeparator(cleanedOlTagSecondRound);
        let newPath = filePath
          .replace(/\\/g, "/")
          .split("/")
          .slice(1)
          .join("/");
        const newTopicWise = topicWise?.topics?.map((item) => {
          item.level = item.level ?? 1;
          const formatFolderName = (name) => name.replace(/\s+/g, '_');
          const levelFolders = [];
          const formattedTopics = [];

          topicWise.topics.forEach((topic) => {
            const folderName = formatFolderName(topic.title).replace(/'s/g, "_s").toLowerCase();
            if (topic.level <= levelFolders.length) {

              levelFolders.length = topic.level;
            }
            levelFolders[topic.level - 1] = folderName;
            topic.folder = levelFolders.slice(0, topic.level).join('/');
            formattedTopics.push(topic);
          });

          return formattedTopics;
        });
        var topicContent = topicWise.topics[0].content;
        var bodyElement = extractBodyElement(topicContent);

        var isBodyEmpty = bodyElement.trim() === '';

        function extractBodyElement(htmlContent) {
          var start = htmlContent.indexOf('<body>');
          var end = htmlContent.lastIndexOf('</body>');
          if (start === -1 || end === -1) {
            return '';
          }

          var bodyContent = htmlContent.substring(start + 6, end);
          return bodyContent;
        }

        const fileInfo = {};
        fileInfo.nestObj = [];
        let fileNames = {};

        async function processTopics(nameData) {
          for (const tc of nameData) {
            let dtdType = "topic";
            tc.content = await tagsValidator(tc.content);
            try {
              // Check if the content is a concept
              let result = await dtdReference(tc.content);

              if (result.boolValue) {
                dtdType = "reference";
                tc.content = result.content;
              } else {

                const dtdTaskResult = await dtdTask(tc.content);

                if (dtdTaskResult.boolValue) {
                  const object = await taskStepHandler(dtdTaskResult);
                  let res = await subStepMover(object);

                  dtdType = "task";
                  tc.content = res;
                } else {
                  let result = await dtdConcept(tc.content);

                  if (result.boolValue) {
                    dtdType = "concept";
                    tc.content = result.content;
                  }
                }
              }
            } catch (error) {
              console.error("Error processing topic:", error);
            }

            let baseName = tc.title
              .replaceAll(" ", "_")
              .replaceAll("?", "")
              .replaceAll(".", "")
              .replaceAll(":", "")
              .replace(/[^\w\s]/gi, '');

            let uniqueName = baseName + ".docx";

            if (fileNames[baseName]) {
              let count = fileNames[baseName];
              fileNames[baseName] = count + 1;
              uniqueName = baseName + `_${count + 1}.docx`;
            } else {
              fileNames[baseName] = 1;
            }

            if (fileNames[baseName] > 1) {
              uniqueName = baseName + `_${fileNames[baseName] - 1}.docx`;
            } else {
              uniqueName = baseName + ".docx";
            }

            let outputFilePath = "";
            let actualPath = newPath.split("/").slice(0, -1).join("/") + "/" + uniqueName;
            let fileNameLowerCased = uniqueName.toLowerCase();

            if (actualPath.endsWith(".doc")) {
              outputFilePath = `${OutputPath}/${fileNameLowerCased.replace(
                /\.doc$/,
                ".dita"
              )}`;
            } else if (actualPath.endsWith(".docx")) {
              outputFilePath = `${OutputPath}/${fileNameLowerCased.replace(
                /\.docx$/,
                ".dita"
              )}`;
            }
            //------------------------------------------
            outputFilePath = outputFilePath.replace(/\s{1,}/g, '_');

            const outputDir = path.dirname(outputFilePath);
            createDirectory(outputDirName);
            createDirectory(outputDir.toLowerCase());
            const fileNameWithoutExt = path.basename(
              outputFilePath.toLowerCase(),
              ".dita"
            );

            const folderName = fileNameWithoutExt.charAt(0) + fileNameWithoutExt.slice(1);

            //  const newDir = path.join(path.dirname(outputFilePath), folderName)
            const newDir = path.join(path.dirname(outputFilePath), tc.folder);

            if (!fs.existsSync(newDir)) {
              fs.mkdirSync(newDir, { recursive: true });
            }

            let newFilePath = path.join(newDir, folderName + ".dita");
            newFilePath = newFilePath.replace(/\\/g, "/");
            // -------------------------

            fileInfo.nestObj.push({
              level: tc.level,

              path: newFilePath,
              child: []
            });

            const fileContent = `<?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE ${dtdType} PUBLIC "-//OASIS//DTD DITA ${capitalizeFirstWord(dtdType)}//EN" "${dtdType}.dtd">
          ${tc.content}`;
            if (tc.level !== undefined || !isBodyEmpty) {

              fs.writeFileSync(newFilePath, fileContent, {
                encoding: 'utf-8',
              });

            } else if (tc.level == undefined || isBodyEmpty) {
              fs.writeFileSync(newFilePath, fileContent, {
                encoding: 'utf-8',
              });
            }
            await addData(fileInfo);
          }
        }

        await processTopics(newTopicWise[0]);

        let fetchData = await getData();

        await DitaMapMaker(fetchData, topicWise.topics[0].title, OutputPath);
        await outputClassAdder(OutputPath);
        await childDitamapRecursiveProcess(OutputPath, 2);
        await childDitamapRecursiveProcess3(OutputPath, 3);
        // await childDitamapRecursiveProcess4(OutputPath, 4);
        // await childDitamapRecursiveProcess(OutputPath, 5);
        fs.readdir(OutputPath, function (err, files) {
          if (err) {
            return console.error('Unable to scan directory:', err);
          }

          const ditaFiles = files.filter(file => path.extname(file) === '.dita');

          ditaFiles.forEach(file => {
            const OutputPath = path.join(outputDirName, outputId, file);

            extractXrefIds(OutputPath);
            fs.readFile(OutputPath, 'utf8', async (err, content) => {
              if (err) {
                return console.error('Error reading file:', err);
              }

              // let removingOutputClass = removeOutputClassHeading(content);
              let addingXmlLangAttributes = addXmlLangAttributes(content);

              let modifiedContent = addingXmlLangAttributes;

              let XrefrenceHrefId = getXrefJsonData();
              let JsonDataIDTopicId = getJsonData();

              let aDict = {};
              JsonDataIDTopicId.forEach(item => {
                aDict[item.id] = item;
              });

              let matchedDetails = XrefrenceHrefId
                .filter(id => aDict.hasOwnProperty(id))
                .map(id => ({
                  id: id,
                  TopicId: aDict[id].TopicId,
                  FileName: aDict[id].FileName
                }));

              matchedDetails.forEach(item => {
                let lowercasesFileName = item.FileName.toLowerCase();
                const regex = new RegExp(`<xref href="#${item.id}"`, 'g');
                const replacement = `<xref href="./${lowercasesFileName}#${item.TopicId}/${item.id}"`;
                modifiedContent = modifiedContent.replaceAll(regex, replacement);
              });

              const $ = cheerio.load(modifiedContent, { xmlMode: true });

              const prologContent = `
            <prolog base="ai-intent">
              <author>XYZ</author>
              <critdates base="ai-intent">
                <revised base="ai-intent" modified="2024-01-11"></revised>
              </critdates>
              <metadata base="ai-intent">
                <category base="ai-intent">XYZ</category>
              </metadata>
              <metadata base="ai-intent">
                <keywords base="ai-intent">
                  <keyword base="ai-intent">XYZ</keyword>
                </keywords>
              </metadata>
            </prolog>
          `;

              if ($("task").length) {
                if ($("task shortdesc").length) {
                  $("task shortdesc").after(prologContent);
                } else {
                  $("task title").after(prologContent);
                }
              } else {
                $("title").after(prologContent);
              }

              let aiTagList = getAiTagsList();
              aiTagList.forEach((tag) => {
                $(tag).attr("base", "ai-intent");
              });

              $("taskbody").each(function () {
                $(this)
                  .find("cmd")
                  .each(function () {
                    const cmdTag = $(this);
                    cmdTag.find("fig").each(function () {
                      const figTag = $(this);
                      const wrappedFig = $("<p></p>").append(figTag);
                      const infoTag = $("<info></info>").append(wrappedFig);
                      cmdTag.after(infoTag);
                    });
                    cmdTag.find("table").each(function () {
                      const tableTag = $(this);
                      const infoTag = $("<info></info>").append(tableTag);
                      cmdTag.after(infoTag);
                    });
                    const stepsTag = cmdTag.find("steps");
                    if (stepsTag.length > 0) {
                      cmdTag.after(stepsTag);
                      stepsTag.replaceWith(function () {
                        const substeps = $("<substeps></substeps>").append($(this).contents());
                        substeps.find("step").each(function () {
                          $(this).replaceWith(function () {
                            return $("<substep></substep>").append($(this).contents());
                          });
                        });

                        return substeps;
                      });
                    }

                    ["ul", "ol"].forEach((tag) => {
                      const listTags = cmdTag.find(tag);
                      listTags.each(function () {
                        const listTag = $(this);
                        if (!listTag.parents("ul, ol").length) {
                          listTag.wrap("<substeps></substeps>");
                        }

                        listTag.find("step").each(function () {
                          $(this).replaceWith(function () {
                            return $("<substep></substep>").append($(this).contents());
                          });
                        });
                      });
                    });
                  });
              });
              $("substeps").each((_, substepsElem) => {
                $(substepsElem)
                  .find("substep")
                  .each((_, substepElem) => {
                    if ($(substepElem).find("cmd").length === 0) {
                      const content = $(substepElem).html();
                      $(substepElem).html(`<cmd>${content}</cmd>`);
                    }
                  });
              });
              $('topic').each((i, el) => {
                const newConcept = $('<concept>')
                  .attr('id', $(el).attr('id'))
                  .append($(el).children());
                $(el).replaceWith(newConcept);
              });

              $('body').each((i, el) => {
                const newConcept = $('<conbody>')
                  .attr('id', $(el).attr('id'))
                  .append($(el).children());
                $(el).replaceWith(newConcept);
              });
              $('cmd > ul').each((index, element) => {
                const ulElement = $(element).remove();
                const infoTag = $('<info></info>').append(ulElement);
                $(element).parent().append(infoTag);
              });

              let entryTags = $('entry');
              let morerowsCount = 0;
              entryTags.each(function () {
                if ($(this).attr('morerows')) {
                  morerowsCount++;
                }
                else if ($(this).attr('namest')) {
                  let namestVal = parseInt($(this).attr('namest').replace('c', ''));
                  let nameendVal = parseInt($(this).attr('nameend').replace('c', ''));
                  $(this).attr('namest', `c${namestVal + morerowsCount}`);
                  $(this).attr('nameend', `c${nameendVal + morerowsCount}`);
                }
              });

              let finalTagsCleanUp = $.xml();
              // let a = await replaceXmlTags(finalTagsCleanUp);
              fs.writeFile(OutputPath, finalTagsCleanUp, 'utf8', (err) => {
                if (err) {
                  return console.error('Error writing file:', err);
                }
              });
            });
          });
        });
      } catch (error) {
        console.log(error);
      }
    });
    const downloadLink = `http://localhost:5000/api/download/${outputId}`;

    let fileName = path.parse(path.basename(filePath)).name + ".zip";
    setInputFileName(fileName)
    function codeRestructure(xmlString) {
      let newXmlString = moveTitleAboveBody(xmlString);
      let movingTgroupTop = moveTgroupClosingTagBeforeTable(newXmlString);
      let removexrefFromEntry = removeXref(movingTgroupTop);
      let structureTopic = addTopicTag(removexrefFromEntry);
      let addingRandomIdToTopic = addRandomIdToTopics(structureTopic);
      let moveTitle = NestinTopicTag(addingRandomIdToTopic);
      let footnoterelatedOlLI = replaceOlWIthFn(moveTitle)
      let removeSelfXref = removeSelfClosingXrefTags(footnoterelatedOlLI)
      return removeSelfXref
    }

    console.log("Docx to Dita converted succesfully")
    let logData = getLogData()

    logFileGenerator(logData, "./")
    return { downloadLink, outputId }

  } catch (error) {
    console.error("Error converting DOCX to DITA:", error);
  }
}
module.exports = convertDocxToDita

async function DitaMapMaker(fetchData, title, OutputPath) {
  let nestedFiles = {};

  try {
    fetchData[0].nestObj.forEach((ff) => {
      const level = Math.max(parseInt(ff.level));

      let parent = nestedFiles;
      for (let i = 1; i < level; i++) {
        if (!parent.child) parent.child = [];
        if (parent.child.length === 0) {
          return;
        }
        parent = parent.child[parent.child.length - 1];
      }
      if (!parent.child) parent.child = [];

      parent.child.push(ff);
    });
  } catch (error) {
    console.log("Error building nested structure:", error);
  }
  function getLastPathSegment(path) {
    const parts = path.split(/[\\/]/);
    // Remove the first two segments
    const remainingParts = parts.slice(2);
    // Return the last segment of the remaining parts
    return remainingParts.join("/");
  }
  function getNavtitleSegment(path) {
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1];
  }
  function createXMLStructure(data) {
    let xmlStructure = "";

    if (data.child) {
      data.child.forEach((item) => {

        let topicPathInDita = getLastPathSegment(item.path);
        // xmlStructure += `<topicref href="${topicPathInDita}"`;
        navtitle=getNavtitleSegment(item.path)
        xmlStructure += `<topicref href="${topicPathInDita.toLowerCase()}" navtitle="${navtitle}"`;

        if (item.child && Array.isArray(item.child) && item.child.length > 0) {
          xmlStructure += `>\n${createXMLStructure(item)}\n</topicref>\n`;
        } else {
          xmlStructure += "/>\n";
        }
      });
    }

    return xmlStructure;
  }


  function createNestedStructure(data) {
    let nestedStructure = "";
    let firstTopicPath = getLastPathSegment(data.child[0].path);

    if (data?.child?.length === 1 && data?.child[0]?.child?.length > 0) {
      // nestedStructure += `<topicref href="${firstTopicPath}">\n<title>${title}</title>\n</topicref>\n`;
      nestedStructure += `<topicref href="${firstTopicPath}">\n`;

      nestedStructure += createXMLStructure({ child: data?.child[0]?.child });

      nestedStructure += "</topicref>\n";

    } else if (data?.child[0]?.child?.length == 1 && data?.child[0]?.child[0]?.child?.length > 0) {
      nestedStructure += `<topicref href="${firstTopicPath}">\n`;

      nestedStructure += createXMLStructure({ child: data?.child[0]?.child[0]?.child });

      nestedStructure += "</topicref>\n";
    } else if (data?.child[0]?.child[0]?.child?.length == 1 && data?.child[0]?.child[0]?.child[0]?.child > 0) {
      nestedStructure += `<topicref href="${firstTopicPath}">\n`;

      nestedStructure += createXMLStructure({ child: data?.child[0]?.child[0]?.child[0]?.child });

      nestedStructure += "</topicref>\n";
    } else {
      nestedStructure += `<topicref href="${firstTopicPath}">\n`;

      nestedStructure += createXMLStructure({ child: data.child.slice(1) });

      nestedStructure += "</topicref>\n";
    }

    return nestedStructure;
  }
  // function createNestedStructure(data) {
  //   let nestedStructure = "";

  //   if (data?.child?.length > 0) {
  //     nestedStructure += createXMLStructure(data);
  //   }

  //   return nestedStructure;
  // }
  let mapId = generateRandomId();
  let modifiedTitle = title.replace(/'s/g, '_s')
  let xmlString = `<?xml version="1.0"  encoding="UTF-8" standalone="no"?>
<!DOCTYPE map PUBLIC "-//OASIS//DTD DITA Map//EN" "map.dtd">
<map id="${mapId}" xml:lang="en-us">
<title>${modifiedTitle}</title>
${createNestedStructure(nestedFiles)}
</map>`;
  let loweCaseTitleName = title.toLowerCase().replace(/ /g, "_");
  const $ = cheerio.load(xmlString, { xmlMode: true });
  let aiTagList = getAiTagsList();
  aiTagList.forEach((tag) => {
    $(tag).attr("base", "ai-intent");
  });
  xmlString = $.xml();
  fs.writeFileSync(`${OutputPath}/${loweCaseTitleName}.ditamap`, xmlString);
  console.log("XML structure created successfully!");

  resetData();
}
