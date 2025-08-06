// scripts/deploy-phase3-advanced-factories.js
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 DEPLOYING BALANCER V3 ADVANCED FACTORY CONTRACTS - PHASE 3");
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  // Your deployed core contracts
  const vaultAddress = "0xcdB7445d555258D3cAADAea6Ee2d6D946fC41F0e";
  const pauseWindowDuration = 7776000; // 90 days
  
  // Sepolia configuration parameters - CORRECTED ADDRESSES
  const sepoliaConfig = {
    // Sepolia Aave V3 Pool (properly checksummed)
    aavePool: "0x6ae43d3271ff6888e7fc43fd7321a503071a7795", // Fixed: lowercase
    // Alternative: Use ethers.getAddress() for automatic checksumming
    // aavePool: ethers.getAddress("0x6Ae43d3271ff6888e7Fc43Fd7321a503071A7795"),
    
    // Minimum yield threshold (1% = 100 basis points)
    minYieldThreshold: 100,
    // Quantum AMM parameters
    quantumParameter: ethers.parseUnits("1000000", 0), // 1M quantum units
    quantumOracle: ethers.ZeroAddress, // Use ethers.ZeroAddress instead of manual zero address
    // Yield registry for reclaim pools
    yieldRegistry: "0x0000000000000000000000000000000000000001", // Placeholder registry
    reclaimThreshold: 50 // 0.5% yield threshold
  };
  
  const deployments = [];
  
  try {
    // 1. Deploy BoostedPoolFactory
    console.log("1️⃣ Deploying BoostedPoolFactory...");
    const BoostedPoolFactoryContract = await ethers.getContractFactory("BoostedPoolFactory");
    const boostedFactory = await BoostedPoolFactoryContract.deploy(
      vaultAddress,
      pauseWindowDuration,
      sepoliaConfig.aavePool,
      sepoliaConfig.minYieldThreshold
    );
    await boostedFactory.waitForDeployment();
    const boostedFactoryAddress = await boostedFactory.getAddress();
    deployments.push({ 
      name: "BoostedPoolFactory", 
      address: boostedFactoryAddress, 
      args: [vaultAddress, pauseWindowDuration, sepoliaConfig.aavePool, sepoliaConfig.minYieldThreshold] 
    });
    console.log(`✅ BoostedPoolFactory deployed: ${boostedFactoryAddress}`);
    
    // 2. Deploy StableV2PoolFactory
    console.log("2️⃣ Deploying StableV2PoolFactory...");
    const StableV2PoolFactoryContract = await ethers.getContractFactory("StableV2PoolFactory");
    const stableV2Factory = await StableV2PoolFactoryContract.deploy(
      vaultAddress,
      pauseWindowDuration
    );
    await stableV2Factory.waitForDeployment();
    const stableV2FactoryAddress = await stableV2Factory.getAddress();
    deployments.push({ 
      name: "StableV2PoolFactory", 
      address: stableV2FactoryAddress, 
      args: [vaultAddress, pauseWindowDuration] 
    });
    console.log(`✅ StableV2PoolFactory deployed: ${stableV2FactoryAddress}`);
    
    // 3. Deploy QuantumAMMFactory
    console.log("3️⃣ Deploying QuantumAMMFactory...");
    const QuantumAMMFactoryContract = await ethers.getContractFactory("QuantumAMMFactory");
    const quantumAMMFactory = await QuantumAMMFactoryContract.deploy(
      vaultAddress,
      pauseWindowDuration,
      sepoliaConfig.quantumParameter,
      sepoliaConfig.quantumOracle
    );
    await quantumAMMFactory.waitForDeployment();
    const quantumAMMFactoryAddress = await quantumAMMFactory.getAddress();
    deployments.push({ 
      name: "QuantumAMMFactory", 
      address: quantumAMMFactoryAddress, 
      args: [vaultAddress, pauseWindowDuration, sepoliaConfig.quantumParameter, sepoliaConfig.quantumOracle] 
    });
    console.log(`✅ QuantumAMMFactory deployed: ${quantumAMMFactoryAddress}`);
    
    // 4. Deploy ReclamFactory
    console.log("4️⃣ Deploying ReclamFactory...");
    const ReclamFactoryContract = await ethers.getContractFactory("ReclamFactory");
    const reclaimFactory = await ReclamFactoryContract.deploy(
      vaultAddress,
      pauseWindowDuration,
      sepoliaConfig.yieldRegistry,
      sepoliaConfig.reclaimThreshold
    );
    await reclaimFactory.waitForDeployment();
    const reclaimFactoryAddress = await reclaimFactory.getAddress();
    deployments.push({ 
      name: "ReclamFactory", 
      address: reclaimFactoryAddress, 
      args: [vaultAddress, pauseWindowDuration, sepoliaConfig.yieldRegistry, sepoliaConfig.reclaimThreshold] 
    });
    console.log(`✅ ReclamFactory deployed: ${reclaimFactoryAddress}`);
    
    // Verification
    console.log("\n🔍 Starting contract verification...");
    for (const deployment of deployments) {
      await verifyContract(deployment.name, deployment.address, deployment.args);
    }
    
    console.log("\n🎉 PHASE 3 COMPLETE - ALL ADVANCED FACTORY CONTRACTS DEPLOYED!");
    deployments.forEach(d => console.log(`${d.name}: ${d.address}`));
    
    console.log("\n🏆 COMPLETE BALANCER V3 ECOSYSTEM WITH ADVANCED FACTORIES!");
    console.log("=" .repeat(70));
    console.log("TOTAL CONTRACTS DEPLOYED: 16 (4 Core + 4 Routers + 4 Basic Factories + 4 Advanced Factories)");
    
  } catch (error) {
    console.error("❌ Phase 3 deployment failed:", error.message);
    throw error;
  }
}

async function verifyContract(name, address, args) {
  try {
    console.log(`🔍 Verifying ${name}...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: args,
      contract: `pkg-vault-only/advanced-factories/${name}.sol:${name}`
    });
    console.log(`✅ ${name} verified successfully!`);
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log(`ℹ️  ${name} already verified`);
    } else {
      console.warn(`⚠️ ${name} verification failed: ${error.message}`);
    }
  }
}

main().catch(console.error);
