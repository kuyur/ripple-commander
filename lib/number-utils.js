
/**
 * @param {number} num
 * @return {boolean}
 */
exports.isInt = function(num) {
  return isFinite(num) && num % 1 == 0;
};

/**
 * Decimal round.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
 * @see http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
 * @param {number|string} number number or number-like value to round.
 * @param {number} opt_digit digit to keep. Default is 0.
 * @return {number}
 */
exports.round = function(number, opt_digit) {
  if (!exports.isInt(opt_digit) || opt_digit === 0) {
    return Math.round(number);
  }
  number = +number;
  if (isNaN(number)) {
    return NaN;
  }

  // shift
  number = number.toString().split('e');
  number = Math.round(+(number[0] + 'e' + (number[1] ? (+number[1] + opt_digit) : opt_digit)));

  // shift back
  number = number.toString().split('e');
  return +(number[0] + 'e' + (number[1] ? (+number[1] - opt_digit) : -opt_digit));
};
