const RewardToken = artifacts.require("RewardToken");
let catchRevert = require("./exceptionsHelpers.js").catchRevert;

// TOKEN DETAILS
const SUPPLY = 1e9;
const NAME = "Reward Token";
const SYMBOL = "RT";
const DECIMALS = 18;

contract("RewardToken", ([owner, user1, user2]) => {
  let instance;

  beforeEach(async () => {
    instance = await RewardToken.new(NAME, SYMBOL, DECIMALS, SUPPLY);
  });

  describe("Token::Deployment", () => {
    it("Correct Name", async () => {
      let x = await instance.name();
      assert.equal(x, NAME, "incorrect name");
    });

    it("Correct Symbol", async () => {
      let x = await instance.symbol();
      assert.equal(x, SYMBOL, "incorrect symbol");
    });

    it("Correct Decimals", async () => {
      let x = await instance.decimals();
      assert.equal(x.toNumber(), DECIMALS, "incorrect decimals");
    });

    it("Correct Supply", async () => {
      let totalSupply = await instance.totalSupply();
      totalSupply = totalSupply.toString() / 10 ** DECIMALS;
      assert.equal(totalSupply, SUPPLY, "incorrect supply");
    });
  });

  describe("Token::Balance", () => {
    it("Creator Balance should be total supply", async () => {
      let balance = await instance.balanceOf(owner);
      balance = balance.toString() / 10 ** DECIMALS;
      assert.equal(balance, SUPPLY, "incorrect balance of creator");
    });

    it("Should get Balance 0 for random Address", async () => {
      let balance = await instance.balanceOf(user1);
      assert.equal(balance.toString(), 0, "incorrect balance, should be 0");
    });

    it("Transfer and get new Balance", async () => {
      await instance.transfer(user2, "1000000000000", {
        from: owner
      });
      let balance = await instance.balanceOf(user2);
      assert.equal(
        balance.toString(),
        "1000000000000",
        "incorrect balance for user"
      );
    });
  });

  describe("Token::Minting", () => {
    it("Only Minter should be able to create new tokens", async () => {
      await instance.mint(user1, "100", { from: owner });
      const balance = await instance.balanceOf(user1);
      assert.equal(balance.toString(), "100", "incorrect balance for user");
    });
  });
});
