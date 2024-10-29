let globalState = {
  data: [],
};
let jsonState = {
  data: [],
};

let XrefHrefState = {
  data: [],
};
let ContentState = {
  data: "",
};
let htmldatabaseData={
  data: [],
}

function addHtmlDatabase(newData){
  htmldatabaseData.data.push(...newData);
}

function getHtmlDatabase() {
  return htmldatabaseData.data;
}


let ditaDatabaseData={
  data: [],
}
function addDitaDatabase(newData){
  ditaDatabaseData.data.push(...newData);
}

function getDitaDatabase() {
  return ditaDatabaseData.data;
} 

function getContentData() {
  return ContentState.data;
}

function addContentData(newData) {
  ContentState.data += newData;
}

let ModifiedContentState = {
  data: "",
};

function getModifiedContentData() {
  return ModifiedContentState.data;
}

function addModifiedContentData(newData) {
  ModifiedContentState.data += newData;
}
async function getData() {

  return globalState.data;
}


async function addData(newData) {

  globalState.data.push(newData);
}


function addJsonData(newData) {

  jsonState?.data?.push(newData);

}
function getJsonData() {
  return jsonState.data;
}

function addXrefJsonData(newData) {
  XrefHrefState?.data?.push(newData);
}
function getXrefJsonData() {
  return XrefHrefState.data;
}


function resetData() {
  globalState.data = [];
}

let isBodyEmpty = false;

const setIsBodyEmpty = (value) => {
  isBodyEmpty = value;
};

const getIsBodyEmpty = () => {
  return isBodyEmpty;
};

let inputFileName = "";

function setInputFileName(fileName) {
  inputFileName = fileName;
}

function getInputFileName() {
  return inputFileName;
}

function resetInputFileName() {
  inputFileName = "";
}
let ditaState = {
  data: [],
};

function setDitamakerData(){
  return ditaState.data;
}

function getDitamakerData() {
  return ditaState.data;
}


const logData = {
  missingTags: {},
  handledTags: {},
  skippedFiles: [],
};

function getLogData() {
  return logData;
}

function addMissingTags(type, isMissing) {

  logData.missingTags[type] = isMissing;

}

function addHandledTags(type, isMissing) {
  // console.log({type})
  logData.handledTags[type] = isMissing;
}

function addSkippedFiles(filePath) {
  logData.skippedFiles.push(filePath);
}

function resetlogData() {
  logData.missingTags = {};
  logData.handledTags = {};
  logData.skippedFiles = [];
}























module.exports = {  addMissingTags,
  addHandledTags,
  getLogData,
  addSkippedFiles,
  resetlogData,addDitaDatabase,getDitaDatabase,addHtmlDatabase,getHtmlDatabase,setDitamakerData,getDitamakerData,setInputFileName,getInputFileName,resetInputFileName,getModifiedContentData,addModifiedContentData,addContentData,getContentData,addXrefJsonData,getXrefJsonData, addJsonData, getJsonData, getData, addData, resetData, setIsBodyEmpty, getIsBodyEmpty }