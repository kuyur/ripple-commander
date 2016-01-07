/**
  * @author kuyur@kuyur.info
 */

var Promise = require('promise');

/**
 * Return a promise style result.
 * @param {Object} readline
 * @param {string} question
 */
exports.question = function(readline, question) {
  var promise = new Promise(function(resolve, reject) {
    readline.question(question, function(answer) {
      resolve(answer);
    });
  });

  return promise;
};
