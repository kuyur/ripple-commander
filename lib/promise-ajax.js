/**
 * Send http request and return a Promise style result for later asynchronous handling.
 * @author kuyur@kuyur.net
 */

var Promise = require('promise');
var AjaxUtils = require('./ajax-utils.js');

var PromiseAjax = {};

/**
 * Returns whether the given status should be considered successful.
 *
 * Successful codes are OK (200), CREATED (201), ACCEPTED (202),
 * NO CONTENT (204), PARTIAL CONTENT (206), NOT MODIFIED (304),
 * and IE's no content code (1223).
 *
 * @param {number} status The status code to test.
 * @return {boolean} Whether the status code should be considered successful.
 */
PromiseAjax.isSuccess = function(status) {
  switch (status) {
    case 200:
    case 201:
    case 202:
    case 204:
    case 206:
    case 304:
    case 1223:
      return true;

    default:
      return false;
  }
};

/**
 * Send http GET request.
 * @param {string} url
 * @param {Object=} queryParams
 * @param {Object=} headers
 * @return {Promise}
 */
PromiseAjax.get = function(url, queryParams, headers){
  return new Promise(function(resolve, reject) {
    AjaxUtils.get(url, queryParams, headers, function(response) {
      if (PromiseAjax.isSuccess(response.getStatusCode())) {
        resolve(response);
      } else {
        reject(response.getResponseText());
      }
    });
  });
};

/**
 * Send http POST request with sending json object.
 * @param {string} url
 * @param {Object=} queryParams
 * @param {(Object|Array|string|number|boolean)=} jsonObject
 * @param {Object=} headers
 * @return {Promise}
 */
PromiseAjax.post = function(url, queryParams, jsonObject, headers) {
  return new Promise(function(resolve, reject) {
    AjaxUtils.post(url, queryParams, jsonObject, headers, function(response) {
      if (PromiseAjax.isSuccess(response.getStatusCode())) {
        resolve(response);
      } else {
        reject(response.getResponseText());
      }
    });
  });
};

/**
 * Send http POST request with sending form data.
 * @param {string} url
 * @param {Object=} queryParams
 * @param {Object=} formParams
 * @param {Object=} headers
 * @return {Promise}
 */
PromiseAjax.postFormData = function(url, queryParams, formParams, headers) {
  return new Promise(function(resolve, reject) {
    AjaxUtils.postFormData(url, queryParams, formParams, headers, function(response) {
      if (PromiseAjax.isSuccess(response.getStatusCode())) {
        resolve(response);
      } else {
        reject(response.getResponseText());
      }
    });
  });
};

/**
 * Send http request.
 * @param {string} url
 * @param {Object=} queryParams
 * @param {Object=} formParams
 * @param {(Object|Array|string|number|boolean)=} sendingObject
 * @param {Object=} headers
 * @return {Promise}
 */
PromiseAjax.send = function(method, url, queryParams, formParams, sendingObject, headers) {
  return new Promise(function(resolve, reject) {
    AjaxUtils.send(method, url, queryParams, formParams, sendingObject, headers, function(response) {
      if (PromiseAjax.isSuccess(response.getStatusCode())) {
        resolve(response);
      } else {
        reject(response.getResponseText());
      }
    });
  });
};

module.exports = PromiseAjax;
