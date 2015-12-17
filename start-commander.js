
var fs = require('fs');
var readline = require('readline');
var RippleCLI = require('./lib/ripple-cli.js');

var account, secret;
// load from file
try {
  var fsBuffer = fs.readFileSync('account.txt', 'binary');
  var arr = fsBuffer.split('\n');
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
} catch (e) {
  // 
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function saveAccount(account, secret) {
  var buffer = new Buffer('address=' + account + ',secret=' + secret, 'binary');
  fs.open('account.txt', 'a', function(err, fd) {
    fs.write(fd, buffer, 0, buffer.length, null, function() {
      fs.close(fd);
    });
  });
}

if (account && secret) {
  var cli = new RippleCLI({
    account: account,
    secret: secret
  });
  cli.start(rl);
} else {
  rl.question('Ripple Account:', function(answer) {
    account = answer;
    rl.question('Ripple Secret:', function(answer) {
      secret = answer;
      saveAccount(account, secret);
      var cli = new RippleCLI({
        account: account,
        secret: secret
      });
      cli.start(rl);
    });
  });
}
