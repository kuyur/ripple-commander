/**
 * From tora.js (weiwl07@gmail.com). MIT LICENSE. 
 * @see https://github.com/weiwl/tora.js/blob/master/tora/js/works/web/response.js
 */

/**
 * A pure data object holding the response content and status for a http response.
 * @constructor
 * @param {string} responseText
 * @param {string} opt_responseHeaders
 * @param {number} opt_statusCode
 * @param {string} opt_statusText
 * @param {string} opt_url
 */
var Response = function(responseText, opt_responseHeaders, opt_statusCode, opt_statusText, opt_url) {
  this.responseText_ = (typeof responseText == 'string') ? responseText : null;
  this.responseHeaders_ =  (typeof opt_responseHeaders == 'string') ? opt_responseHeaders : null;
  this.statusCode_ = opt_statusCode != void 0 ? +opt_statusCode : null;
  this.statusText_ = opt_statusText || null;
  this.url_ = opt_url || null;
};

/**
 * @private
 * @type {number}
 */
Response.prototype.statusCode_;

/**
 * @private
 * @type {string}
 */
Response.prototype.statusText_;

/**
 * @private
 * @type {string}
 */
Response.prototype.responseText_;

/**
 * @private
 * @type {string}
 */
Response.prototype.responseHeaders_;

/**
 * @private
 * @type {Object}
 */
Response.prototype.headers_;

/**
 * @private
 * @type {Array.<string>}
 */
Response.prototype.headerTokens_;

/**
 * Get status code.
 * @return {number}
 */
Response.prototype.getStatusCode = function() {
  return this.statusCode_;
};

/**
 * Get status text.
 * @return {string}
 */
Response.prototype.getStatusText = function() {
  return this.statusText_;
};

/**
 * Get response text.
 * @return {string}
 */
Response.prototype.getResponseText = function() {
  return this.responseText_;
};

/**
 * Get response object parsed from response text. The response content is
 * supposed to be a json string. If the response text is not a valid json string,
 * will return null.
 * @return {Object|Array|number|string|null}
 */
Response.prototype.getResponseJson = function() {
  try {
    return JSON.parse(this.responseText_);
  } catch (e) {
    return null;
  }
};

/**
 * Get header by its token name.
 * @param {string} token
 * @return {string}
 */
Response.prototype.getHeader = function(token) {
  if (!this.headers_) {
    this.parseHeaders_();
  }
  return this.headers_[token];
};

/**
 * @private
 */
Response.prototype.parseHeaders_ = function() {
  this.headers_ = {};
  if (!this.responseHeaders_) return;
  var headerStrArr = this.responseHeaders_.split('\n');
  for (var i = 0, len = headerStrArr.length; i < len; ++i) {
    var headerStr = headerStrArr[i];
    if (headerStr) {
      var pos = headerStr.indexOf(':');
      if (pos >= 0) {
        var key = headerStr.substring(0, pos).trim();
        var value = headerStr.substring(pos + 1).trim();
        this.headers_[key] = value;
      }
    }
  }
}

/**
 * The method is similar with getHeader('Date') but the return result
 * will be a Date Object.
 * @return {Date}
 */
Response.prototype.getDate = function() {
  return new Date(this.getHeader('Date'));
};

/**
 * The method is similar with getHeader('Content-Length') but the return result
 * will be a number.
 * @return {number}
 */
Response.prototype.getContentLength = function() {
  return +(this.getHeader('Content-Length'));
};

/**
 * The method is short for getHeader('Content-Type').
 * @return {string}
 */
Response.prototype.getContentType = function() {
  return this.getHeader('Content-Type');
};

/**
 * Get all header tokens.
 * @return {Array.<string>}
 */
Response.prototype.getHeaderTokens = function() {
  if (this.headerTokens_) {
    return this.headerTokens_;
  }

  if (!this.headers_) {
    this.parseHeaders_();
  }
  this.headerTokens_ = [];
  for (var key in this.headers_) {
    this.headerTokens_.push(key);
  }
  return this.headerTokens_;
};

/**
 * Get url.
 * @return {string}
 */
Response.prototype.getUrl = function() {
  return this.url_;
};

module.exports = Response;
