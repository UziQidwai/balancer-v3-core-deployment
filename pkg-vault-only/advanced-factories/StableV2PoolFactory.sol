// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import "../vault/contracts/BasePoolFactory.sol";

contract StableV2PoolFactory is BasePoolFactory {
    string private constant FACTORY_VERSION = "v2.0.0";
    string private constant POOL_VERSION = "v2.0.0";
    
    // Enhanced stable pool parameters
    uint256 public constant MAX_AMPLIFICATION = 5000;
    uint256 public constant MIN_AMPLIFICATION = 1;
    uint256 public constant MAX_STABLE_TOKENS = 5;
    
    event StableV2PoolCreated(
        address indexed pool,
        address[] tokens,
        uint256 amplificationParameter,
        bool enableDonation
    );
    
    constructor(
        IVault vault,
        uint32 pauseWindowDuration
    ) BasePoolFactory(vault, pauseWindowDuration) {}
    
    function create(
        string memory name,
        string memory symbol,
        address[] memory tokens,
        uint256 amplificationParameter,
        uint256 swapFeePercentage,
        bool enableDonation,
        bool disableUnbalancedLiquidity,
        address rateProvider,
        bytes32 salt
    ) external returns (address pool) {
        require(tokens.length >= 2 && tokens.length <= MAX_STABLE_TOKENS, "Invalid token count");
        require(amplificationParameter >= MIN_AMPLIFICATION && amplificationParameter <= MAX_AMPLIFICATION, "Invalid amplification");
        
        pool = _create(
            abi.encode(
                name,
                symbol,
                tokens,
                amplificationParameter,
                swapFeePercentage,
                enableDonation,
                disableUnbalancedLiquidity,
                rateProvider
            ),
            salt
        );
        
        emit StableV2PoolCreated(pool, tokens, amplificationParameter, enableDonation);
    }
    
    function _getPoolCreationCode() internal pure override returns (bytes memory) {
        return type(StableV2Pool).creationCode;
    }
    
    function getFactoryVersion() external pure returns (string memory) {
        return FACTORY_VERSION;
    }
    
    function getPoolVersion() external pure returns (string memory) {
        return POOL_VERSION;
    }
}

contract StableV2Pool {
    constructor() {}
}
