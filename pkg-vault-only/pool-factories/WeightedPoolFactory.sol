// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import "../vault/contracts/BasePoolFactory.sol";

contract WeightedPoolFactory is BasePoolFactory {
    constructor(IVault vault, uint32 pauseWindowDuration) BasePoolFactory(vault, pauseWindowDuration) {}
    
    function create(
        string memory name,
        string memory symbol,
        address[] memory tokens,
        uint256[] memory weights,
        uint256 swapFeePercentage,
        bytes32 salt
    ) external returns (address pool) {
        pool = _create(
            abi.encode(name, symbol, tokens, weights, swapFeePercentage),
            salt
        );
    }
    
    function _getPoolCreationCode() internal pure override returns (bytes memory) {
        return type(WeightedPool).creationCode;
    }
}

contract WeightedPool {
    constructor() {}
}
