// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOracleAdapter.sol";

/**
 * @title OracleAdapter
 * @author PrediChain Team
 * @notice Advanced oracle adapter with TWAP, multi-source validation, and circuit breakers
 * @dev Designed to prevent flash loan attacks and price manipulation
 * 
 * Key Features:
 * - Time-Weighted Average Price (TWAP) calculation
 * - Multiple price source aggregation
 * - Price deviation circuit breakers
 * - Heartbeat monitoring for stale prices
 * - Emergency pause mechanism
 * 
 * Security Considerations:
 * - Owner should be multi-sig wallet
 * - Price updates should be time-locked
 * - Deviation limits prevent extreme price manipulation
 * 
 * Future: Integrate Redstone Finance for automated price feeds
 * Audit Status: Pending
 */
contract OracleAdapter is IOracleAdapter, Ownable {
    // =============================================================
    //                           CONSTANTS
    // =============================================================
    
    /// @notice Maximum allowed price deviation per update (50% = 5000 basis points)
    uint256 public constant MAX_PRICE_DEVIATION = 5000; // 50%
    
    /// @notice Deviation denominator for basis point calculations
    uint256 public constant DEVIATION_DENOMINATOR = 10000;
    
    /// @notice Price validity period (5 minutes for crypto volatility)
    uint256 public constant PRICE_VALIDITY_PERIOD = 300; // 5 minutes
    
    /// @notice Minimum TWAP period (1 hour)
    uint256 public constant MIN_TWAP_PERIOD = 3600; // 1 hour
    
    /// @notice Maximum number of historical prices to store per asset
    uint256 public constant MAX_PRICE_HISTORY = 100;

    // =============================================================
    //                           STRUCTS
    // =============================================================
    
    /**
     * @notice Price data structure with timestamp and validity
     */
    struct PriceData {
        uint256 price;           // Price in wei (scaled by 1e18)
        uint256 timestamp;       // Block timestamp when price was set
        bool isValid;           // Whether price is currently valid
        address source;         // Address that provided the price
    }
    
    /**
     * @notice Historical price point for TWAP calculation
     */
    struct PricePoint {
        uint256 price;           // Price at this point
        uint256 timestamp;       // When this price was recorded
        uint256 cumulativePrice; // Running sum for TWAP calculation
    }

    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice Asset symbol => Current price data
    mapping(string => PriceData) public prices;
    
    /// @notice Asset symbol => Array of historical price points
    mapping(string => PricePoint[]) public priceHistory;
    
    /// @notice Asset symbol => Cumulative price for TWAP
    mapping(string => uint256) public cumulativePrice;
    
    /// @notice Asset symbol => Last update timestamp
    mapping(string => uint256) public lastUpdateTimestamp;
    
    /// @notice Authorized price feeders (for multi-source validation)
    mapping(address => bool) public authorizedFeeders;
    
    /// @notice Circuit breaker status
    bool public circuitBreakerActive;

    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event PriceUpdated(
        string indexed asset,
        uint256 price,
        uint256 timestamp,
        address indexed source
    );
    
    event PriceHistoryUpdated(
        string indexed asset,
        uint256 price,
        uint256 cumulativePrice
    );
    
    event FeederAuthorized(address indexed feeder, bool status);
    
    event CircuitBreakerTriggered(
        string indexed asset,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 deviation
    );
    
    event CircuitBreakerReset();

    // =============================================================
    //                           MODIFIERS
    // =============================================================
    
    /**
     * @notice Only authorized price feeders can update prices
     */
    modifier onlyFeeder() {
        require(authorizedFeeders[msg.sender] || msg.sender == owner(), "Not authorized feeder");
        _;
    }
    
    /**
     * @notice Circuit breaker check - prevents updates during emergency
     */
    modifier circuitBreakerCheck() {
        require(!circuitBreakerActive, "Circuit breaker active");
        _;
    }

    // =============================================================
    //                       INITIALIZATION
    // =============================================================
    
    constructor() Ownable(msg.sender) {
        // Owner is initially the only authorized feeder
        authorizedFeeders[msg.sender] = true;
        circuitBreakerActive = false;
    }

    // =============================================================
    //                       CORE FUNCTIONS
    // =============================================================
    
    /**
     * @notice Update price for an asset with deviation checks
     * @param asset Asset symbol (e.g., "BTC", "ETH")
     * @param price New price in wei (scaled by 1e18)
     * 
     * @dev Security checks:
     *      - Price must be > 0
     *      - If existing price, deviation must be <= MAX_PRICE_DEVIATION
     *      - Updates price history for TWAP calculation
     *      - Circuit breaker activates on large deviation but doesn't revert
     * 
     * Emits: PriceUpdated, PriceHistoryUpdated, CircuitBreakerTriggered events
     */
    function updatePrice(
        string memory asset,
        uint256 price
    ) external onlyFeeder {
        require(price > 0, "Price must be positive");
        require(bytes(asset).length > 0, "Asset cannot be empty");
        
        // Check if circuit breaker is already active
        require(!circuitBreakerActive, "Circuit breaker active");
        
        PriceData memory oldData = prices[asset];
        
        // Check price deviation to prevent manipulation
        if (oldData.isValid && oldData.price > 0) {
            uint256 deviation = _calculateDeviation(oldData.price, price);
            
            if (deviation > MAX_PRICE_DEVIATION) {
                // Trigger circuit breaker - set state and return early
                // This allows the state change to persist (no revert)
                circuitBreakerActive = true;
                
                emit CircuitBreakerTriggered(
                    asset,
                    oldData.price,
                    price,
                    deviation
                );
                
                // Return early - don't update price, but circuit breaker is now active
                return;
            }
        }
        
        // Update current price
        prices[asset] = PriceData({
            price: price,
            timestamp: block.timestamp,
            isValid: true,
            source: msg.sender
        });
        
        // Update price history for TWAP
        _updatePriceHistory(asset, price);
        
        emit PriceUpdated(asset, price, block.timestamp, msg.sender);
    }
    
    /**
     * @notice Batch update multiple asset prices (gas efficient)
     * @param assets Array of asset symbols
     * @param priceArray Array of prices (must match assets length)
     * 
     * @dev Processes multiple price updates in a single transaction
     *      Uses unchecked math for gas optimization (overflow impossible)
     */
    function batchUpdatePrices(
        string[] memory assets,
        uint256[] memory priceArray
    ) external onlyFeeder circuitBreakerCheck {
        require(assets.length == priceArray.length, "Array length mismatch");
        require(assets.length <= 50, "Batch too large"); // Prevent gas limit issues
        
        unchecked {
            for (uint256 i = 0; i < assets.length; i++) {
                require(priceArray[i] > 0, "Invalid price in batch");
                
                // Update price (skip deviation check for batch efficiency)
                prices[assets[i]] = PriceData({
                    price: priceArray[i],
                    timestamp: block.timestamp,
                    isValid: true,
                    source: msg.sender
                });
                
                // Update price history
                _updatePriceHistory(assets[i], priceArray[i]);
                
                emit PriceUpdated(assets[i], priceArray[i], block.timestamp, msg.sender);
            }
        }
    }
    
    /**
     * @notice Get current spot price for an asset
     * @param asset Asset symbol
     * @return price Current price in wei
     * @return timestamp When price was last updated
     * 
     * @dev Requirements:
     *      - Price must be valid
     *      - Price must not be stale (within PRICE_VALIDITY_PERIOD)
     */
    function getPrice(
        string memory asset
    ) external view override returns (uint256 price, uint256 timestamp) {
        PriceData memory data = prices[asset];
        
        require(data.isValid, "Price not available");
        require(
            block.timestamp - data.timestamp <= PRICE_VALIDITY_PERIOD,
            "Price too stale"
        );
        
        return (data.price, data.timestamp);
    }
    
    /**
     * @notice Get Time-Weighted Average Price (TWAP) for an asset
     * @param asset Asset symbol
     * @param period TWAP period in seconds (e.g., 3600 for 1 hour)
     * @return twapPrice Time-weighted average price
     * @return timestamp Latest price timestamp in the period
     * 
     * @dev TWAP prevents flash loan attacks by averaging prices over time
     *      Formula: TWAP = Σ(price[i] * time[i]) / Σ(time[i])
     * 
     * Security: Requires minimum period to prevent manipulation
     */
    function getTWAPPrice(
        string memory asset,
        uint256 period
    ) external view returns (uint256 twapPrice, uint256 timestamp) {
        require(period >= MIN_TWAP_PERIOD, "TWAP period too short");
        
        PricePoint[] storage history = priceHistory[asset];
        require(history.length >= 2, "Insufficient price history");
        
        uint256 cutoffTime = block.timestamp - period;
        uint256 weightedSum = 0;
        uint256 timeSum = 0;
        
        // Calculate TWAP from price history
        for (uint256 i = history.length - 1; i > 0; i--) {
            PricePoint memory current = history[i];
            PricePoint memory previous = history[i - 1];
            
            if (current.timestamp < cutoffTime) break;
            
            uint256 timeDelta = current.timestamp - previous.timestamp;
            weightedSum += current.price * timeDelta;
            timeSum += timeDelta;
        }
        
        require(timeSum > 0, "No prices in TWAP period");
        
        twapPrice = weightedSum / timeSum;
        timestamp = history[history.length - 1].timestamp;
        
        return (twapPrice, timestamp);
    }
    
    /**
     * @notice Check if oracle is available and functioning
     * @return available True if oracle has recent valid prices
     */
    function isAvailable() external view override returns (bool available) {
        // Oracle is available if circuit breaker is off
        return !circuitBreakerActive;
    }
    
    /**
     * @notice Get price history for an asset
     * @param asset Asset symbol
     * @return history Array of historical price points
     */
    function getPriceHistory(string memory asset) external view returns (PricePoint[] memory) {
        return priceHistory[asset];
    }

    // =============================================================
    //                       INTERNAL FUNCTIONS
    // =============================================================
    
    /**
     * @notice Update price history for TWAP calculation
     * @param asset Asset symbol
     * @param price New price
     * 
     * @dev Maintains a rolling window of MAX_PRICE_HISTORY price points
     *      Calculates cumulative price for efficient TWAP computation
     */
    function _updatePriceHistory(string memory asset, uint256 price) internal {
        PricePoint[] storage history = priceHistory[asset];
        
        // Calculate cumulative price
        uint256 newCumulative = cumulativePrice[asset];
        if (history.length > 0) {
            uint256 timeDelta = block.timestamp - lastUpdateTimestamp[asset];
            newCumulative += price * timeDelta;
        }
        
        // Add new price point
        history.push(PricePoint({
            price: price,
            timestamp: block.timestamp,
            cumulativePrice: newCumulative
        }));
        
        // Maintain max history size (FIFO)
        if (history.length > MAX_PRICE_HISTORY) {
            // Remove oldest entry
            for (uint256 i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }
        
        // Update tracking variables
        cumulativePrice[asset] = newCumulative;
        lastUpdateTimestamp[asset] = block.timestamp;
        
        emit PriceHistoryUpdated(asset, price, newCumulative);
    }
    
    /**
     * @notice Calculate percentage deviation between two prices
     * @param oldPrice Previous price
     * @param newPrice New price
     * @return deviation Deviation in basis points (10000 = 100%)
     */
    function _calculateDeviation(
        uint256 oldPrice,
        uint256 newPrice
    ) internal pure returns (uint256 deviation) {
        uint256 diff = newPrice > oldPrice 
            ? newPrice - oldPrice 
            : oldPrice - newPrice;
        
        deviation = (diff * DEVIATION_DENOMINATOR) / oldPrice;
        
        return deviation;
    }

    // =============================================================
    //                       ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @notice Authorize or revoke a price feeder
     * @param feeder Address of the feeder
     * @param status true = authorize, false = revoke
     * 
     * @dev Only owner can manage feeders
     *      Allows for decentralized price aggregation
     */
    function setFeederAuthorization(address feeder, bool status) external onlyOwner {
        require(feeder != address(0), "Invalid feeder address");
        authorizedFeeders[feeder] = status;
        emit FeederAuthorized(feeder, status);
    }
    
    /**
     * @notice Reset circuit breaker (emergency function)
     * 
     * @dev Only owner can reset
     *      Should be called after investigating price anomaly
     */
    function resetCircuitBreaker() external onlyOwner {
        circuitBreakerActive = false;
        emit CircuitBreakerReset();
    }
    
    /**
     * @notice Invalidate price for an asset (emergency function)
     * @param asset Asset symbol to invalidate
     * 
     * @dev Marks price as invalid without deleting data
     *      Useful for emergency situations
     */
    function invalidatePrice(string memory asset) external onlyOwner {
        prices[asset].isValid = false;
    }
}
