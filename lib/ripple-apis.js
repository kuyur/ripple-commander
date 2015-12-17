﻿/**
 * @author kuyur@kuyur.info
 */

exports.HOST = 'https://api.ripple.com';

exports.API = {
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
  USER_INFO: {
    method: 'GET',
    url: 'https://id.ripple.com/v1/user/{address}'
  }
};