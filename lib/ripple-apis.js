/**
 * @author kuyur@kuyur.info
 * @see https://ripple.com/build/ripple-rest/
 * @see https://ripple.com/build/data-api-v2/
 * @see https://wiki.ripple.com/Services_API#Federation_protocol
 */

exports.HOST = 'https://api.ripple.com';

exports.API = {
  NEW_WALLET: {
    method: 'GET',
    url: exports.HOST + '/v1/wallet/new'
  },
  BALANCE: {
    method: 'GET',
    url: exports.HOST + '/v1/accounts/{address}/balances'
  },
  GET_TRUSTLINE: {
    method: 'GET',
    url: exports.HOST + '/v1/accounts/{address}/trustlines'
  },
  GRANT_TRUSTLINE: {
    method: 'POST',
    url: exports.HOST + '/v1/accounts/{address}/trustlines'
  },
  PREPARE_PAYMENT: {
    method: 'GET',
    url: exports.HOST + '/v1/accounts/{address}/payments/paths/{destination_account}/{destination_amount}'
  },
  SUBMIT_PAYMENT: {
    method: 'POST',
    url: exports.HOST + '/v1/accounts/{address}/payments'
  },
  GET_PAYMENT: {
    method: 'GET',
    url: exports.HOST + '/v1/accounts/{address}/payments/{id}'
  },
  GET_PAYMENTS: {
    method: 'GET',
    url: exports.HOST + '/v1/accounts/{address}/payments'
  },
  GET_ORDER: {
    method: 'GET',
    url: exports.HOST + '/v1/accounts/{address}/orders'
  },
  PLACE_ORDER: {
    method: 'POST',
    url: exports.HOST + '/v1/accounts/{address}/orders'
  },
  CANCEL_ORDER: {
    method: 'DELETE',
    url: exports.HOST + '/v1/accounts/{address}/orders/{sequence}'
  },
  UUID: {
    method: 'GET',
    url: exports.HOST + '/v1/uuid'
  },
  TRANSACTION: {
    method: 'GET',
    url: exports.HOST + '/v1/transactions/{hash}'
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
