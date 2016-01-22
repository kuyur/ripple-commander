/**
 * @author kuyur@kuyur.info
  */
 
var fs = require('fs');

var config = {};

try {
  var data = fs.readFileSync('./config.json', 'binary');
  config = JSON.parse(data);
} catch (e) {
  // there is no issuers.json or issuers.json is not a valid json file.
}

module.exports = config;
