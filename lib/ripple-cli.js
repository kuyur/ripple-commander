/**
 * @author kuyur@kuyur.info
 */

var Promise = require('promise');
var Table = require('cli-table');
var readline = require('readline');
var readlineSync = require('readline-sync');
var StringUtils = require('./string-utils.js');
var AjaxUtils = require('./ajax-utils.js');
var PromiseAjax = require('./promise-ajax.js');
var configs = require('./ripple-cli-config.js');
var API = require('./ripple-apis.js').API;
var RippleIssuer = require('./ripple-issuer.js').issuer;
var RippleCode = require('./ripple-transaction-code.js').code;

function getIssuerName(address, no_empty) {
  if (no_empty) {
    return RippleIssuer[address] || address;
  } else {
    return RippleIssuer[address] || '';
  }
}

function getTransactionStatus(status) {
  var message = RippleCode[status];
  if (!message) {
    return status;
  } else {
    return status + ': ' + message;
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
  this.readline_ = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
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
 * @private
 * @type {string}
 */
RippleCLI.prototype.prompt_;

/**
 * start the cli.
 */
RippleCLI.prototype.start = function() {
  if (!this.account_ || !this.secret_) {
    throw 'Account or secret is not set.';
  }

  console.log('Getting RippleName...');
  var url = StringUtils.formatString(API.USER_INFO.url, {
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
    me.prompt_ = me.rippleName_ ? '~' + me.rippleName_ + '> ' : me.account_ + '> ';
    me.setPrompt_(me.prompt_);
    me.bindEvent_();
  }, function(error) {
    console.log(error);
    me.prompt_= me.account_ + '> ';
    me.setPrompt_(me.prompt_);
    me.bindEvent_();
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
  var params;
  line = line.trim();
  if (line === 'new-wallet') {
    this.generateWallet();
  } else if (line === 'get-balance') {
    this.getBalance();
  } else if (line === 'get-trustlines') {
    this.getTrustLines()
  } else if (line === 'get-orders') {
    this.getOrders();
  } else if (line === 'list-accounts') {
    this.listAccounts();
  } else if (line === 'help') {
    this.showHelp();
  } else if (line === 'exit') {
    this.exit();
  } else if (StringUtils.startsWith(line, 'grant-trustline')) {
    params = line.split(' ').slice(1);
    this.grantTrustLine.apply(this, params);
  } else if (StringUtils.startsWith(line, 'send-money')) {
    params = line.split(' ').slice(1);
    this.sendMoney.apply(this, params);
  } else if (StringUtils.startsWith(line, 'place-order')) {
    params = line.split(' ').slice(1);
    this.placeOrder.apply(this, params);
  } else if (StringUtils.startsWith(line, 'cancel-order')) {
    params = line.split(' ').slice(1);
    this.cancelOrder.apply(this, params);
  } else if (StringUtils.startsWith(line, 'retrieve-transaction')) {
    params = line.split(' ').slice(1);
    this.retrieveTransaction.apply(this, params);
  } else if (StringUtils.startsWith(line, 'change-account')) {
    params = line.split(' ').slice(1);
    this.changeAccount.apply(this, params);
  } else {
    console.log('type help to see all commands.');
  }

  this.readline_.prompt();
};

/**
 * @private
 */
RippleCLI.prototype.handleReadlineClose_ = function() {
  this.exit();
};

/**
 * @private
 */
RippleCLI.prototype.handleError_ = function(error) {
  console.log(error);
  this.readline_.input.resume();
  this.setPrompt_(this.prompt_);
};

/**
 * @private
 */
RippleCLI.prototype.setPrompt_ = function(prompt) {
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

RippleCLI.prototype.generateWallet = function() {
  this.setPrompt_('');
  this.readline_.input.pause();
  var me = this;
  PromiseAjax.get(API.NEW_WALLET.url).then(function(response) {
    var res = response.getResponseJson();
    console.log('address: ' + res.wallet.address);
    console.log('secret : ' + res.wallet.secret);
    me.readline_.input.resume();
    me.setPrompt_(me.prompt_);
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.getBalance = function() {
  this.setPrompt_('');
  this.readline_.input.pause();
  var url = StringUtils.formatString(API.BALANCE.url, {
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
    me.readline_.input.resume();
    me.setPrompt_(me.prompt_);
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.getTrustLines = function() {
  this.setPrompt_('');
  this.readline_.input.pause();
  var url = StringUtils.formatString(API.GET_TRUSTLINE.url, {
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
    console.log('ledger:' + res.ledger);
    console.log(table.toString());
    me.readline_.input.resume();
    me.setPrompt_(me.prompt_);
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.getOrders = function() {
  this.setPrompt_('');
  this.readline_.input.pause();
  var url = StringUtils.formatString(API.GET_ORDER.url, {
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
    console.log('ledger:' + res.ledger);
    console.log(table.toString());
    me.readline_.input.resume();
    me.setPrompt_(me.prompt_);
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.grantTrustLine = function(issuer, currency, limit, allow_rippling) {
  
};

RippleCLI.prototype.sendMoney = function() {
  
};

RippleCLI.prototype.placeOrder = function(type, currency1, amount1, currency2, amount2) {
  if (type !== 'sell' && type !== 'buy') {
    console.log('type should be any one of `sell` or `buy`.');
    return;
  }
  
  this.setPrompt_('');
  this.readline_.input.pause();

  var message = 'You will ' + type + ' ' + amount1 + currency1 + (type === 'sell' ? ' for ' : ' with ') + amount2 + currency2 + '. Are you sure?';
  if (readlineSync.keyInYN(message)) {
    var url = StringUtils.formatString(API.PLACE_ORDER.url, {
      'address': this.account_
    });
    var taker_pays, taker_pay_value, taker_gets, taker_gets_value;
    if (type === 'sell') {
      taker_pays = currency2.split('+');
      taker_pay_value = amount2;
      taker_gets = currency1.split('+');
      taker_gets_value = amount1;
    } else {
      taker_pays = currency1.split('+');
      taker_pay_value = amount1;
      taker_gets = currency2.split('+');
      taker_gets_value = amount2;
    }
    var order = {
      'secret': this.secret_,
      'order': {
        'type': type,
        'taker_pays': {
          'currency': taker_pays[0],
          'counterparty': taker_pays[1] || '',
          'value': taker_pay_value
        },
        'taker_gets': {
          'currency': taker_gets[0],
          'counterparty': taker_gets[1] || '',
          'value': taker_gets_value
        }
      }
    };
    var me = this;
    PromiseAjax.post(url, null, order).then(function(response) {
      var hash = response.getResponseJson().hash;
      console.log('Place order successfully.');
      console.log('Transaction hash: ' + hash);
      me.retrieveTransaction(hash);
    }, me.handleError_.bind(me));
  } else {
    this.readline_.input.resume();
    this.setPrompt_(this.prompt_);
  }
};

RippleCLI.prototype.cancelOrder = function(sequence) {
  this.setPrompt_('');
  this.readline_.input.pause();
  var url = StringUtils.formatString(API.CANCEL_ORDER.url, {
    'address': this.account_,
    'sequence': sequence
  });

  var me = this;
  PromiseAjax.send('DELETE', url, null, null, {
    'secret': this.secret_
  }).then(function(response) {
    console.log('Cancel order successfully: ' + sequence);
    me.readline_.input.resume();
    me.setPrompt_(me.prompt_);
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.retrieveTransaction = function(hash) {
  this.setPrompt_('');
  this.readline_.input.pause();
  var url = StringUtils.formatString(API.TRANSACTION.url, {
    'hash': hash
  });

  var me = this;
  PromiseAjax.get(url).then(function(response) {
    var res = response.getResponseJson();
    var status = res.transaction.meta.TransactionResult;
    if (!status) {
      console.log('Transaction is still under pending.');
    } else {
      console.log('Transaction status: ' + getTransactionStatus(status));
    }
    me.readline_.input.resume();
    me.setPrompt_(me.prompt_);
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.listAccounts = function() {
  
};

RippleCLI.prototype.changeAccount = function(address, secret) {
  
};

RippleCLI.prototype.showHelp = function() {
  console.log('Commands:');
  console.log('  new-wallet');
  console.log('  get-balance');
  console.log('  get-trustlines');
  console.log('  grant-trustline {issuer} {currency} {limit} [ --allow-rippling ]');
  console.log('  send-money {destination} {currency+issuer} {amount}');
  console.log('  get-orders');
  console.log('  place-order {type} {currency+issuer} {amount} {currency+issuer} {amount}');
  console.log('  cancel-order {sequence}');
  console.log('  retrieve-transaction {hash}');
  console.log('  list-accounts');
  console.log('  change-account {address} {secret}');
  console.log('  exit');
};

RippleCLI.prototype.exit = function() {
  console.log('Good bye!');
  process.exit(0);
};

module.exports = RippleCLI;
