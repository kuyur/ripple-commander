/**
 * @author kuyur@kuyur.net
 * @see https://ripple.com/knowledge_center/gateway-information/
 */
var config = require('./ripple-config.js');
var ObjectUtils = require('./object-utils.js');
var StringUtils = require('./string-utils.js');

var trusted_issuers = {
  'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' : 'Bitstamp',
  'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y': 'RippleFox',
  'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA': 'RippleChina',
  'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK': 'RippleCN',
  'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN': 'TokyoJPY',
  'rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq': 'Gatehub',
  'raBDVR7JFq3Yho2jf7mcx36sjTwpRJJrGU': 'Bluzelle',
  'rBycsjqxD8RVZP5zrrndiVtJwht7Z457A8': 'Ripula',
  'rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun': 'TheRock',
  'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH': 'RippleSingapore',
  'r3ADD8kXSUKHd6zTCKfnKT3zV9EZHjzp1S': 'RippleUnion',
  'rPxU6acYni7FcXzPCMeaPSwKcuS2GTtNVN': 'eXRP',
  'rrh7rf1gV2pXAoqA8oYbpHd8TKv5ZQeo67': 'GoldBullionInternational',
  'rfNZPxoZ5Uaamdp339U9dCLWz2T73nZJZH': 'Rippex',
  'rNPRNzBB92BVpAhhZr4iXDTveCgV5Pofm9': 'Payroutes',
  'rBadiLisPCyqeyRA1ufVLv5qgVRenP2Zyc': 'PanamaBitcoins',
  'r9ZFPSb1TFdnJwbTMYHvVwFK1bQPUCVNfJ': 'ExchangeTokyo',
  'rUkMKjQitpgAM5WTGk79xpjT38DEJY283d': 'PaxMoneta',
  'rpDMez6pm6dBve2TJsmDpv7Yae6V5Pyvy2': 'LakeBTC',
  'rM1JztoSdHmX2EPnRGRYmKQvkxZ2hnrWsn': 'RippleCentral24',
  'rJRi8WW24gt9X85PHAxfWNPCizMMhqUQwg': 'RippleMarketJapan',
  'rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS': 'Mr.Ripple'
};

var issuers, issuersByName;

/**
 * Get Issuers list with issuer address as key.
 * @param {string=} opt_address_prefix Search by prefix, for example `rKi`. (for auto-complete)
 * @return {Object}
 */
exports.getIssuers = function(opt_address_prefix) {
  if (!issuers) {
    issuers = ObjectUtils.extend({}, trusted_issuers, ObjectUtils.getObjectByName('gateways', config) || {});
  }

  if (StringUtils.isString(opt_address_prefix)) {
    return ObjectUtils.filter(issuers, function(val, key) {
      return StringUtils.startsWith(val, opt_address_prefix);
    });
  } else {
    return issuers;
  }
};

/**
 * Get issuer name by address.
 * @param {string} address
 * @return {string}
 */
exports.getIssuer = function(address) {
  var map = exports.getIssuers();
  return map[address];
};

/**
 * Get Issuers list with issuer name as key.
 * @param {string=} opt_name_prefix Search by prefix, for example `RippleF`. (for auto-complete)
 * @return {Object}
 */
exports.getIssuersByName = function(opt_name_prefix) {
  if (!issuersByName) {
    issuersByName = ObjectUtils.transpose(exports.getIssuers());
  }

  if (StringUtils.isString(opt_name_prefix)) {
    return ObjectUtils.filter(issuersByName, function(val, key) {
      return StringUtils.startsWith(val, opt_name_prefix);
    });
  } else {
    return issuersByName;
  }
};

/**
 * Get issuer address by name.
 * @param {string} name
 * @return {string}
 */
exports.getIssuerByName = function(name) {
  var map = exports.getIssuersByName();
  return map[name];
};
