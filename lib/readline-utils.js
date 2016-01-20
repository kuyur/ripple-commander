/**
  * @author kuyur@kuyur.info
 */

var Promise = require('promise');

/**
 * Question and return a promise style result.
 * @param {Object} readline
 * @param {string} question
 * @return {Promise}
 */
exports.question = function(readline, question) {
  var promise = new Promise(function(resolve, reject) {
    readline.question(question, function(answer) {
      resolve(answer);
    });
  });

  return promise;
};

/**
 * Question a password and return a promise style result.
 * @see http://stackoverflow.com/questions/24037545/how-to-hide-password-in-the-nodejs-console
 * @param {Object} readline
 * @param {string} question
 * @return {Promise}
 */
exports.password = function(readline, question) {
  // show ****** for password
  var onDataHandler = function(chr) {
    chr = '' + chr;
    switch (chr) {
      case '\n':
      case '\r':
      case '\u0004':
        process.stdin.removeListener('data', onDataHandler);
        break;
      default:
        process.stdout.write('\033[2K\033[200D' + question + Array(readline.line.length + 1).join('*'));
    }
  };
  process.stdin.on('data', onDataHandler);
  var promise = new Promise(function(resolve, reject) {
    readline.question(question, function(answer) {
      // remove answer from history
      readline.history = readline.history.slice(1);
      resolve(answer);
    });
  });
  return promise;
};
