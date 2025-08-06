# Balancer V3 Core Deployment

This repository contains the **proven minimal setup** for successfully deploying Balancer V3 core contracts (Vault, VaultAdmin, VaultExtension, ProtocolFeeController).

## ✅ Successful Deployment Results

This setup has been **successfully tested** and deployed on Sepolia testnet with the following results:

- **VaultAdmin**: `0x16F3A1D447C42711b4B91c9F593cA060ea0F8a64`
- **VaultExtension**: `0xA727f17Ca785372cf73cf4bFFd96836888CE5542`
- **ProtocolFeeController**: `0xc3755174DB2Ff556B4910750Be14Ad6C3F8E40fb`
- **Vault**: `0xcdB7445d555258D3cAADAea6Ee2d6D946fC41F0e`

All contracts **verified on Etherscan** ✅

## 🔧 Setup Instructions

1. **Install dependencies**:
yarn install

text

2. **Configure environment**:
cp .env.example .env

Edit .env with your RPC URLs and private key
text

3. **Compile contracts**:
npx hardhat clean
npx hardhat compile

text

4. **Deploy core contracts**:
npx hardhat run scripts/deploy-vault-with-precalculation.js --network sepolia

text

## 🎯 Key Technical Solutions

- **Address Pre-calculation**: Solves circular dependency issues
- **Optimized Compiler Settings**: `runs: 1` for maximum size reduction
- **Correct Deployment Sequence**: VaultAdmin → VaultExtension → ProtocolFeeController → Vault
- **Automatic Verification**: All contracts verified on deployment

## 📁 Repository Structure

├── pkg-vault-only/ # Focused contract directory
├── scripts/ # Deployment scripts
├── hardhat.config.js # Optimized Hardhat configuration
├── package.json # Dependencies
└── README.md # This file

text

## 🚀 Deployment Success Factors

1. **Contract Size Optimization**: `runs: 1` compiler setting
2. **Address Pre-calculation**: Eliminates constructor revert issues
3. **Proper Constructor Parameters**: All dependencies correctly referenced
4. **Systematic Verification**: Automated Etherscan verification

## 📝 Last Updated

Successfully deployed: August 6, 2025

## 🏭 Factory Contracts Added

**Phase 2 Factory Contracts:**
- WeightedPoolFactory - Creates standard weighted pools
- StablePoolFactory - Creates low-slippage stable asset pools  
- GyroECLPPoolFactory - Creates Gyroscope elliptic concentrated liquidity pools
- Gyro2CLPPoolFactory - Creates Gyroscope two-token concentrated liquidity pools

**Supporting Infrastructure:**
- BasePoolFactory.sol - Base contract for all pool factories
- IVault.sol - Vault interface required by factories

## 📝 Complete Deployment Sequence

Phase 1: Core Contracts (4 contracts)
npx hardhat run scripts/deploy-vault-with-precalculation.js --network sepolia

Phase 2: Router Contracts (4 contracts)
npx hardhat run scripts/deploy-phase1-routers.js --network sepolia

Phase 3: Factory Contracts (4 contracts)
npx hardhat run scripts/deploy-phase2-factories.js --network sepolia

Phase 4: Verify Gyro Factories (if needed)
npx hardhat run scripts/verify-gyro-factories.js --network sepolia

## 🎯 Complete Success Results (Sepolia)

**All 12 contracts successfully deployed and verified:**

**Core Contracts:**
- VaultAdmin: `0x16F3A1D447C42711b4B91c9F593cA060ea0F8a64`
- VaultExtension: `0xA727f17Ca785372cf73cf4bFFd96836888CE5542`
- ProtocolFeeController: `0xc3755174DB2Ff556B4910750Be14Ad6C3F8E40fb`
- Vault: `0xcdB7445d555258D3cAADAea6Ee2d6D946fC41F0e`

**Router Contracts:**
- Router: `0xc8faaBAcbf5f3c5Da7395C053a5AD00A7CB48471`
- BatchRouter: `0x129Ca0F4E29F41027128c21541A135D9CAC8beB8`
- BufferRouter: `0xcc6ac08743C736c8239D39D95DC4091E74F23857`
- CompositeLiquidityRouter: `0x6Bd8b87e02f1e1d98e9cb8B07e260ebE0Dd10624`

**Factory Contracts:**
- WeightedPoolFactory: `0x4a1289e09c85ED049A2A7E0c102DbE701350608F`
- StablePoolFactory: `0xfBcA5987CD1B5f7f859D38D61bdCE649b68357A0`
- GyroECLPPoolFactory: `0xA71cdcD5e4FeCed0d1CF9977295A9C8A78519C71`
- Gyro2CLPPoolFactory: `0x997Fedbc9A284da647f6068724926C3e9F6540E0`

## 🏆 Achievement

This repository contains a **complete, standalone Balancer V3 fork** with 100% verified contracts on Sepolia testnet.

**Last Updated**: Successfully completed full deployment - August 6, 2025
