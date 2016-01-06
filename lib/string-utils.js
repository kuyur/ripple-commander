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
