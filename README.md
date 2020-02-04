# My Acme Store

My Acme Store is a simple market place in Ethereum that allows users to buy products using Ether and earn Tokens (ERC20 tokens (RT)) as rewards for each purchase. Clients can add new products to the Marketplace (for the prupose of this Project, products were added beforehand), specifying amount to sell (inventory) price and Reward Tokens to give away to the buyer for each product bought. Buyers can also buy products, specifying the amount and product Id. Buyer pay for products in Ether, and for each sale, there is a fee sent to the owner of the marketplace and the rest to the client (seller).

## Installing/Deployment

This processs assumes you have node.js and npm installed on your pc.

### Ganache (development)

1. Make sure you have truffle and ganache-cli installed, if you don't, run the commands below in your terminal to install. If you have them installed go to the step 2.

```
npm install -g truffle
npm install -g ganache-cli
```

2. Install node modules both in `root` and `client` folder, by running `npm install`

3. Use Ganache CLI to run the local blockchain, by executing (on a separate terminal) `npm run chain`. Ganache will print the mnemonic used to generate the first 10 addresses on the network, all of which will start with a hefty amount of Ether. Make sure to store this mnemonic, since it will be later needed by your Ethereum browser to use these addresses.

4. Run your migrations with the following command `truffle migrate`. This will run all migrations located within your project's migrations directory

5. In client folder, make sure you have `serve` package installed, run `npm run serve`, otherwise run `npm i serve -g` first and then run `npm run serve` to start the development server.

6. Open app in your browser, navigating to `http://localhost:5000` or to the port specified in your terminal

### Rinkeby

1. Create `.env` file in the solidity folder, and paste your mnemonics and [infura](https://infura.io/) key according to the `.env.sample` file provided. You can retrieve your mnemonics from the metamask seed phrase. The first account in your metamask account must contain test rinkeby ether.

2. If you don't have Rinkeby Test Ether, go to [faucet](https://faucet.rinkeby.io/) to get some.

Note: If you want to use already deployed contracts (check `deployed_addresses.txt`), you just need to run the app by opening `https://acmestore.netlify.com/` in your browser, and be sure to switch to the Rinkeby Network on Metamask.

3. Deploy contracts to Rinkeby by running `npm run deploy-rink`.

4. In client folder, make sure you have `serve` package installed (run `npm i serve -g` otherwise) and run `npm run serve` to run development server.

5. Open app in your browser, navigating to `http://localhost:5000` or to the port specified in your terminal

note: if you need to add products to the app, you can run the following command, specifying the price (i.e 0.1), amount to create and reward tokens

`truffle exec scripts/addProduct.js <price> <amount> <rewards> --network rinkeby`

## Running the tests

There are two test written in javascript, one for the token contract and one for the marketplace logic. To run the tests, make sure you have ganache-cli and truffle installed and run these commands from the root folder:

```
npm run chain
truffle test
```

### Marketplace Tests

`npm run test-market`

This test file checks for:

1. Correct deployment details
2. Access Restrictions
3. Contract emergency break
4. Product adding and buying
5. Correct distribution of funds after a sale

### RewardToken Tests

`npm run test-token`

This test file checks for:

1. Correct deployment details (symbo, name, decimals, supply)
2. Successful transfer of tokens
3. User balances
4. Token Minting functionality

## Built With

- [React.js](https://reactjs.org/) - The web framework used
- [NPM](www.npmjs.com/‎) - Dependency Management
- [Solidity](https://solidity.readthedocs.io/en/v0.5.0/index.html) - Smart contract language
- [Truffle](https://www.trufflesuite.com/) - Smart contract testing framework

## Hosting App in IPFS

1. Install IPFS in your pc (MAC or LINUX)

```
tar xvfz go-ipfs.tar.gz
cd go-ipfs
./install.sh
```

2. Go to client folder and build the app with `npm run build`

3. Add build folder to IPFS running `ipfs add -r build`. If your ipfs is not running, first run `ipfs init` and then add the build folder again.

4. IPFS will deploy all files in build folder, each file will have its own hash, and at the end you will get something like:
   `added QmTVH3MTej9zB3ELAACGagE6C6976ha2yTFNftj5FeoCHu build`

5. Navigate to `https://ipfs.io/ipfs/<ipfs-build-hash>` to view your site

## Contributing

Please read [CONTRIBUTING.md](https://github.com/paulofaulstich/myacmestore/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/paulofaulstich/myacmestore/tags).

## Author

- **Paulo Faulstich** - _Initial work_ - [paulofaulstich](https://github.com/paulofaulstich/)

## License

This project is licensed under the MIT License - see the [MIT License](https://simple.wikipedia.org/wiki/MIT_License) file for details

## Acknowledgments

- Consensys Academy Team
