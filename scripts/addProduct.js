const Marketplace = artifacts.require("Marketplace");

// Rinkeby
//truffle exec scripts/addProduct.js <price> <amount> <rewards> --network rinkeby

// Ganache
//truffle exec scripts/addProduct.js <price> <amount> <rewards>

module.exports = async callback => {
  try {
    market = await Marketplace.deployed();

    const price = process.argv[4];
    const amount = process.argv[5];
    const rewards = process.argv[6];

    const tx = await market.newProduct(
      web3.utils.toWei(price),
      amount,
      rewards
    );

    console.log(`Product #${tx.logs[0].args.productId.toNumber()} Added`);

    callback();
  } catch (e) {
    callback(e);
  }
};
