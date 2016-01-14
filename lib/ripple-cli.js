/**
 * @author kuyur@kuyur.info
 */

var fs = require('fs');
var Promise = require('promise');
var Table = require('cli-table');
var readline = require('readline');
var CryptoJS = require('crypto-js');
var StringUtils = require('./string-utils.js');
var DateUtils = require('./date-utils.js');
var NumberUtils = require('./number-utils.js');
var AjaxUtils = require('./ajax-utils.js');
var FunctionUtils = require('./function-utils.js');
var ReadlineUtils = require('./readline-utils.js');
var PromiseAjax = require('./promise-ajax.js');
var FsUtils = require('./fs-utils.js');
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
  this.password_ = options.password;
  this.tables_ = {};
  this.readline_ = options.readline || readline.createInterface({
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
RippleCLI.prototype.password_;

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
      me.rippleName_ = null;
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
  } else if (line === 'encrypt-wallet') {
    this.encryptWallet();
  } else if (line === 'decrypt-wallet') {
    this.decryptWallet();
  } else if (line === 'help') {
    this.showHelp();
  } else if (line === 'exit') {
    this.exit();
  } else if (StringUtils.startsWith(line, 'grant-trustline')) {
    params = line.split(/\s+/).slice(1);
    this.grantTrustLine(params[0], params[1], params[2], params[3] === '--allow-rippling');
  } else if (StringUtils.startsWith(line, 'send-to-bridge')) {
    params = line.split(/\s+/).slice(1);
    this.sendToBridge.apply(this, params);
  } else if (StringUtils.startsWith(line, 'send')) {
    params = line.split(/\s+/).slice(1);
    var source_tag, destination_tag, invoice_id;
    for (var i = params.length - 1; i >= 2; --i) {
      var param = params[i];
      if (StringUtils.startsWith(param, '--source-tag=')) {
        source_tag = param.substring(13);
      } else if (StringUtils.startsWith(param, '--destination-tag=')) {
        destination_tag = param.substring(18);
      } else if (StringUtils.startsWith(param, '--invoice-id=')) {
        invoice_id = param.substring(13);
      }
    }
    this.sendMoney(params[0], params[1], source_tag, destination_tag, invoice_id);
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
  } else if (StringUtils.startsWith(line, 'show-accounts')) {
    params = line.split(/\s+/).slice(1);
    this.listAccounts(params[0] === '--show-secret');
  } else if (StringUtils.startsWith(line, 'add-account')) {
    params = line.split(/\s+/).slice(1);
    this.addAccount.apply(this, params);
  } else if (StringUtils.startsWith(line, 'change-account')) {
    params = line.split(/\s+/).slice(1);
    this.changeAccount.apply(this, params);
  } else if (StringUtils.startsWith(line, 'remove-account')) {
    params = line.split(/\s+/).slice(1);
    this.removeAccount.apply(this, params);
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
      table.push([obj.currency, NumberUtils.round(obj.value, 8), obj.counterparty, getIssuerName(obj.counterparty)]);
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
      var price = NumberUtils.round(takerPay.value / takerGet.value, 8) + ' ' +  takerPay.currency + ' per ' + takerGet.currency;
      table.push([obj.sequence, obj.type, takerGet.value, takerGetCurrency,
        obj.type === 'sell' ? 'for' : 'with',
        takerPay.value, takerPayCurrency, price]);
    });
    console.log('ledger:' + res.ledger);
    console.log(table.toString());
    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.grantTrustLine = function(issuer, currency, limit, allowRippling) {
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
      account_allows_rippling: !!allowRippling
    }
  };

  var me = this;
  PromiseAjax.post(url, {'validated': true}, postObject).then(function(response) {
    console.log('Grant trustline successfully. Getting latest trustlines...');
    me.getTrustLines();
  }, me.handleError_.bind(me));
};

/**
 * send <destination> <amount+currency+issuer> [ --source-tag=<source_tag> ] [ --destination-tag=<destination_tag> ] [ --invoice-id=<invoice_id> ]'
 * @param {string} destination Ripple address.
 * @param {string} amount Amount combined with currency and issuer. Pattern: amount+currency+issuer .
 * @param {(string|number)=} opt_source_tag Optional.
 * @param {(string|number)=} opt_destination_tag Optional.
 * @param {string=} opt_invoice_id Optional.
 * @see https://ripple.com/build/ripple-rest/#submit-payment
 */
RippleCLI.prototype.sendMoney = function(destination, amount, opt_source_tag, opt_destination_tag, opt_invoice_id) {
  this.pauseHandleReadline_();
  console.log('Querying payment path...');
  var queryUrl = StringUtils.formatString(API.PREPARE_PAYMENT.url, {
    'address': this.account_,
    'destination_account': destination,
    'destination_amount': amount
  });
  var me = this;
  var promise = PromiseAjax.get(queryUrl).then(function(response) {
    var payments = response.getResponseJson().payments;
    var table = me.getTable_('pre_payment');
    table.length = 0;
    payments.forEach(function(payment, i) {
      table.push([i + 1, NumberUtils.round(payment.source_amount.value, 8), payment.source_amount.currency, payment.source_amount.issuer, getIssuerName(payment.source_amount.issuer)]);
    });
    console.log('Available payments choice:');
    console.log(table.toString());
    return ReadlineUtils.question(me.readline_, 'Your choice (No.): ').then(function(answer) {
      answer = +answer;
      if (isNaN(answer) || answer > payments.length || answer <= 0) {
        return Promise.reject('Payment has been canceled.');
      }
      return {
        'payment': payments[answer - 1]
      };
    });;
  });
  
  promise = promise.then(function(obj) {
    console.log('Sending payment...');
    return PromiseAjax.get(API.UUID.url).then(function(response) {
      obj['uuid'] = response.getResponseJson().uuid;
      return obj;
    });
  });

  promise = promise.then(function(obj) {
    var payment = obj['payment'];
    payment.source_tag = opt_source_tag != null ? String(opt_source_tag) : '';
    payment.destination_tag = opt_destination_tag != null ? String(opt_destination_tag) : '';
    payment.invoice_id = opt_invoice_id != null ? String(opt_invoice_id) : '';
    var sendObject = {
      secret: me.secret_,
      client_resource_id: obj['uuid'],
      payment: payment
    };
    
    // submit payment
    var url = StringUtils.formatString(API.SUBMIT_PAYMENT.url, {
      'address': me.account_
    });
    return PromiseAjax.post(url, {'validated': true}, sendObject);
  });

  promise.then(function(response) {
    var res = response.getResponseJson();
    console.log('Send payment successfully. Transaction hash: ' + res.hash);
    console.log('Getting payment detail...')
    me.retrievePayment(res.hash);
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

  // get correct federation_url first
  var gatewayUrl = StringUtils.formatString(API.GATEWAY_INFO.url, {
    'domain': domain
  });
  var promise = PromiseAjax.get(gatewayUrl).then(function(response) {
    var content = response.getResponseText();
    content = content.replace(/\r\n/g, '\n');
    var parts = content.split('\n');
    var hit = false, federation_url;
    for (var i = 0, len = parts.length; i < len; ++i) {
      var line = parts[i];
      if (line === '[federation_url]') {
        hit = true;
        continue;
      }
      if (hit && line !== '') {
        federation_url = line;
        break;
      }
    }
    if (!federation_url) {
      return Promise.reject('federation_url not found at ' + gatewayUrl);
    } else {
      return federation_url;
    }
  });

  promise = promise.then(function(federation_url) {
    var bridgeUrl = StringUtils.formatString(API.BRIDGE.url, {
      'federation_url': federation_url,
      'domain': domain,
      'destination': dest
    });
    return PromiseAjax.get(bridgeUrl).then(function(response) {
      var res = response.getResponseJson();
      if (res.result !== 'success') {
        return Promise.reject(JSON.stringify(res, null, 2));
      }
      var federation = res.federation_json;
      return {
        federation_url: federation_url,
        currency: federation.currencies[0].currency,
        issuer: federation.currencies[0].issuer,
        fields: federation.extra_fields || []
      };
    });
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
      'federation_url': obj.federation_url,
      'domain': domain,
      'destination': dest,
      'amount': amount + encodeURIComponent('/') + obj.currency,
      'address': me.account_
    });
    return PromiseAjax.get(quoteUrl, obj.answers);
  });

  promise.then(function(response) {
    var res = response.getResponseJson();
    if (res.result === 'success') {
      var quote = res.quote;
      var amount = quote.send[0].value + '+' + quote.send[0].currency + '+' + quote.send[0].issuer;
      me.sendMoney(quote.destination_address, amount, null, quote.destination_tag, quote.invoice_id);      
    } else {
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
 * @param {string} type Must be 'sell' or 'buy'.
 * @param {string} amount1 Amount combined with currency and issuer. Pattern: amount+currency+issuer .
 * @param {string} amount2 Amount combined with currency and issuer. Pattern: amount+currency+issuer .
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

RippleCLI.prototype.listAccounts = function(showSecret) {
  this.pauseHandleReadline_();

  try {
    var accounts = this.readAccountList_();
    var table = this.getTable_('account');
    table.length = 0;
    var me = this;
    accounts.forEach(function(obj, i) {
      var index = String(i + 1);
      if (obj.account === me.account_) {
        index += ' *';
      }
      table.push([index, obj.account, showSecret ? obj.secret : StringUtils.repeat('*', obj.secret.length)]);
    });
    console.log(table.toString());
  } catch (e) {
    console.log(e);
  } finally {
    this.resumeHandleReadline_();
  }
};

/**
 * @private
 */
RippleCLI.prototype.readAccountList_ = function() {
  var content;
  if (this.password_ != null) {
    var data = fs.readFileSync('wallet.dat', 'binary');
    var bytes  = CryptoJS.AES.decrypt(data, this.password_);
    content = bytes.toString(CryptoJS.enc.Utf8);
  } else {
    content = fs.readFileSync('wallet.txt', 'binary');
  }
  var arr = content.replace(/\r\n/g, '\n').split('\n');
  var line, account, secret;
  var result = [];
  for (var i = 0, len = arr.length; i < len; ++i) {
    line = arr[i];
    if (line) {
      var segs = line.split(',');
      if (segs[0] && segs[0].indexOf('address=') === 0) {
        account = segs[0].substring('address='.length);
      }
      if (segs[1] && segs[1].indexOf('secret=') === 0) {
        secret = segs[1].substring('secret='.length);
      }
      if (account && secret) {
        result.push({
          'account': account,
          'secret': secret
        });
      }
    }
  }

  return result;
};

RippleCLI.prototype.addAccount = function(address) {
  this.pauseHandleReadline_();
  var promise;
  if (!address) {
    promise = ReadlineUtils.question(this.readline_, 'Ripple Account: ');
  } else {
    promise = Promise.resolve(address);
  }
  var me = this;
  promise = promise.then(function(address) {
    return ReadlineUtils.password(me.readline_, 'Ripple Secret : ').then(function(answer) {
      return {
        'account': address,
        'secret': answer
      };
    });
  });
  promise = promise.then(function(obj) {
    try {
      var accounts = me.readAccountList_();
      var content = accounts.reduce(function(str, pair) {
        if (pair.account === obj.account) {
          throw 'Already existing a same account in wallet.';
        }
        return str += 'address=' + pair.account + ',secret=' + pair.secret + '\n';
      }, '');
      content += 'address=' + obj.account + ',secret=' + obj.secret + '\n';
      // save to file
      if (me.password_ != null) {
        var ciphertext = CryptoJS.AES.encrypt(content, me.password_).toString();
        fs.writeFileSync('wallet.dat', ciphertext, {flag: 'w+'});
      } else {
        fs.writeFileSync('wallet.txt', content, {flag: 'w+'});
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  });
  promise.then(function() {
    console.log('Writing to ' + (me.password_ != null ? 'wallet.dat' : 'wallet.txt') + ' finished.');
    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.changeAccount = function(address) {
  this.pauseHandleReadline_();
  var promise;
  var me = this;
  try {
    var accounts = this.readAccountList_();
    if (accounts.length === 0) {
      promise = Promise.reject('There is no account in wallet.');
    } else {
      if (!address) {
        var table = this.getTable_('account');
        table.length = 0;
        accounts.forEach(function(obj, i) {
          var index = obj.account === me.account_ ? String(i + 1) + ' *' : String(i + 1);
          table.push([index, obj.account, StringUtils.repeat('*', obj.secret.length)]);
        });
        console.log(table.toString());
        promise = ReadlineUtils.question(this.readline_, 'Select the number (No.) for switching the activated account: ').then(function(answer) {
          answer = +answer;
          if (isNaN(answer) || answer <= 0 || answer > accounts.length) {
            return Promise.reject('Command has been canceled.');
          }
          return {
            'index': answer - 1,
            'accounts': accounts
          };
        });
      } else {
        var index = -1;
        for (var i = 0; i < accounts.length; ++i) {
          if (accounts[i].account === address) {
            index = i;
            break;
          }
        }
        if (index === -1) {
          promise = Promise.reject('No account found in wallet: ' + address);
        } else {
          promise = Promise.resolve({
            'index': index,
            'accounts': accounts
          });
        }
      }
    }
  } catch (e) {
    promise = Promise.reject(e);
  }

  promise.then(function(obj) {
    // change orders
    var accounts = obj.accounts, index = obj.index, account = accounts[index];
    accounts.splice(index, 1);
    accounts.splice(0, 0, account);
    // save to wallet
    var content = accounts.reduce(function(str, pair) {
      return str += 'address=' + pair.account + ',secret=' + pair.secret + '\n';
    }, '');
    if (me.password_ != null) {
      var ciphertext = CryptoJS.AES.encrypt(content, me.password_).toString();
      fs.writeFileSync('wallet.dat', ciphertext, {flag: 'w+'});
    } else {
      fs.writeFileSync('wallet.txt', content, {flag: 'w+'});
    }
    me.account_ = account.account;
    me.secret_ = account.secret;
    console.log('Changing to ' + me.account_ + '. Getting RippleName...');
    var url = StringUtils.formatString(API.USER_INFO.url, {
      'address': me.account_
    });
    PromiseAjax.get(url).then(function(res) {
      res = res.getResponseJson();
      if (res['exists']) {
        me.rippleName_ = res['username'];
      } else {
        me.rippleName_ = null;
        console.log('RippleName not found.');
      }
      me.prompt_ = me.rippleName_ ? '~' + me.rippleName_ + '> ' : me.account_ + '> ';
      me.resumeHandleReadline_();
    }, function(error) {
      console.log(error);
      me.prompt_= me.account_ + '> ';
      me.resumeHandleReadline_();
    });
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.removeAccount = function(address) {
  this.pauseHandleReadline_();
  var promise;
  var me = this;
  if (address === this.account_) {
    promise = Promise.reject('Can not remove the account in using. Please change the activated account first.');
  } else {
    try {
      var accounts = this.readAccountList_();
      if (accounts.length === 0) {
        promise = Promise.reject('There is no account in wallet.');
      } else {
        if (!address) {
          var table = this.getTable_('account');
          table.length = 0;
          accounts.forEach(function(obj, i) {
            var index = obj.account === me.account_ ? String(i + 1) + ' *' : String(i + 1);
            table.push([index, obj.account, StringUtils.repeat('*', obj.secret.length)]);
          });
          console.log(table.toString());
          promise = ReadlineUtils.question(this.readline_, 'Select the number (No.) for removing: ').then(function(answer) {
            answer = +answer;
            if (isNaN(answer) || answer <= 0 || answer > accounts.length) {
              return Promise.reject('Command has been canceled.');
            }
            return {
              'index': answer - 1,
              'accounts': accounts
            };
          });
        } else {
          var index = -1;
          for (var i = 0; i < accounts.length; ++i) {
            if (accounts[i].account === address) {
              index = i;
              break;
            }
          }
          if (index === -1) {
            promise = Promise.reject('No account found in wallet: ' + address);
          } else {
            promise = Promise.resolve({
              'index': index,
              'accounts': accounts
            });
          }
        }
      }
    } catch (e) {
      promise = Promise.reject(e);
    }
  }

  promise.then(function(obj) {
    var accounts = obj.accounts, index = obj.index, account = accounts[index];
    if (account.account === me.account_) {
      console.log('Can not remove the account in using. Please change the activated account first.');
      me.resumeHandleReadline_();
    } else {
      accounts.splice(index, 1);
      // save to wallet
      var content = accounts.reduce(function(str, pair) {
        return str += 'address=' + pair.account + ',secret=' + pair.secret + '\n';
      }, '');
      if (me.password_ != null) {
        var ciphertext = CryptoJS.AES.encrypt(content, me.password_).toString();
        fs.writeFileSync('wallet.dat', ciphertext, {flag: 'w+'});
      } else {
        fs.writeFileSync('wallet.txt', content, {flag: 'w+'});
      }
      console.log('Account ' + account.account + ' had been removed from wallet.');
      me.resumeHandleReadline_();
    }
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.encryptWallet = function() {
  this.pauseHandleReadline_();

  var me = this;
  if (me.password_ != null) {
    ReadlineUtils.question(me.readline_, 'wallet.dat is already encrypted. Are you sure to encrypt with a new password? [y/n] ').then(function(answer) {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        me.encryptWallet_();
      } else {
        me.resumeHandleReadline_();
      }
    });
  } else {
    me.encryptWallet_();
  }
};

/**
 * @private
 */
RippleCLI.prototype.encryptWallet_ = function() {
  // read content of previous wallet.dat or wallet.txt
  var path = this.password_ != null ? 'wallet.dat' : 'wallet.txt';
  var promise = FsUtils.readFile(path, 'binary');
  var me = this;
  promise = promise.then(function(data) {
    if (me.password_ != null) {
      var bytes  = CryptoJS.AES.decrypt(data, me.password_);
      var content = bytes.toString(CryptoJS.enc.Utf8);
      if (!content) {
        return Promise.reject('Password not correct for wallet.dat. Exit and try again.');
      } else {
        return content;
      }
    } else {
      return data;
    }
  });
  promise = promise.then(function(data) {
    return ReadlineUtils.password(me.readline_, 'Password for wallet.dat: ').then(function(answer) {
      // encrypt wallet.dat
      var ciphertext = CryptoJS.AES.encrypt(data, answer).toString();
      try {
        fs.writeFileSync('wallet.dat', ciphertext, {flag: 'w+'});
        me.password_ = answer;
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    });
  });
  promise.then(function() {
    // remove wallet.txt
    try {
      fs.unlinkSync('wallet.txt');
    } catch(e) {}
    console.log('Writing to wallet.dat finished.');
    me.resumeHandleReadline_();
  }, me.handleError_.bind(me));
};

RippleCLI.prototype.decryptWallet = function() {
  this.pauseHandleReadline_();

  if (this.password_ != null) {
    var promise = FsUtils.readFile('wallet.dat', 'binary');
    var me = this;
    promise = promise.then(function(data) {
      var bytes  = CryptoJS.AES.decrypt(data, me.password_);
      var content = bytes.toString(CryptoJS.enc.Utf8);
      if (!content) {
        return Promise.reject('Password not correct for wallet.dat. Exit and try again.');
      } else {
        return content;
      }
    });
    promise = promise.then(function(data) {
      try {
        fs.writeFileSync('wallet.txt', data, {flag: 'w+'});
        me.password_ = null;
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    });
    promise.then(function() {
      // remove wallet.dat
      try {
        fs.unlinkSync('wallet.dat');
      } catch(e) {}
      console.log('Writing to wallet.txt finished.');
      me.resumeHandleReadline_();
    }, me.handleError_.bind(me));
  } else {
    console.log('Wallet is not encrypted.');
    this.resumeHandleReadline_();
  }
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
  console.log('  show-accounts [ --show-secret ]');
  console.log('  add-account [ <address> ]');
  console.log('  change-account [ <address> ]');
  console.log('  remove-account [ <address> ]');
  console.log('  encrypt-wallet');
  console.log('  decrypt-wallet');
  console.log('  exit');
};

RippleCLI.prototype.exit = function() {
  console.log('Good bye!');
  process.exit(0);
};

module.exports = RippleCLI;
