function validateURL(url) {

  var regex = /^(https?|ftp)?:\/\/[^\s\/$.?#].[^\s]*$/;

  var isValid = regex.test(url);

  if (!isValid && !url?.includes("://")) {
    regex = /^[^\s\/$.?#].[^\s]*$/; 
    isValid = regex.test(url);
  }

  return isValid;
}

module.exports = validateURL;

