// scripts/deploy-phase2-factories.js
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 DEPLOYING BALANCER V3 FACTORY CONTRACTS - PHASE 2");
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  const vaultAddress = "0xcdB7445d555258D3cAADAea6Ee2d6D946fC41F0e";
  const pauseWindowDuration = 7776000; // 90 days
  
  const deployments = [];
  
  try {
    // 1. Deploy WeightedPoolFactory
    console.log("1️⃣ Deploying WeightedPoolFactory...");
    const WeightedPoolFactoryContract = await ethers.getContractFactory("WeightedPoolFactory");
    const weightedPoolFactory = await WeightedPoolFactoryContract.deploy(
      vaultAddress,
      pauseWindowDuration
    );
    await weightedPoolFactory.waitForDeployment();
    const weightedPoolFactoryAddress = await weightedPoolFactory.getAddress();
    deployments.push({ 
      name: "WeightedPoolFactory", 
      address: weightedPoolFactoryAddress, 
      args: [vaultAddress, pauseWindowDuration] 
    });
    console.log(`✅ WeightedPoolFactory deployed: ${weightedPoolFactoryAddress}`);
    
    // 2. Deploy StablePoolFactory
    console.log("2️⃣ Deploying StablePoolFactory...");
    const StablePoolFactoryContract = await ethers.getContractFactory("StablePoolFactory");
    const stablePoolFactory = await StablePoolFactoryContract.deploy(
      vaultAddress,
      pauseWindowDuration
    );
    await stablePoolFactory.waitForDeployment();
    const stablePoolFactoryAddress = await stablePoolFactory.getAddress();
    deployments.push({ 
      name: "StablePoolFactory", 
      address: stablePoolFactoryAddress, 
      args: [vaultAddress, pauseWindowDuration] 
    });
    console.log(`✅ StablePoolFactory deployed: ${stablePoolFactoryAddress}`);
    
    // 3. Deploy GyroECLPPoolFactory
    console.log("3️⃣ Deploying GyroECLPPoolFactory...");
    const GyroECLPPoolFactoryContract = await ethers.getContractFactory("GyroECLPPoolFactory");
    const gyroECLPFactory = await GyroECLPPoolFactoryContract.deploy(
      vaultAddress,
      pauseWindowDuration
    );
    await gyroECLPFactory.waitForDeployment();
    const gyroECLPFactoryAddress = await gyroECLPFactory.getAddress();
    deployments.push({ 
      name: "GyroECLPPoolFactory", 
      address: gyroECLPFactoryAddress, 
      args: [vaultAddress, pauseWindowDuration] 
    });
    console.log(`✅ GyroECLPPoolFactory deployed: ${gyroECLPFactoryAddress}`);
    
    // 4. Deploy Gyro2CLPPoolFactory
    console.log("4️⃣ Deploying Gyro2CLPPoolFactory...");
    const Gyro2CLPPoolFactoryContract = await ethers.getContractFactory("Gyro2CLPPoolFactory");
    const gyro2CLPFactory = await Gyro2CLPPoolFactoryContract.deploy(
      vaultAddress,
      pauseWindowDuration
    );
    await gyro2CLPFactory.waitForDeployment();
    const gyro2CLPFactoryAddress = await gyro2CLPFactory.getAddress();
    deployments.push({ 
      name: "Gyro2CLPPoolFactory", 
      address: gyro2CLPFactoryAddress, 
      args: [vaultAddress, pauseWindowDuration] 
    });
    console.log(`✅ Gyro2CLPPoolFactory deployed: ${gyro2CLPFactoryAddress}`);
    
    // Verification
    console.log("\n🔍 Starting contract verification...");
    for (const deployment of deployments) {
      await verifyContract(deployment.name, deployment.address, deployment.args);
    }
    
    console.log("\n🎉 PHASE 2 COMPLETE - ALL FACTORY CONTRACTS DEPLOYED!");
    deployments.forEach(d => console.log(`${d.name}: ${d.address}`));
    
    console.log("\n🏆 COMPLETE BALANCER V3 ECOSYSTEM DEPLOYED!");
    console.log("=" .repeat(60));
    console.log("CORE CONTRACTS:");
    console.log("VaultAdmin: 0x16F3A1D447C42711b4B91c9F593cA060ea0F8a64");
    console.log("VaultExtension: 0xA727f17Ca785372cf73cf4bFFd96836888CE5542");
    console.log("ProtocolFeeController: 0xc3755174DB2Ff556B4910750Be14Ad6C3F8E40fb");
    console.log("Vault: 0xcdB7445d555258D3cAADAea6Ee2d6D946fC41F0e");
    console.log("\nROUTER CONTRACTS:");
    console.log("Router: 0xc8faaBAcbf5f3c5Da7395C053a5AD00A7CB48471");
    console.log("BatchRouter: 0x129Ca0F4E29F41027128c21541A135D9CAC8beB8");
    console.log("BufferRouter: 0xcc6ac08743C736c8239D39D95DC4091E74F23857");
    console.log("CompositeLiquidityRouter: 0x6Bd8b87e02f1e1d98e9cb8B07e260ebE0Dd10624");
    console.log("\nFACTORY CONTRACTS:");
    deployments.forEach(d => console.log(`${d.name}: ${d.address}`));
    
  } catch (error) {
    console.error("❌ Phase 2 deployment failed:", error.message);
    throw error;
  }
}

async function verifyContract(name, address, args) {
  try {
    console.log(`🔍 Verifying ${name}...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: args
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
