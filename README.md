# ripple-commander
A command line client for ripple trading.  
If you appreciate the work, welcome donate some xrp to `rscxz5PqRrmUaMigyb1mP32To1rQDygxAq` .

## Usage
1. Install nodejs (>=0.4.0).
2. Checkout out the source code.

        git clone https://github.com/kuyur/ripple-commander.git

3. Download necessary node modules.

        npm install

4. Run commander. Account (ripple address) and secret will be required for the first time.

        node start-commander.js

5. Type **help** to see available commands. Press **Ctrl+C** to exit.

## Commands
**Generate a new wallet**

        new-wallet

**Get balance of current wallet**

        get-balance

**Get trustlines of current wallet**

        get-trustlines

**Grant or remove a trustline**, set limit to 0 for removing.

        grant-trustline <issuer> <currency> <limit> [ --allow-rippling ]

**Send money**

        send <destination> <amount+currency+issuer> [ --source-tag=<source_tag> ] [ --destination-tag=<destination_tag> ] [ --invoice-id=<invoice_id> ]

**Send money to bridge**, for example `send-to-bridge zfb@ripplefox.com 100`, you will be asked for detail later.

        send-to-bridge <destination> <amount>

**Get payment detail**

        get-payment <resource_id>

**Get detail of recent payments**

        get-payments

**Get orders**

        get-orders

**Place an order**, type can be `sell` or `buy`.

        place-order <type> <amount1+currency1+issuer1> <amount2+currency2+issuer2>

**Cancel an order**

        cancel-order <sequence>

**Get transaction status**

        get-transaction <hash>

**Encrypt wallet**

        encrypt-wallet

**Decrypt wallet**

        decrypt-wallet

## Remain tasks

* Support multiple accounts and switching.
* Show order book of market.
* Command auto-complete.
* Pipe.
