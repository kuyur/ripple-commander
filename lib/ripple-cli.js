/**
 * @author kuyur@kuyur.info
 */

var Promise = require('promise');
var Table = require('cli-table');
var AjaxUtils = require('./ajax-utils.js');
var PromiseAjax = require('./promise-ajax.js');
var API = require('./ripple-apis.js').API;
var issuer = require('./ripple-issuer.js').issuer;
var configs = require('./ripple-cli-config.js');

function getIssuerName(address, no_empty) {
  if (no_empty) {
    return issuer[address] || address;
  } else {
    return issuer[address] || '';
  }
}

/**
 * @constructor
 * @param {Object} options
 */
var RippleCLI = function(options) {
  this.account_ = options.account;
  this.secret_ = options.secret;
  this.tables_ = {};
};

/**
 * @private
 * @type {string}
 */
RippleCLI.prototype.account_;

/**
 * @private
 * @type {string}
 */
RippleCLI.prototype.secret_;

/**
 * @private
 * @type {string}
 */
RippleCLI.prototype.rippleName_;

/**
 * @private
 * @type {Readline}
 */
RippleCLI.prototype.readline_;

/**
 * @private
 * @type {Object}
 */
RippleCLI.prototype.tables_;

/**
 * @param {Readline}
 */
RippleCLI.prototype.start = function(readline) {
  if (!this.account_ || !this.secret_) {
    throw 'Account or secret is not set.';
  }

  this.readline_ = readline;

  console.log('Getting RippleName...');
  var url = AjaxUtils.formatString(API.USER_INFO.url, {
    'address': this.account_
  });
  var me = this;
  PromiseAjax.get(url).then(function(res) {
    res = res.getResponseJson();
    if (res['exists']) {
      me.rippleName_ = res['username'];
    } else {
      console.log('RippleName not found.');
    }
    me.setupPrompt_();
    me.bindEvent_();
  }, function(error) {
    console.log(error);
  });
};

/**
 * @private
 */
RippleCLI.prototype.bindEvent_ = function() {
  this.readline_.on('line', this.handleReadline_.bind(this));
  this.readline_.on('close', this.handleReadlineClose_.bind(this));
};

/**
 * @private
 */
RippleCLI.prototype.handleReadline_ = function(line) {
  switch(line.trim()) {
    case 'getBalance':
      this.getBalance();
      break;
    case 'getTrustLine':
      this.getTrustLine()
      break;
    case 'getOrder':
      this.getOrder();
      break;
    case 'grantTrustLine':
      this.beginGrantTrustLine();
      break;
    case 'sendMoney':
      this.beginSendMoney();
      break;
    case 'placeOrder':
      this.beginPlaceOrder();
      break;
    case 'cancelOrder':
      this.beginCancelOrder();
      break;
    case 'help':
      this.showHelp();
      break;
    default:
      console.log('type help to see all commands.');
      break;
  }
  this.readline_.prompt();
};

/**
 * @private
 */
RippleCLI.prototype.handleReadlineClose_ = function() {
  console.log('Good bye!');
  process.exit(0);
};

/**
 * @private
 */
RippleCLI.prototype.handleError_ = function(error) {
  // TODO
  console.log(error);
};

/**
 * @private
 */
RippleCLI.prototype.setupPrompt_ = function() {
  var prompt = this.rippleName_ ? '~' + this.rippleName_ + '> ' : this.account_ + '> ';
  this.readline_.setPrompt(prompt);
  this.readline_.prompt();
};

/**
 * @private
 */
RippleCLI.prototype.getTable_ = function(name) {
  if (this.tables_[name]) {
    return this.tables_[name];
  }

  if (configs.TABLES[name]) {
    return this.tables_[name] = new Table(configs.TABLES[name]);
  }

  return null;
};

RippleCLI.prototype.getBalance = function() {
  this.readline_.pause();
  var url = AjaxUtils.formatString(API.BALANCE.url, {
    'address': this.account_
  });

  var me = this;
  PromiseAjax.get(url).then(function(response) {
    var table = me.getTable_('balance');
    table.length = 0;
    var res = response.getResponseJson();
    res.balances.forEach(function(obj, index) {
      table.push([obj.currency, obj.value, obj.counterparty, getIssuerName(obj.counterparty)]);
    });
    console.log('ledger:' + res.ledger);
    console.log(table.toString());
    me.readline_.resume();
    me.readline_.prompt();
  }, me.handleError_);
};

RippleCLI.prototype.getTrustLine = function() {
  this.readline_.pause();
  var url = AjaxUtils.formatString(API.GET_TRUSTLINE.url, {
    'address': this.account_
  });

  var me = this;
  PromiseAjax.get(url).then(function(response) {
    var table = me.getTable_('trustline');
    table.length = 0;
    var res = response.getResponseJson();
    res.trustlines.forEach(function(obj, index) {
      table.push([obj.currency, obj.limit, obj.account_allows_rippling, obj.counterparty, getIssuerName(obj.counterparty)]);
    });
    console.log('ledger:' + res.ledger + ', validated:' + res.validated);
    console.log(table.toString());
    me.readline_.resume();
    me.readline_.prompt();
  }, me.handleError_);
};

RippleCLI.prototype.getOrder = function() {
  this.readline_.pause();
  var url = AjaxUtils.formatString(API.GET_ORDER.url, {
    'address': this.account_
  });

  var me = this;
  PromiseAjax.get(url).then(function(response) {
    var table = me.getTable_('order');
    table.length = 0;
    var res = response.getResponseJson();
    res.orders.forEach(function(obj, index) {
      var takerGet = obj.taker_gets;
      var takerGetCurrency = takerGet.currency;
      if (takerGet.counterparty) {
        takerGetCurrency += '(' + getIssuerName(takerGet.counterparty, true) + ')';
      }
      var takerPay = obj.taker_pays;
      var takerPayCurrency = takerPay.currency;
      if (takerPay.counterparty) {
        takerPayCurrency += '(' + getIssuerName(takerPay.counterparty, true) + ')';
      }
      var price = (takerPay.value / takerGet.value) + ' ' +  takerPay.currency + ' per ' + takerGet.currency;
      table.push([obj.sequence, obj.type, takerGet.value, takerGetCurrency,
        obj.type === 'sell' ? 'for' : 'with',
        takerPay.value, takerPayCurrency, price]);
    });
    console.log('ledger:' + res.ledger + ', validated:' + res.validated);
    console.log(table.toString());
    me.readline_.resume();
    me.readline_.prompt();
  }, me.handleError_);
};

RippleCLI.prototype.beginGrantTrustLine = function() {
  
};

RippleCLI.prototype.beginSendMoney = function() {
  
};

RippleCLI.prototype.beginPlaceOrder = function() {
  
};

RippleCLI.prototype.beginCancelOrder = function() {
  
};

RippleCLI.prototype.showHelp = function() {
  console.log('Commands below are supported: getBalance getTrustLine grantTrustLine sendMoney getOrder placeOrder cancelOrder changeAccount');
};

module.exports = RippleCLI;
