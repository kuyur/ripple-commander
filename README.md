# ripple-commander
A command line tool for ripple trading.

## Usage
1. Install nodejs (>=0.4.0).
2. Checkout out the source code.

        git clone https://github.com/kuyur/ripple-commander.git

3. Download necessary node modules.

        npm install

4. Run commander.

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

        pay <destination> <currency+issuer> <amount>

**Get payment detail**

        get-payment <resource_id>

**Get detail of recent payments**

        get-payments

**Place an order**, type can be `sell` or `buy`.

        place-order <type> <currency+issuer> <amount> <currency+issuer> <amount>

**Cancel an order**

        cancel-order <sequence>

**Get transaction status**

        get-transaction

