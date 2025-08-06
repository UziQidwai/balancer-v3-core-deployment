// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import "./IVault.sol";

abstract contract BasePoolFactory {
    IVault private immutable _vault;
    uint32 private immutable _pauseWindowDuration;
    
    event PoolCreated(address indexed pool);
    
    constructor(IVault vault, uint32 pauseWindowDuration) {
        _vault = vault;
        _pauseWindowDuration = pauseWindowDuration;
    }
    
    function getVault() public view returns (IVault) {
        return _vault;
    }
    
    function getPauseWindowDuration() public view returns (uint32) {
        return _pauseWindowDuration;
    }
    
    function _create(bytes memory constructorArgs, bytes32 salt) internal virtual returns (address pool) {
        // CREATE2 deployment logic would go here
        // For now, return a placeholder
        pool = address(0);
        emit PoolCreated(pool);
    }
    
    function _getPoolCreationCode() internal pure virtual returns (bytes memory);
}
