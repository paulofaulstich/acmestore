pragma solidity 0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";

/// @title ERC-20 token contract (RT) for Marketplace
/// @author paulofaulstich
contract RewardToken is ERC20Detailed, ERC20Mintable {
    /// @notice Initialize the token with name, symbol and decimals, then mint supply to creator
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _supply
    ) public ERC20Detailed(_name, _symbol, _decimals) {
        // Initial supply of 1M tokens are minted to owner (deployer)
        _mint(msg.sender, (_supply * (10**uint256(_decimals))));
    }

}
