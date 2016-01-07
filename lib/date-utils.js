var StringUtils = require('./string-utils.js');

/**
 * Get time zone string.
 * @return {string}
 */
exports.getTimezone = function() {
  var offset = new Date().getTimezoneOffset();
  // -540 for GMT+9 (JST)
  var ahead = (offset <= 0);
  offset = Math.abs(offset);
  var h = Math.floor(offset / 60);
  var m = offset - 60 * h;
  return 'GMT' + (ahead ? '+' : '-') + StringUtils.padNumber(h, 2) + ':' + StringUtils.padNumber(m, 2);
};

/**
 * Format a date. Pattern: yyyy-MM-dd HH:mm:ss .
 * @param {string|number|Date}
 * @return {string}
 */
exports.formatTimestamp = function(t) {
  if (!(t instanceof Date)) {
    t = new Date(t);
  }
  if (isNaN(t.getTime())) {
    return 'Invalid timestamp.';
  }
  // 2016-01-07 14:53:40
  return t.getFullYear() + '-' +
    StringUtils.padNumber(t.getMonth() + 1, 2) + '-' +
    StringUtils.padNumber(t.getDate(), 2) + ' ' +
    StringUtils.padNumber(t.getHours(), 2) + ':' +
    StringUtils.padNumber(t.getMinutes(), 2) + ':' +
    StringUtils.padNumber(t.getSeconds(), 2);
};
