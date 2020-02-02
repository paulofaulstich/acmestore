const RewardToken = artifacts.require("RewardToken");
const Marketplace = artifacts.require("Marketplace");
let catchRevert = require("./exceptionsHelpers.js").catchRevert;

// TOKEN DETAILS
const SUPPLY = 1e9;
const NAME = "Reward Token";
const SYMBOL = "RT";
const DECIMALS = 18;

console.clear();

contract("Marketplace", ([owner, user1, user2, random, newOwner]) => {
  let token, market;

  beforeEach(async () => {
    token = await RewardToken.new(NAME, SYMBOL, DECIMALS, SUPPLY);
    market = await Marketplace.new(token.address);
    await token.addMinter(market.address);
  });

  describe("Marketplace::Access", () => {
    it("Correct owner address", async () => {
      const _owner = await market.owner();
      assert.equal(_owner, owner, "incorrect owner");
    });

    it("Correct token address", async () => {
      const _token = await market.token();
      assert.equal(_token, token.address, "incorrect token address");
    });

    it("Only owner can pause the contract", async () => {
      await catchRevert(market.toggleContractPaused({ from: random }));
      await market.toggleContractPaused({ from: owner });

      const isPaused = await market.contractPaused();
      assert.equal(isPaused, true, "contract is not paused");
    });

    it("Only owner can transfer ownership of the contract", async () => {
      await catchRevert(market.transferOwnership(newOwner, { from: random }));
      await market.transferOwnership(newOwner, { from: owner });

      const _newOwner = await market.owner();
      assert.equal(_newOwner, newOwner, "incorrect new owner");
    });
  });

  describe("Marketplace::Products", () => {
    it("Client can add a product to marketplace", async () => {
      const tx = await market.newProduct(web3.utils.toWei("0.1"), 1000, 1);

      let eventEmitted = false;
      if (tx.logs[0].event == "LogProductAdded") {
        eventEmitted = true;
      }
      assert.equal(
        tx.logs[0].args.productId.toNumber(),
        1,
        "incorrect product id"
      );
      assert.equal(
        tx.logs[0].args.quantity.toNumber(),
        1000,
        "incorrect quantity"
      );
      assert.equal(eventEmitted, true, "incorrect event name");
    });

    it("Client can buy a product to marketplace if correct amount is sent", async () => {
      await market.newProduct(web3.utils.toWei("0.1"), 1000, 1);

      await catchRevert(
        market.buyProduct(1, 100, {
          from: user1,
          value: web3.utils.toWei("0.5")
        })
      );

      const tx = await market.buyProduct(1, 100, {
        from: user1,
        value: web3.utils.toWei(String(100 * 0.1))
      });

      let eventEmitted = false;
      if (tx.logs[0].event == "LogProductSold") {
        eventEmitted = true;
      }
      assert.equal(
        tx.logs[0].args.productId.toNumber(),
        1,
        "incorrect product id"
      );
      assert.equal(tx.logs[0].args.buyer, user1, "incorrect buyer");
      assert.equal(eventEmitted, true, "incorrect event name");
    });

    it("Seller receives correct amount of ether on a sale", async () => {
      await market.newProduct(web3.utils.toWei("0.1"), 1000, 1, {
        from: user2
      });

      const initialBalance = await web3.eth.getBalance(user2);
      await market.buyProduct(1, 10, {
        from: user1,
        value: web3.utils.toWei(String(10 * 0.1))
      });

      const finalBalance = await web3.eth.getBalance(user2);

      assert.equal(
        Number(initialBalance) + web3.utils.toWei(String(10 * 0.1)) * 0.9,
        finalBalance
      );
    });

    it("Owner receives correct amount of fees on a sale", async () => {
      await market.newProduct(web3.utils.toWei("0.1"), 1000, 1, {
        from: user2
      });

      const initialBalance = await web3.eth.getBalance(owner);
      await market.buyProduct(1, 10, {
        from: user1,
        value: web3.utils.toWei(String(10 * 0.1))
      });

      const finalBalance = await web3.eth.getBalance(owner);

      assert.equal(
        Number(initialBalance) + web3.utils.toWei(String(10 * 0.1)) * 0.1,
        finalBalance
      );
    });

    it("Buyer receives correct amount of RT on a sale", async () => {
      await market.newProduct(web3.utils.toWei("0.1"), 1000, 1, {
        from: user2
      });
      await market.buyProduct(1, 10, {
        from: user1,
        value: web3.utils.toWei(String(10 * 0.1))
      });

      const balance = await token.balanceOf(user1);

      assert.equal(
        web3.utils.fromWei(balance.toString()),
        "10",
        "wrong amount of reward tokens sent"
      );
    });

    it("Can't add products in an emergency", async () => {
      await market.toggleContractPaused({ from: owner });
      await catchRevert(
        market.newProduct(web3.utils.toWei("0.1"), 1000, 1, {
          from: user2
        })
      );
    });

    it("Can't buy products in an emergency", async () => {
      await market.newProduct(web3.utils.toWei("0.1"), 1000, 1, {
        from: user2
      });
      await market.toggleContractPaused({ from: owner });
      await catchRevert(
        market.newProduct(web3.utils.toWei("0.1"), 1000, 1, {
          from: user2
        })
      );
    });

    it("Can't buy products if not enough available", async () => {
      await market.newProduct(web3.utils.toWei("0.1"), 1, 1, {
        from: user2
      });
      await catchRevert(
        market.buyProduct(1, 5, {
          from: user1,
          value: web3.utils.toWei(String(5 * 0.1))
        })
      );
    });
  });
});
