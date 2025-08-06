// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import "../vault/contracts/BasePoolFactory.sol";

contract BoostedPoolFactory is BasePoolFactory {
    string private constant FACTORY_VERSION = "v1.0.0";
    
    // Aave V3 integration for yield optimization
    address public immutable aavePool;
    uint256 public immutable minYieldThreshold; // 1% = 100 basis points
    
    event BoostedPoolCreated(
        address indexed pool,
        address[] tokens,
        address[] yieldTokens,
        uint256 boostLevel
    );
    
    constructor(
        IVault vault,
        uint32 pauseWindowDuration,
        address _aavePool,
        uint256 _minYieldThreshold
    ) BasePoolFactory(vault, pauseWindowDuration) {
        aavePool = _aavePool;
        minYieldThreshold = _minYieldThreshold;
    }
    
    function createBoostedWeightedPool(
        string memory name,
        string memory symbol,
        address[] memory tokens,
        address[] memory yieldTokens,
        uint256[] memory weights,
        uint256 swapFeePercentage,
        bytes32 salt
    ) external returns (address pool) {
        pool = _create(
            abi.encode(name, symbol, tokens, yieldTokens, weights, swapFeePercentage, aavePool, minYieldThreshold),
            salt
        );
        emit BoostedPoolCreated(pool, tokens, yieldTokens, 100);
    }
    
    function createBoostedStablePool(
        string memory name,
        string memory symbol,
        address[] memory tokens,
        address[] memory yieldTokens,
        uint256 amplificationParameter,
        uint256 swapFeePercentage,
        bytes32 salt
    ) external returns (address pool) {
        pool = _create(
            abi.encode(name, symbol, tokens, yieldTokens, amplificationParameter, swapFeePercentage, aavePool),
            salt
        );
        emit BoostedPoolCreated(pool, tokens, yieldTokens, 100);
    }
    
    function _getPoolCreationCode() internal pure override returns (bytes memory) {
        return type(BoostedPool).creationCode;
    }
    
    function getFactoryVersion() external pure returns (string memory) {
        return FACTORY_VERSION;
    }
}

contract BoostedPool {
    constructor() {}
}
