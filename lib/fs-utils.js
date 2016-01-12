/**
 * @author kuyur@kuyur.info
 */

var fs = require('fs');
var Promise = require('promise');

/**
 * Read file and return a Promise result
 * @param {string|number} file filename or file descriptor
 * @param {(Object|string)=} options
 */
exports.readFile = function(file, options) {
  var promise = new Promise(function(resolve, reject) {
    fs.readFile(file, options, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  return promise;
};
