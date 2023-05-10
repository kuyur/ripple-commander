/**
 * @authro kuyur@kuyur.net
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
    chars: chars,
    head: ['Currency', 'Limit', 'Allow Rippling', 'Issuer Address', 'Issuer'],
    colWidths: [10, 20, 16, 40, 20],
    colAligns: ['left', 'right', 'middle', 'left', 'left']
  },
  'balance': {
    chars: chars,
    head: ['Currency', 'Value', 'Issuer Address', 'Issuer'],
    colWidths: [10, 20, 40, 20],
    colAligns: ['left', 'right', 'left', 'left']
  },
  'order': {
    chars: chars,
    head: ['Sequence', 'Type', 'Value', 'Currency', '', 'Value', 'Currency', 'Price'],
    colWidths: [10, 6, 20, 20, 6, 20, 20, 24],
    colAligns: ['left', 'left', 'right', 'left', 'middle', 'right', 'left', 'right']
  },
  'payment': {
    chars: chars,
    head: ['Timestamp', 'Type', 'Amount', 'Currency', 'Issuer Address', 'Issuer', '', 'Address', 'Success'],
    colWidths: [22, 10, 20, 10, 40, 20, 6, 40, 10],
    colAligns: ['left', 'middle', 'right', 'left', 'left', 'left', 'middle', 'left', 'middle']
  },
  'pre_payment': {
    chars: chars,
    head: ['No.', 'Amount', 'Currency', 'Issuer Address', 'Issuer'],
    colWidths: [10, 20, 20, 40, 20],
    colAligns: ['middle', 'right', 'left', 'left', 'left']
  },
  'account': {
    chars: chars,
    head: ['No.', 'Address', 'Secret'],
    colWidths: [10, 40, 40],
    colAligns: ['left', 'left', 'left']
  },
  'orderbook': {
    chars: chars,
    head: ['Total (Bids)', 'Size (Bids)', 'Price (Bids)', 'Price (Asks)', 'Size (Asks)', 'Total (Asks)'],
    colWidths: [20, 20, 20, 20, 20, 20],
    colAligns: ['right', 'right', 'right', 'right', 'right', 'right']
  },
  'issuer': {
    chars: chars,
    head: ['Issuer Name', 'Issuer Address'],
    colWidths: [40, 40],
    colAligns: ['left', 'left']
  }
};

exports.TABLES = tables;
