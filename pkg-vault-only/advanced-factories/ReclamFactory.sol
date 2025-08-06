// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import "../vault/contracts/BasePoolFactory.sol";

contract ReclamFactory is BasePoolFactory {
    string private constant FACTORY_VERSION = "v1.0.0";
    
    // Yield reclaim parameters
    address public immutable yieldRegistry;
    uint256 public immutable reclaimThreshold; // Minimum yield to trigger reclaim
    uint256 public constant MAX_RECLAIM_FREQUENCY = 86400; // 24 hours max
    uint256 public constant MIN_RECLAIM_FREQUENCY = 3600;  // 1 hour min
    
    event ReclaimPoolCreated(
        address indexed pool,
        address[] tokens,
        address[] yieldSources,
        uint256 reclaimFrequency
    );
    
    constructor(
        IVault vault,
        uint32 pauseWindowDuration,
        address _yieldRegistry,
        uint256 _reclaimThreshold
    ) BasePoolFactory(vault, pauseWindowDuration) {
        yieldRegistry = _yieldRegistry;
        reclaimThreshold = _reclaimThreshold;
    }
    
    function create(
        string memory name,
        string memory symbol,
        address[] memory tokens,
        address[] memory yieldSources,
        uint256[] memory weights,
        uint256 swapFeePercentage,
        uint256 reclaimFrequency,
        bool autoCompound,
        bytes32 salt
    ) external returns (address pool) {
        require(tokens.length == yieldSources.length, "Token-yield source mismatch");
        require(tokens.length == weights.length, "Token-weight mismatch");
        require(reclaimFrequency >= MIN_RECLAIM_FREQUENCY && reclaimFrequency <= MAX_RECLAIM_FREQUENCY, "Invalid frequency");
        
        pool = _create(
            abi.encode(
                name,
                symbol,
                tokens,
                yieldSources,
                weights,
                swapFeePercentage,
                reclaimFrequency,
                autoCompound,
                yieldRegistry,
                reclaimThreshold
            ),
            salt
        );
        
        emit ReclaimPoolCreated(pool, tokens, yieldSources, reclaimFrequency);
    }
    
    function _getPoolCreationCode() internal pure override returns (bytes memory) {
        return type(ReclaimPool).creationCode;
    }
    
    function getReclaimThreshold() external view returns (uint256) {
        return reclaimThreshold;
    }
    
    function getYieldRegistry() external view returns (address) {
        return yieldRegistry;
    }
}

contract ReclaimPool {
    constructor() {}
}
