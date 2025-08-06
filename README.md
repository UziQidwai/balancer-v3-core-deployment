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
