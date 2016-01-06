
var MAX_TIMEOUT_ = 2147483647;

/**
 * Calls the given function once, after the optional pause.
 * <p>
 * The function is always called asynchronously, even if the delay is 0. This
 * is a common trick to schedule a function to run after a batch of browser
 * event processing.
 *
 * @param {function(this:SCOPE)} callback Function to call.
 * @param {number=} opt_delay Milliseconds to wait; default is 0.
 * @param {SCOPE=} opt_handler Object in whose scope to call the callback.
 * @return {number} A handle to the timer ID.
 * @template SCOPE
 */
exports.callOnce = function(callback, opt_delay, opt_handler) {
  if (typeof callback !== 'function') {
    throw Error('Invalid callback argument');
  }
  if (opt_handler) {
    callback = callback.bind(opt_handler);
  }

  if (Number(opt_delay) > MAX_TIMEOUT_) {
    // Timeouts greater than MAX_INT return immediately due to integer
    // overflow in many browsers.  Since MAX_INT is 24.8 days, just don't
    // schedule anything at all.
    return -1;
  } else {
    return setTimeout(callback, opt_delay || 0);
  }
};
