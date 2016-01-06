/**
 * Utility for ajax request.
 * @author kuyur@kuyur.info
 */

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var Response = require('./http-response.js');
var StringUtils = require('./string-utils.js');

/**
 * Convert a query parameter object to string.
 * @param {Object|string} params
 * @return {string}
 */
exports.objectToQueryString = function(params) {
  if (StringUtils.isString(params)) {
    return params;
  }
  if (!params) {
    return '';
  }
  var sb = [];
  for (var key in params) {
    if (params[key] != undefined && typeof(params[key]) !== 'function') {
      sb.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
  }
  return sb.join('&');
};

/**
 * Convert a form parameter object to string.
 * @param {Object|string} object
 * @return {string}
 */
exports.objectToFormString = exports.objectToQueryString;

/**
 * Send get request.
 * @param {string} url
 * @param {Object=} queryParams
 * @param {Object=} headers
 * @param {Function} callback
 */
exports.get = function(url, queryParams, headers, callback) {
  exports.send('GET', url, queryParams, null, null, headers, callback);
};

/**
 * Send post request with json object. 'Content-Type' will be 'application/json'.
 * @param {string} url
 * @param {Object=} queryParams
 * @param {(Object|Array|string|boolean|number)=} jsonObject
 * @param {Object=} headers
 * @param {Function} callback
 */
exports.post = function(url, queryParams, jsonObject, headers, callback) {
  exports.send('POST', url, queryParams, null, jsonObject, headers, callback);
};

/**
 * Send post request with form params. 'Content-Type' will be 'application/x-www-form-urlencoded'.
 * @param {string} url
 * @param {Object=} queryParams
 * @param {Object=} formParams
 * @param {Object=} headers
 * @param {Function} callback
 */
exports.postFormData = function(url, queryParams, formParams, headers, callback) {
  exports.send('POST', url, queryParams, formParams, null, headers, callback);
};

/**
 * Send put request with json object. 'Content-Type' will be 'application/json'.
 * @param {string} url
 * @param {Object=} queryParams
 * @param {(Object|Array|string|boolean|number)=} jsonObject
 * @param {Object=} headers
 * @param {Function} callback
 */
exports.put = function(url, queryParams, jsonObject, headers, callback) {
  exports.send('PUT', url, queryParams, null, jsonObject, headers, callback);
};

/**
 * Send http request.
 * @param {string} method
 * @param {string} url
 * @param {Object=} queryParams
 * @param {Object=} formParams
 * @param {(Object|Array|string|boolean|number)=} sendingObject
 * @param {Object=} headers
 * @param {Function} callback
 */
exports.send = function(method, url, queryParams, formParams, sendingObject, headers, callback) {
  if (method !== 'GET' && method !== 'POST' && method !== 'PUT' && method !== 'DELETE') {
    throw 'Not supported http method' + method;
  }
  if (url == undefined) {
    throw 'Invalid url';
  }
  if (queryParams) {
    var queryString = exports.objectToQueryString(queryParams);
    if (queryString) {
      if (url.indexOf('?') !== -1) {
        url += '&' + queryString;
      } else {
        url += '?' + queryString;
      }
    }
  }
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (callback) {
        var response = new Response(xhr.responseText, xhr.getAllResponseHeaders(), xhr.status, xhr.statusText, url);
        callback(response);
      }
    }
  }
  headers = headers || {};
  var body;
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    if (sendingObject) {
      body = JSON.stringify(sendingObject);
      headers['Content-Type'] = 'application/json'; 
    } else {
      body = exports.objectToFormString(formParams);
      headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'; 
    }
  }
  for (var key in headers) {
    xhr.setRequestHeader(key, headers[key]); 
  }

  xhr.send(body);
};
