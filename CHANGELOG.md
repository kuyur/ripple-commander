ripple-commander
================

###0.1.7
> * Enable user to override rest server host. 

###0.1.6

> * Bug fixed: Command will become non-responsive if user enters empty account or password for first login.

###0.1.5

> * (No significant changes)

###0.1.4

> * Command: `get-orderbook <currency1+issuer1> <currency2+issuer2> [ --limit=<limit> ]`
> * Command: `show-issuers [ --keyword=<issuer_name> ]`

###0.1.3

> * Implement ripple account management.
> * Command: `show-accounts [ --show-secret ]`
> * Command: `add-account [ <address> ]`
> * Command: `change-account [ <address> ]`
> * Command: `remove-account [ <address> ]`

###0.1.2

> * File for saving ripple account is changed from `account.txt` to `wallet.txt`.
> * Use AES to encrypt wallet file. (After encryption, `wallet.txt` will be deleted, and `wallet.dat` will be generated.)
> * Command: `encrypt-wallet`
> * Command: `decrypt-wallet`

###0.1.1

> * (No significant changes)

###0.1.0

> * Query available payment paths.
> * Command (finished): `send-to-bridge <destination> <amount>`

###0.0.2

> * Use `validated` flag of Ripple REST apis.
> * Command: `send <destination> <amount+currency+issuer> [ --source-tag=<source_tag> ] [ --destination-tag=<destination_tag> ] [ --invoice-id=<invoice_id> ]`
> * Command (not finished): `send-to-bridge <destination> <amount>`
> * Command removed: `pay <destination> <currency+issuer> <amount>`
> * Command updated: `place-order <type> <amount1+currency1+issuer1> <amount2+currency2+issuer2>`

###0.0.1

> * First release.
> * Command: `new-wallet`
> * Command: `get-balance`
> * Command: `get-trustlines`
> * Command: `grant-trustline <issuer> <currency> <limit> [ --allow-rippling ]`
> * Command: `pay <destination> <currency+issuer> <amount>`
> * Command: `get-payment <resource_id>`
> * Command: `get-payments`
> * Command: `get-orders`
> * Command: `place-order <type> <currency+issuer> <amount> <currency+issuer> <amount>`
> * Command: `cancel-order <sequence>`
> * Command: `get-transaction <hash>`
