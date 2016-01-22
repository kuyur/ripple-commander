/**
 * @author kuyur@kuyur.info
 * @see https://ripple.com/build/ripple-rest/
 * @see https://ripple.com/build/data-api-v2/
 * @see https://wiki.ripple.com/Services_API#Federation_protocol
 */

var ObjectUtils = require('./object-utils.js');
var config = require('./ripple-config.js');

var serverUrl = ObjectUtils.getObjectByName('server', config) || 'https://api.ripple.com/v1';

exports.API = {
  NEW_WALLET: {
    method: 'GET',
    url: serverUrl + '/wallet/new'
  },
  BALANCE: {
    method: 'GET',
    url: serverUrl + '/accounts/{address}/balances'
  },
  GET_TRUSTLINE: {
    method: 'GET',
    url: serverUrl + '/accounts/{address}/trustlines'
  },
  GRANT_TRUSTLINE: {
    method: 'POST',
    url: serverUrl + '/accounts/{address}/trustlines'
  },
  PREPARE_PAYMENT: {
    method: 'GET',
    url: serverUrl + '/accounts/{address}/payments/paths/{destination_account}/{destination_amount}'
  },
  SUBMIT_PAYMENT: {
    method: 'POST',
    url: serverUrl + '/accounts/{address}/payments'
  },
  GET_PAYMENT: {
    method: 'GET',
    url: serverUrl + '/accounts/{address}/payments/{id}'
  },
  GET_PAYMENTS: {
    method: 'GET',
    url: serverUrl + '/accounts/{address}/payments'
  },
  GET_ORDER: {
    method: 'GET',
    url: serverUrl + '/accounts/{address}/orders'
  },
  PLACE_ORDER: {
    method: 'POST',
    url: serverUrl + '/accounts/{address}/orders'
  },
  CANCEL_ORDER: {
    method: 'DELETE',
    url: serverUrl + '/accounts/{address}/orders/{sequence}'
  },
  GET_ORDER_BOOK: {
    method: 'GET',
    url: serverUrl + '/accounts/{address}/order_book/{base}/{counter}'
  },
  UUID: {
    method: 'GET',
    url: serverUrl + '/uuid'
  },
  TRANSACTION: {
    method: 'GET',
    url: serverUrl + '/transactions/{hash}'
  },
  USER_INFO: {
    method: 'GET',
    url: 'https://id.ripple.com/v1/user/{address}'
  },
  GATEWAY_INFO: {
    method: 'GET',
    url: 'https://{domain}/ripple.txt'
  },
  BRIDGE: {
    method: 'GET',
    url: '{federation_url}?type=federation&destination={destination}&domain={domain}'
  },
  QUOTE_BRIDGE_PAYMENT: {
    method: 'GET',
    url: '{federation_url}?type=quote&destination={destination}&domain={domain}&amount={amount}&source={address}'
  }
};
