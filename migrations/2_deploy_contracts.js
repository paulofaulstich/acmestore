const RewardToken = artifacts.require("RewardToken");
const Marketplace = artifacts.require("Marketplace");

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(RewardToken, "Reward Token", "RT", 18, 1e9);
  await deployer.deploy(Marketplace, RewardToken.address);

  const token = await RewardToken.deployed();
  await token.addMinter(Marketplace.address);
};
