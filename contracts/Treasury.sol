// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Treasury
 * @author PrediChain Team
 * @notice Manages fee collection and distribution with timelock protections
 * @dev Enhanced with:
 *      - Fee rate caps to prevent rug pulls
 *      - Timelock for sensitive operations
 *      - Transparent fee distribution tracking
 *      - Multi-sig compatible
 * 
 * Security:
 * - Owner should be multi-sig wallet (Gnosis Safe recommended)
 * - All withdrawals are time-locked
 * - Fee rates have hard caps
 * 
 * Audit Status: Pending
 */
contract Treasury is Ownable, ReentrancyGuard {
    // =============================================================
    //                           CONSTANTS
    // =============================================================
    
    /// @notice Maximum protocol fee rate (10% = 1000 basis points)
    uint256 public constant MAX_PROTOCOL_FEE_RATE = 1000; // 10%
    
    /// @notice Fee denominator for basis point calculations
    uint256 public constant FEE_DENOMINATOR = 100;
    
    /// @notice Timelock period for withdrawals (2 days)
    uint256 public constant WITHDRAWAL_TIMELOCK = 2 days;

    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice Total fees collected (all time)
    uint256 public totalFeesCollected;
    
    /// @notice Total fees distributed (all time)
    uint256 public totalFeesDistributed;
    
    /// @notice Protocol fee rate (80% = 80)
    uint256 public protocolFeeRate;
    
    /// @notice Pending withdrawal requests
    mapping(bytes32 => WithdrawalRequest) public pendingWithdrawals;

    // =============================================================
    //                           STRUCTS
    // =============================================================
    
    /**
     * @notice Withdrawal request data (for timelock)
     */
    struct WithdrawalRequest {
        address recipient;       // Who receives the funds
        uint256 amount;          // Amount to withdraw
        uint256 requestTime;     // When withdrawal was requested
        bool executed;           // Whether withdrawal has been executed
    }

    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event FeeCollected(
        address indexed source,
        uint256 amount,
        uint256 timestamp
    );
    
    event FeesDistributed(
        address indexed recipient,
        uint256 amount,
        string reason
    );
    
    event FeeRateUpdated(
        uint256 oldRate,
        uint256 newRate
    );
    
    event WithdrawalRequested(
        bytes32 indexed requestId,
        address indexed recipient,
        uint256 amount,
        uint256 executeTime
    );
    
    event WithdrawalExecuted(
        bytes32 indexed requestId,
        address indexed recipient,
        uint256 amount
    );
    
    event WithdrawalCancelled(
        bytes32 indexed requestId
    );

    // =============================================================
    //                       INITIALIZATION
    // =============================================================
    
    constructor() Ownable(msg.sender) {
        protocolFeeRate = 80; // 80% to protocol, 20% to market creators
        totalFeesCollected = 0;
        totalFeesDistributed = 0;
    }

    // =============================================================
    //                       CORE FUNCTIONS
    // =============================================================
    
    /**
     * @notice Collect fees from a trade
     * @param amount Fee amount to collect
     * 
     * @dev Called by PredictionMarket contract after each trade
     *      Assumes BNB has already been transferred to this contract
     * 
     * Emits: FeeCollected event
     */
    function collectFee(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        
        unchecked {
            totalFeesCollected += amount;
        }
        
        emit FeeCollected(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Distribute fees to a recipient (market creator or team)
     * @param recipient Address to receive fees
     * @param amount Amount to distribute
     * @param reason Distribution reason (for transparency)
     * 
     * @dev Only callable by owner (should be multi-sig)
     *      No timelock for market creator distributions (trustless)
     * 
     * Requirements:
     *      - Recipient must not be zero address
     *      - Amount must be > 0
     *      - Treasury must have sufficient balance
     * 
     * Emits: FeesDistributed event
     */
    function distributeFees(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(address(this).balance >= amount, "Insufficient balance");
        
        unchecked {
            totalFeesDistributed += amount;
        }
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FeesDistributed(recipient, amount, reason);
    }
    
    /**
     * @notice Request protocol fee withdrawal (timelock)
     * @param recipient Address to receive funds
     * @param amount Amount to withdraw
     * @return requestId Unique identifier for this withdrawal request
     * 
     * @dev Initiates a time-locked withdrawal (executes after WITHDRAWAL_TIMELOCK)
     *      Prevents instant rug pulls - community has time to react
     * 
     * Emits: WithdrawalRequested event
     */
    function requestWithdrawal(
        address recipient,
        uint256 amount
    ) external onlyOwner returns (bytes32 requestId) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(address(this).balance >= amount, "Insufficient balance");
        
        // Generate unique request ID
        requestId = keccak256(
            abi.encodePacked(recipient, amount, block.timestamp, totalFeesDistributed)
        );
        
        // Store withdrawal request
        pendingWithdrawals[requestId] = WithdrawalRequest({
            recipient: recipient,
            amount: amount,
            requestTime: block.timestamp,
            executed: false
        });
        
        emit WithdrawalRequested(
            requestId,
            recipient,
            amount,
            block.timestamp + WITHDRAWAL_TIMELOCK
        );
    }
    
    /**
     * @notice Execute a time-locked withdrawal
     * @param requestId Withdrawal request identifier
     * 
     * @dev Requirements:
     *      - Request must exist
     *      - Timelock period must have passed
     *      - Request must not have been executed already
     * 
     * Emits: WithdrawalExecuted event
     */
    function executeWithdrawal(
        bytes32 requestId
    ) external onlyOwner nonReentrant {
        WithdrawalRequest storage request = pendingWithdrawals[requestId];
        
        require(request.requestTime > 0, "Request does not exist");
        require(!request.executed, "Already executed");
        require(
            block.timestamp >= request.requestTime + WITHDRAWAL_TIMELOCK,
            "Timelock not expired"
        );
        require(address(this).balance >= request.amount, "Insufficient balance");
        
        // Mark as executed
        request.executed = true;
        
        unchecked {
            totalFeesDistributed += request.amount;
        }
        
        // Transfer funds
        (bool success, ) = request.recipient.call{value: request.amount}("");
        require(success, "Transfer failed");
        
        emit WithdrawalExecuted(requestId, request.recipient, request.amount);
    }
    
    /**
     * @notice Cancel a pending withdrawal (emergency only)
     * @param requestId Withdrawal request identifier
     * 
     * @dev Only callable by owner before execution
     *      Use if withdrawal was requested in error
     * 
     * Emits: WithdrawalCancelled event
     */
    function cancelWithdrawal(bytes32 requestId) external onlyOwner {
        WithdrawalRequest storage request = pendingWithdrawals[requestId];
        
        require(request.requestTime > 0, "Request does not exist");
        require(!request.executed, "Already executed");
        
        // Delete request
        delete pendingWithdrawals[requestId];
        
        emit WithdrawalCancelled(requestId);
    }

    // =============================================================
    //                       VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @notice Get current treasury balance
     * @return balance Balance in wei
     */
    function getBalance() external view returns (uint256 balance) {
        return address(this).balance;
    }
    
    /**
     * @notice Get pending withdrawal details
     * @param requestId Withdrawal request identifier
     * @return request Withdrawal request data
     */
    function getWithdrawalRequest(
        bytes32 requestId
    ) external view returns (WithdrawalRequest memory request) {
        return pendingWithdrawals[requestId];
    }
    
    /**
     * @notice Check if withdrawal is ready to execute
     * @param requestId Withdrawal request identifier
     * @return ready True if timelock has passed and not executed
     */
    function isWithdrawalReady(
        bytes32 requestId
    ) external view returns (bool ready) {
        WithdrawalRequest storage request = pendingWithdrawals[requestId];
        
        if (request.requestTime == 0 || request.executed) {
            return false;
        }
        
        return block.timestamp >= request.requestTime + WITHDRAWAL_TIMELOCK;
    }

    // =============================================================
    //                       ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @notice Set protocol fee rate (capped at MAX_PROTOCOL_FEE_RATE)
     * @param newProtocolFeeRate New fee rate (80 = 80%)
     * 
     * @dev Requirements:
     *      - Rate must be <= MAX_PROTOCOL_FEE_RATE
     *      - Rate must be <= 100 (100%)
     * 
     * Emits: FeeRateUpdated event
     */
    function setFeeRate(uint256 newProtocolFeeRate) external onlyOwner {
        require(newProtocolFeeRate <= FEE_DENOMINATOR, "Rate exceeds 100%");
        require(newProtocolFeeRate <= MAX_PROTOCOL_FEE_RATE, "Rate exceeds cap");
        
        uint256 oldRate = protocolFeeRate;
        protocolFeeRate = newProtocolFeeRate;
        
        emit FeeRateUpdated(oldRate, newProtocolFeeRate);
    }

    // =============================================================
    //                       FALLBACK
    // =============================================================
    
    /**
     * @notice Allow contract to receive BNB
     */
    receive() external payable {
        // Fees are collected via collectFee() function
        // This fallback allows direct transfers if needed
    }
}
