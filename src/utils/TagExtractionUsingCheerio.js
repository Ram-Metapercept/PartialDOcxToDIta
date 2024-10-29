
const cheerio = require("cheerio");
const htmlTagModel = require("../models/tag/htmlTagModel");
const { addHtmlDatabase, addDitaDatabase } = require("./StateManagement");
const ditaTagModel = require("../models/tag/ditaTagModel");

async function insertTags(htmlString) {
    const $ = cheerio.load(htmlString);
    const allTags = new Set();
    $('*').each((index, element) => {
        const tagName = element.tagName.toLowerCase();
        allTags.add(tagName);
    });

    const uniqueTagsArray = Array.from(allTags);
    const tagPromises = [];
    const tagJson = {};
    const existingTags = await htmlTagModel.find({
        key: { $in: uniqueTagsArray.map(tagName => `html_${tagName}`) }
    });

    const existingTagMap = new Map(existingTags.map(tag => [tag.key, tag]));

    for (const tagName of uniqueTagsArray) {
        const key = `html_${tagName}`;
        const value = tagName;
        addHtmlDatabase([{ key: key, value: value }]);

        tagJson[key] = value;

        if (existingTagMap.has(key)) {
            const existingTag = existingTagMap.get(key);
            existingTag.value = value;
            tagPromises.push(existingTag.save());
        } else {
            const tagEntry = new htmlTagModel({ key: key, value: value });
            tagPromises.push(tagEntry.save());
        }
    }
    const gettinghDitaTagFromDatabase = await ditaTagModel.find();
    addDitaDatabase(gettinghDitaTagFromDatabase);
    await Promise.all(tagPromises);

    return tagJson;
}

module.exports = insertTags;
