/**
 * @author kuyur@kuyur.info
 */

var Promise = require('promise');
var Table = require('cli-table');
var readline = require('readline');
var StringUtils = require('./string-utils.js');
var DateUtils = require('./date-utils.js');
var AjaxUtils = require('./ajax-utils.js');
var FunctionUtils = require('./function-utils.js');
var ReadlineUtils = require('./readline-utils.js');
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
 * @private
 * @type {boolean}
 */
RippleCLI.prototype.readlinePrevented_;

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
RippleCLI.prototype.pauseHandleReadline_ = function() {
  this.readlinePrevented_ = true;
  this.setPrompt_('');
};

/**
 * @private
 */
RippleCLI.prototype.resumeHandleReadline_ = function() {
  this.readlinePrevented_ = false;
  this.setPrompt_(this.prompt_);
};

/**
 * @private
 */
RippleCLI.prototype.handleReadline_ = function(line) {
  if (this.readlinePrevented_) {
    return;
  }

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
  } else if (line === 'get-payments') {
    this.retrievePayments();
  } else if (line === 'list-accounts') {
    this.listAccounts();
  } else if (line === 'help') {
    this.showHelp();
  } else if (line === 'exit') {
    this.exit();
  } else if (StringUtils.startsWith(line, 'grant-trustline')) {
    params = line.split(/\s+/).slice(1);
    this.grantTrustLine.apply(this, params);
  } else if (StringUtils.startsWith(line, 'send-to-bridge')) {
    params = line.split(/\s+/).slice(1);
    this.sendToBridge.apply(this, params);
  } else if (StringUtils.startsWith(line, 'send')) {
    params = line.split(/\s+/).slice(1);
    this.sendMoney.apply(this, params);
  } else if (StringUtils.startsWith(line, 'get-payment')) {
    params = line.split(/\s+/).slice(1);
    this.retrievePayment.apply(this, params);
  } else if (StringUtils.startsWith(line, 'place-order')) {
    params = line.split(/\s+/).slice(1);
    this.placeOrder.apply(this, params);
  } else if (StringUtils.startsWith(line, 'cancel-order')) {
    params = line.split(/\s+/).slice(1);
    this.cancelOrder.apply(this, params);
  } else if (StringUtils.startsWith(line, 'get-transaction')) {
    params = line.split(/\s+/).slice(1);
    this.retrieveTransaction.apply(this, params);
  } else if (StringUtils.startsWith(line, 'change-account')) {
    params = line.split(/\s+/).slice(1);
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
  this.resumeHandleReadline_();
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
  this.pauseHandleReadline_();
  var me = this;
  PromiseAjax.get(API.NEW_WALLET.url).then(function(response) {
    var res = response.getResponseJson();
    console.log('address: ' + res.wallet.address);
    console.log('secret : ' + res.wallet.secret);
    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.getBalance = function() {
  this.pauseHandleReadline_();
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
    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.getTrustLines = function() {
  this.pauseHandleReadline_();
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
    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.getOrders = function() {
  this.pauseHandleReadline_();
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
    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.grantTrustLine = function(issuer, currency, limit, allow_rippling) {
  var allowRippling = allow_rippling === '--allow-rippling';
  this.pauseHandleReadline_();
  var url = StringUtils.formatString(API.GRANT_TRUSTLINE.url, {
    'address': this.account_
  });
  var postObject = {
    secret: this.secret_,
    trustline: {
      limit: limit,
      currency: currency,
      counterparty: issuer,
      account_allows_rippling: allowRippling
    }
  };

  var me = this;
  PromiseAjax.post(url, {'validated': true}, postObject).then(function(response) {
    console.log('Grant trustline successfully. Getting latest trustlines...');
    me.getTrustLines();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.sendMoney = function(destination, currency, amount, message, choose_path) {
  this.pauseHandleReadline_();
  console.log('Preparing payment...');

  var promise = PromiseAjax.get(API.UUID.url).then(function(response) {
    return response.getResponseJson().uuid;
  });
  // preparing payment
  var me = this;
  currency = currency.split('+');
  promise = promise.then(function(uuid) {
    var sendObject = {
      secret: me.secret_,
      client_resource_id: uuid,
      payment: {
        source_account: me.account_,
        source_tag: '',
        source_amount: {
          value: amount,
          currency: currency[0],
          issuer: currency[1] || ''
        },
        source_slippage: '0',
        destination_account: destination,
        destination_tag: '',
        destination_amount: {
          value: amount,
          currency: currency[0],
          issuer: currency[1] || ''
        },
        invoice_id: '',
        paths: '[]',
        partial_payment: false,
        no_direct_ripple: false
      } 
    };
    // submit payment
    var url = StringUtils.formatString(API.SUBMIT_PAYMENT.url, {
      'address': me.account_
    });
    return PromiseAjax.post(url, null, sendObject);
  });

  promise.then(function(response) {
    console.log('Send payment successfully.');
    var res = response.getResponseJson();
    console.log('Payment id: ' + res.client_resource_id);
    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

/**
 * First, get required fields of destination bridge by url. For example,
 * destination of zfb@ripplefox.com requied 3 fields.
 * ( https://ripplefox.com/bridge?type=federation&destination=zfb&domain=ripplefox.com )
 * 
 * Second, generating a Quote for the payment.
 * ( https://ripplefox.com/bridge?type=quote&destination=zfb&domain=ripplefox.com&amount=100%2FCNY&source={ripple_address}&alipayAccount={alipay_account}&alipayUser={realname_of_alipay_account}&email={your_email} )
 * Then destination_address, destination_tag, invoice_id and required amount (including fee) will be returned.
 * 
 * Third, send the payment to destination_address with destination_tag and invoice_id.
 * 
 * @see https://wiki.ripple.com/Services_API#Federation_protocol
 */
RippleCLI.prototype.sendToBridge = function(destination, amount) {
  this.pauseHandleReadline_();
  
  if (!StringUtils.isString(destination) || destination.indexOf('@') <= 0) {
    console.log('Not a valid destination bridge: ' + destination);
    this.resumeHandleReadline_();
    return;
  }

  var parts = destination.split('@');
  var domain = parts[1],
    dest = parts[0];
  var bridgeUrl = StringUtils.formatString(API.BRIDGE.url, {
    'domain': domain,
    'destination': dest
  });

  var promise = PromiseAjax.get(bridgeUrl).then(function(response) {
    var federation = response.getResponseJson().federation_json;
    return {
      currency: federation.currencies[0].currency,
      issuer: federation.currencies[0].issuer,
      fields: federation.extra_fields || []
    };
  });

  var me = this;
  promise = promise.then(function(obj) {
    obj.answers = {};
    return obj.fields.reduce(function(prevResult, currentField, index) {
      return prevResult.then(function() {
        return ReadlineUtils.question(me.readline_, currentField.label + ' ' + currentField.hint + ': ')
      }).then(function(answer) {
        obj.answers[currentField.name] = answer;
      });
    }, Promise.resolve()).then(function() {
      return obj;
    });
  });

  promise = promise.then(function(obj) {
    var quoteUrl = StringUtils.formatString(API.QUOTE_BRIDGE_PAYMENT.url, {
      'domain': domain,
      'destination': dest,
      'amount': amount + encodeURIComponent('/') + obj.currency,
      'address': me.account_
    });
    return PromiseAjax.get(quoteUrl, obj.answers);
  });

  promise.then(function(response) {
    var res = response.getResponseJson();
    if (res.result === 'error') {
      console.log(JSON.stringify(res, null, 2));
      me.resumeHandleReadline_();
    } else {
      // TODO do payment
      console.log(JSON.stringify(res, null, 2));
      me.resumeHandleReadline_();
    }
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.retrievePayment = function(id) {
  this.pauseHandleReadline_();
  var url = StringUtils.formatString(API.GET_PAYMENT.url, {
    'address': this.account_,
    'id': id
  });

  var me = this;
  PromiseAjax.get(url).then(function(response) {
    var table = me.getTable_('payment');
    table.length = 0;
    var res = response.getResponseJson();
    var payment = res.payment;
    var type = payment.source_account === me.account_ ? 'Sent' : 'Received',
      amount = payment.destination_amount.value,
      currency = payment.destination_amount.currency,
      issuer = payment.destination_amount.issuer,
      address = type === 'Sent'? payment.destination_account : payment.source_account;
    table.push([DateUtils.formatTimestamp(payment.timestamp), type, amount, currency, issuer,
      getIssuerName(issuer), type === 'Sent' ? 'to' : 'from', address, payment.result === 'tesSUCCESS']);
    console.log('ledger: ' + res.ledger + ', Timezone: ' + DateUtils.getTimezone());
    console.log(table.toString());

    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.retrievePayments = function() {
  this.pauseHandleReadline_();
  var url = StringUtils.formatString(API.GET_PAYMENTS.url, {
    'address': this.account_
  });

  var me = this;
  PromiseAjax.get(url).then(function(response) {
    var table = me.getTable_('payment');
    table.length = 0;
    var res = response.getResponseJson();
    res.payments.forEach(function(obj, index) {
      var payment = obj.payment;
      var type = payment.source_account === me.account_ ? 'Sent' : 'Received',
        amount = payment.destination_amount.value,
        currency = payment.destination_amount.currency,
        issuer = payment.destination_amount.issuer,
        address = type === 'Sent'? payment.destination_account : payment.source_account;
      table.push([DateUtils.formatTimestamp(payment.timestamp), type, amount, currency, issuer,
        getIssuerName(issuer), type === 'Sent' ? 'to' : 'from', address, payment.result === 'tesSUCCESS']);
    });
    console.log('Timezone: ' + DateUtils.getTimezone());
    console.log(table.toString());

    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

/**
 * place-order <type> <amount1+currency1+issuer1> <amount2+currency2+issuer2>
 */
RippleCLI.prototype.placeOrder = function(type, amount1, amount2) {
  this.pauseHandleReadline_();

  if (type !== 'sell' && type !== 'buy') {
    console.log('type should be any one of `sell` or `buy`.');
    this.resumeHandleReadline_();
    return;
  }

  var me = this;
  var question = 'You will ' + type + ' ' + amount1 + (type === 'sell' ? ' for ' : ' with ') + amount2 + '. Are you sure? [y/n] ';
  ReadlineUtils.question(this.readline_, question).then(function(answer) {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      var url = StringUtils.formatString(API.PLACE_ORDER.url, {
        'address': me.account_
      });
      var taker_pays, taker_gets;
      if (type === 'sell') {
        taker_pays = amount2.split('+');
        taker_gets = amount1.split('+');
      } else {
        taker_pays = amount1.split('+');
        taker_gets = amount2.split('+');
      }
      var order = {
        'secret': me.secret_,
        'order': {
          'type': type,
          'taker_pays': {
            'value': taker_pays[0],
            'currency': taker_pays[1],
            'counterparty': taker_pays[2] || ''
          },
          'taker_gets': {
            'value': taker_gets[0],
            'currency': taker_gets[1],
            'counterparty': taker_gets[2] || ''
          }
        }
      };
      PromiseAjax.post(url, {'validated': true}, order).then(function(response) {
        var hash = response.getResponseJson().hash;
        console.log('Place order successfully. Transaction hash: ' + hash);
        console.log('Getting latest orders...');
        me.getOrders();
      }, me.handleError_.bind(me));
    } else {
       me.resumeHandleReadline_();
    }
  });
};

RippleCLI.prototype.cancelOrder = function(sequence) {
  this.pauseHandleReadline_();
  var url = StringUtils.formatString(API.CANCEL_ORDER.url, {
    'address': this.account_,
    'sequence': sequence
  });

  var me = this;
  PromiseAjax.send('DELETE', url, {'validated': true}, null, {
    'secret': this.secret_
  }).then(function(response) {
    console.log('Cancel order successfully: ' + sequence + '. Getting latest orders...');
    me.getOrders();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.retrieveTransaction = function(hash) {
  this.pauseHandleReadline_();
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
    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.listAccounts = function() {
  // TODO
};

RippleCLI.prototype.changeAccount = function(address, secret) {
  // TODO
};

RippleCLI.prototype.showHelp = function() {
  console.log('Commands:');
  console.log('  new-wallet');
  console.log('  get-balance');
  console.log('  get-trustlines');
  console.log('  grant-trustline <issuer> <currency> <limit> [ --allow-rippling ]');
  console.log('  send <destination> <amount+currency+issuer> [ --source-tag=<source_tag> ] [ --destination-tag=<destination_tag> ] [ --invoice-id=<invoice_id> ]');
  console.log('  send-to-bridge <destination> <amount>')
  console.log('  get-payment <resource_id>');
  console.log('  get-payments');
  console.log('  get-orders');
  console.log('  place-order <type> <amount1+currency1+issuer1> <amount2+currency2+issuer2>');
  console.log('  cancel-order <sequence>');
  console.log('  get-transaction <hash>');
  console.log('  list-accounts');
  console.log('  change-account <address> <secret>');
  console.log('  exit');
};

RippleCLI.prototype.exit = function() {
  console.log('Good bye!');
  process.exit(0);
};

module.exports = RippleCLI;
