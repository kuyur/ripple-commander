
var fs = require('fs');
var readline = require('readline');
var Promise = require('promise');
var CryptoJS = require('crypto-js');
var FsUtils = require('./lib/fs-utils.js');
var ReadlineUtils = require('./lib/readline-utils.js');
var RippleCLI = require('./lib/ripple-cli.js');

var readline = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var promise, account, secret, password = null;

// try to load account/secret from wallet.dat first
promise = FsUtils.readFile('wallet.dat', 'binary');
promise = promise.then(function(data) {
  return ReadlineUtils.password(readline, 'Password for wallet.dat: ').then(function(answer) {
    password = answer;
    var bytes  = CryptoJS.AES.decrypt(data, password);
    var content = bytes.toString(CryptoJS.enc.Utf8);
    if (!content) {
      return Promise.reject('Password not correct. Try again or remove wallet.dat .');
    } else {
      return content;
    }
  });
}, function(err) {
  // load account/secret from wallet.txt if wallet.dat is not existed
  return FsUtils.readFile('wallet.txt', 'binary').then(function(data2) {
    return data2;
  }, function(err2) {
    // no wallet.dat nor wallet.txt existed
    return Promise.resolve(null);
  });
});

promise = promise.then(function(content) {
  if (content) {
    // read main account from the top line
    var arr = content.replace(/\r\n/g, '\n').split('\n');
    for (var i = 0, len = arr.length; i < len; ++i) {
      var line = arr[i];
      if (line) {
        var segs = line.split(',');
        if (segs[0] && segs[0].indexOf('address=') === 0) {
          account = segs[0].substring('address='.length);
        }
        if (segs[1] && segs[1].indexOf('secret=') === 0) {
          secret = segs[1].substring('secret='.length);
        }
        break;
      }
    }
    if (!account || !secret) {
      console.log('No account and secret pair found at ' + (password != null ? 'wallet.dat' : 'wallet.txt'));
    }
  }
  if (!account || !secret) {
    return ReadlineUtils.question(readline, 'Ripple Account: ').then(function(answer) {
      account = answer;
      return ReadlineUtils.password(readline, 'Ripple Secret : ');
    }).then(function(answer) {
      secret = answer;
      console.log('Saving to ' + (password != null ? 'wallet.dat' : 'wallet.txt') + ' ...');
      saveAccount(account, secret, password);
    });
  }
});

promise.then(function() {
  new RippleCLI({
    account: account,
    secret: secret,
    password: password,
    readline: readline
  }).start();
}, function(err) {
  console.log(err);
  process.exit(0);
});

function saveAccount(account, secret, password) {
  var path = password != null ? 'wallet.dat' : 'wallet.txt';
  var buffer = new Buffer('address=' + account + ',secret=' + secret + '\n', 'binary');
  if (password != null) {
    buffer = CryptoJS.AES.encrypt(buffer, password).toString();
  }
  fs.open(path, 'w+', function(err, fd) {
    fs.write(fd, buffer, 0, buffer.length, 0, function() {
      fs.close(fd);
    });
  });
}
