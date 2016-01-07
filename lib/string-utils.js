/**
 * Utility for string.
 * Some codes are from Google closure library(Apache License).
 * @see https://github.com/google/closure-library
 * @author kuyur@kuyur.info
 */

/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
exports.startsWith = function(str, prefix) {
  if (String.prototype.startsWith) {
    return str.startsWith(prefix);
  }
  return str.lastIndexOf(prefix, 0) === 0;
};

/**
 * A value is a string type or not.
 * @param {*} val
 * @return {boolean}
 */
exports.isString = function(val) {
  return typeof val === 'string';
};

/**
 * String formatter for string pattern like: https://api.ripple.com/v1/accounts/{address}/balances .
 * The key-value object should like:
 * <pre>
 * {
 *   'address' : 'xxxx'
 * }
 * </pre>
 * @param {string} pattern The pattern string.
 * @param {Object} keyValues The object contains key-value pairs.
 * @return {string} Formatted string.
 */
exports.formatString = function(pattern, keyValues) {
  keyValues = keyValues || {};
  return !exports.isString (pattern) ? '' : pattern.replace(/\{(\w+)\}/g, function(token) {
    var key = token.substr(1, token.length - 2), value = keyValues[key];
    if (null === value || undefined === value) {
      return token;
    }
    return exports.isString (value) ? value : '' + value;
  });
};

/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
exports.repeat = function(string, length) {
  return new Array(length + 1).join(string);
};

/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
exports.padNumber = function(num, length, opt_precision) {
  var s = (opt_precision !== void 0) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return exports.repeat('0', Math.max(0, length - index)) + s;
};