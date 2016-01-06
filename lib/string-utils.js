/**
 * Utility for string.
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
  return !StringUtils.isString (pattern) ? '' : pattern.replace(/\{(\w+)\}/g, function(token) {
    var key = token.substr(1, token.length - 2), value = keyValues[key];
    if (null === value || undefined === value) {
      return token;
    }
    return StringUtils.isString (value) ? value : '' + value;
  });
};
