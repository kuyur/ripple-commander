/**
 * @authro kuyur@kuyur.info
 */

var chars = {
  'top': '-' ,
  'top-mid': '-' ,
  'top-left': '-' ,
  'top-right': '-',
  'bottom': '-',
  'bottom-mid': '-',
  'bottom-left': '-',
  'bottom-right': '-',
  'left': '|',
  'left-mid': '|',
  'mid': '-',
  'mid-mid': '|',
  'right': '|',
  'right-mid': '|',
  'middle': '|'
};

var tables = {
  'trustline': {
    chars: chars
  },
  'balance': {
    chars: chars,
    head: ['Currency', 'Value', 'Issuer Address', 'Issuer'],
    colWidths: [10, 20, 40, 20],
    colAligns: ['left', 'right', 'left', 'left']
  }
};

exports.TABLES = tables;
