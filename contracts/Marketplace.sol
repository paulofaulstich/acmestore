pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./RewardToken.sol";

/// @title Marketplace and Reward System with ERC20 tokens (RT)
/// @author paulofaulstich
/// @notice Clients can add new products to the Marketplace, specifying amount to sell (inventory)
/// price and Reward tokens to send to the buyer for each product bought. Buyers can also buy
/// products, specifying the amount and product Id. For each sale, there is a fee sent to the owner
/// of the marketplace and the rest will go to the client (seller)
contract Marketplace is Ownable, ReentrancyGuard {
    // Use safemath for uint types
    using SafeMath for uint256;

    // === STATE VARIABLES ===

    // Fee collected by the owner
    uint256 public salesFee = 10; // 10% of sales

    // Instance of the Reward Token Contract
    RewardToken public token;

    // Used for emergency break
    bool public contractPaused;

    // Store the amount of items in the Marketplace
    uint256 public totalProducts;

    // Keep track of the item with key as product id
    mapping(uint256 => Product) public products;

    // Keep track fo the products and quantity owned by each buyer
    // buyer => productId => amountOwned
    mapping(address => mapping(uint256 => uint256)) public salesByUser;

    // Structure of a Product in the Marketplace
    struct Product {
        uint256 productId;
        uint256 price;
        uint256 quantity;
        uint256 tokenstoReward;
        address payable seller;
    }

    // === EVENTS ===
    event LogProductAdded(
        uint256 productId,
        uint256 price,
        uint256 quantity,
        address seller
    );

    event LogProductSold(
        uint256 productId,
        uint256 price,
        uint256 quantity,
        address indexed buyer
    );

    event LogProductUpdated(
        uint256 productId,
        uint256 price,
        uint256 quantity,
        uint256 tokensToReward
    );

    // === MODIFIERS ===
    /// @dev Only the seller for given product Id can call this function
    modifier onlySeller(uint256 productId) {
        require(
            msg.sender == products[productId].seller,
            "You are not the seller of this item"
        );
        _;
    }

    /// @dev Checks if enough funds where sent to the function
    modifier paidEnough(uint256 amountToPay) {
        require(msg.value >= amountToPay);
        _;
        uint256 amountToRefund = msg.value - amountToPay;
        safeTransfer(msg.sender, amountToRefund);

    }

    /// @dev Checks if there are enough products available in the inventory for this product id
    modifier onlyAvailable(uint256 productId, uint256 amountToBuy) {
        require(
            products[productId].quantity >= amountToBuy,
            "Not enough products available"
        );
        _;
    }

    /// @dev prevents functions to be executed
    modifier stopInEmergency {
        require(!contractPaused, "contract is paused");
        _;
    }

    // === MAIN FUNCTIONS ===

    /// @notice Initialize contract with default variables
    /// @dev Reward Token contract should be deployed first
    /// @param _token address of the Reward Token
    constructor(RewardToken _token) public {
        token = _token;
        totalProducts = 1;
    }

    /// @notice Emergency stop for most function in the contract
    function toggleContractPaused() external onlyOwner {
        contractPaused = !contractPaused;
    }

    /// @notice Update Reward Token contract address
    function updateTokenContract(RewardToken _token) external onlyOwner {
        token = _token;
    }

    /// @notice Update Reward Token contract address
    function updateSalesFee(uint256 _salesFee) external onlyOwner {
        salesFee = _salesFee;
    }

    /// @notice Emergency stop for most function in the contract
    /// @param to address to send funds to
    /// @param amount amount of wei to send
    function safeTransfer(address to, uint256 amount) internal {
        (bool success, ) = to.call.value(amount)("");
        require(success, "Transfer failed.");
    }

    /// @notice Add a new product to the Marketplace
    /// @dev for the purpose of this project, anyone can add an product
    /// @param _price price for an individual product
    /// @param _quantity amount of products to make available for sale
    /// @param _tokenstoReward amount of RT tokens to reward the buyer for product purchased
    /// @return true if transaction is successful
    function newProduct(
        uint256 _price,
        uint256 _quantity,
        uint256 _tokenstoReward
    ) external stopInEmergency returns (bool) {
        products[totalProducts] = Product({
            productId: totalProducts,
            price: _price,
            quantity: _quantity,
            tokenstoReward: _tokenstoReward,
            seller: msg.sender
        });

        totalProducts++;

        emit LogProductAdded(totalProducts - 1, _price, _quantity, msg.sender);
        return true;
    }

    /// @notice Update Existing product
    /// @dev can only be called by the seller of the product
    function updateProduct(
        uint256 productId,
        uint256 _price,
        uint256 _quantity,
        uint256 _tokensToReward
    ) external onlySeller(productId) {
        Product storage p = products[productId];
        p.price = _price;
        p.quantity = _quantity;
        p.tokenstoReward = _tokensToReward;

        emit LogProductUpdated(productId, _price, _quantity, _tokensToReward);
    }

    /// @notice Buy a product from the marketplace
    /// @dev for the purpose of this project, anyone can add an item
    /// @param productId id of the product to buy
    /// @param amountToBuy amount of products to buy from previous id
    /// @return true if transaction is successful
    function buyProduct(uint256 productId, uint256 amountToBuy)
        external
        payable
        stopInEmergency
        onlyAvailable(productId, amountToBuy)
        paidEnough(products[productId].price.mul(amountToBuy))
        nonReentrant
    {
        // Subtract amount of product to buy from the inventory
        products[productId].quantity = products[productId].quantity.sub(
            amountToBuy
        );

        // Update buyers product balances
        salesByUser[msg.sender][productId] = salesByUser[msg.sender][productId]
            .add(amountToBuy);

        // Calculate fees collected by owner in this sale and make transfer
        uint256 feesToCollect = products[productId]
            .price
            .mul(amountToBuy)
            .mul(salesFee)
            .div(100);
        safeTransfer(owner(), feesToCollect);

        uint256 sellerReceives = products[productId].price.mul(amountToBuy).sub(
            feesToCollect
        );
        safeTransfer(products[productId].seller, sellerReceives);

        // Send reward tokens to caller(buyer)
        rewardTokens(productId, amountToBuy);

        emit LogProductSold(
            productId,
            products[productId].price,
            amountToBuy,
            msg.sender
        );
    }

    /// @notice Send reward tokens to buyers
    /// @dev for the purpose of this project, anyone can add an item
    /// @param productId id of the product to buy
    /// @param amountToBuy amount of products to buy from previous id
    /// @return true if transaction is successful
    function rewardTokens(uint256 productId, uint256 amountToBuy) internal {
        uint256 amountToReward = products[productId].tokenstoReward *
            amountToBuy;
        require(
            token.mint(msg.sender, amountToReward * 1 ether),
            "Reward tokens could not be sent"
        );
    }

    /// @dev Fallback function - Called if other functions don't match call or
    ///         sent ether without data
    function() external payable {
        revert("Please use correct function");
    }

    /// @notice ability to destroy the contract and remove it from the blockchain if necessary
    function kill() external onlyOwner
    {
        if(msg.sender == owner()) selfdestruct(address(uint160(owner()))); // cast owner to address payable
    }

}
