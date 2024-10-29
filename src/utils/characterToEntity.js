const replaceSpecialCharactersWithEntities = require("./replaceSpecialCharactersWithEntities");

function characterToEntity(json) {
  if (json.attributes) {
    for (const key in json.attributes) {
      json.attributes[key] = replaceSpecialCharactersWithEntities(
        json.attributes[key]
      );
    }
  }
  if (typeof json === "string") {
    return replaceSpecialCharactersWithEntities(json);
  }
  if (Array.isArray(json.content)) {
    json.content = json.content.map(characterToEntity);
  }
  return json;
}

module.exports = characterToEntity;
