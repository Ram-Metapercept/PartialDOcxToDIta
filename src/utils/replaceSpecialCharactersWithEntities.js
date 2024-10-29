
function replaceSpecialCharactersWithEntities(text) {

  const entitiesMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    $: "&#36;",
    "%": "&#37;",
    "#": "&#35;",
    "@": "&#64;",

  };
 
  return text.replace(/[&<>"'$%@#]/g, (match) => entitiesMap[match]);
}

module.exports = replaceSpecialCharactersWithEntities;
