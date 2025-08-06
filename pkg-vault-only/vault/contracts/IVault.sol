// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

/**
 * @notice Composite interface for all Vault operations: swap, add/remove liquidity, and associated queries.
 * Based on Balancer V3 IVault interface from pkg/interfaces/contracts/vault/IVault.sol
 */
interface IVault {
    /**
     * @notice Returns the main Vault address.
     * @return vault The main Vault address
     */
    function vault() external view returns (IVault);
    
    /**
     * @notice Registers a new pool with given configuration.
     * @param pool The pool address to register
     * @param tokens Array of token configurations
     * @param swapFeePercentage The swap fee percentage
     * @param pauseWindowEndTime When the pause window ends
     * @param protocolFeeExempt Whether the pool is exempt from protocol fees
     * @param roleAccounts Pool role accounts configuration
     * @param poolHooksContract Address of the pool hooks contract
     * @param liquidityManagement Liquidity management configuration
     */
    function registerPool(
        address pool,
        TokenConfig[] memory tokens,
        uint256 swapFeePercentage,
        uint32 pauseWindowEndTime,
        bool protocolFeeExempt,
        PoolRoleAccounts memory roleAccounts,
        address poolHooksContract,
        LiquidityManagement memory liquidityManagement
    ) external;
}

// Supporting types that factories need
struct TokenConfig {
    address token;
    uint8 tokenType;
    address rateProvider;
    bool paysYieldFees;
}

struct PoolRoleAccounts {
    address pauseManager;
    address swapFeeManager;
    address poolCreator;
}

struct LiquidityManagement {
    bool disableUnbalancedLiquidity;
    bool enableAddLiquidityCustom;
    bool enableRemoveLiquidityCustom;
    bool enableDonation;
}
