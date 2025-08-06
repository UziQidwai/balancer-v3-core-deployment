const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 DEPLOYING BALANCER V3 CORE WITH SYMMETRIC APPROACH");
  console.log("=" .repeat(70));
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log(`Network: ${hre.network.name}\n`);
  
  // Deployment tracking
  const deployments = {};
  const startTime = Date.now();
  
  try {
    console.log("🏗️  Phase 1: Address Calculation for Circular Dependencies");
    console.log("-".repeat(50));
    
    // Get current nonce to calculate future addresses
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log(`Current deployer nonce: ${nonce}`);
    
    // Calculate future Vault address (will be deployed 4th after VaultAdmin, VaultExtension, ProtocolFeeController)
    const futureVaultAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: nonce + 3
    });
    
    console.log(`Calculated future Vault address: ${futureVaultAddress}\n`);
    
    console.log("📄 Phase 2: Deploy Core Contracts with Calculated Addresses");
    console.log("-".repeat(50));
    
    // Step 1: Deploy VaultAdmin
    console.log("1️⃣ Deploying VaultAdmin...");
    const VaultAdminFactory = await ethers.getContractFactory("VaultAdmin");
    const vaultAdmin = await VaultAdminFactory.deploy(
      futureVaultAddress,    // vault - calculated future address
      7776000,              // pauseWindowDuration (90 days)
      2592000,              // bufferPeriodDuration (30 days)  
      ethers.parseEther("0.000001"), // minTradeAmount
      ethers.parseEther("0.000001")  // minWrapAmount
    );
    await vaultAdmin.waitForDeployment();
    const vaultAdminAddress = await vaultAdmin.getAddress();
    deployments.VaultAdmin = { address: vaultAdminAddress, args: [futureVaultAddress, 7776000, 2592000, ethers.parseEther("0.000001"), ethers.parseEther("0.000001")] };
    console.log(`✅ VaultAdmin deployed: ${vaultAdminAddress}\n`);
    
    // Step 2: Deploy VaultExtension
    console.log("2️⃣ Deploying VaultExtension...");
    const VaultExtensionFactory = await ethers.getContractFactory("VaultExtension");
    const vaultExtension = await VaultExtensionFactory.deploy(
      futureVaultAddress,    // vault - calculated future address
      vaultAdminAddress      // vaultAdmin - real address
    );
    await vaultExtension.waitForDeployment();
    const vaultExtensionAddress = await vaultExtension.getAddress();
    deployments.VaultExtension = { address: vaultExtensionAddress, args: [futureVaultAddress, vaultAdminAddress] };
    console.log(`✅ VaultExtension deployed: ${vaultExtensionAddress}\n`);
    
    // Step 3: Deploy ProtocolFeeController
    console.log("3️⃣ Deploying ProtocolFeeController...");
    const ProtocolFeeControllerFactory = await ethers.getContractFactory("ProtocolFeeController");
    const protocolFeeController = await ProtocolFeeControllerFactory.deploy(
      futureVaultAddress,              // vault - calculated future address
      ethers.parseEther("0.005"),      // maxYieldValue (0.5%)
      ethers.parseEther("0.005")       // maxAumValue (0.5%)
    );
    await protocolFeeController.waitForDeployment();
    const protocolFeeControllerAddress = await protocolFeeController.getAddress();
    deployments.ProtocolFeeController = { address: protocolFeeControllerAddress, args: [futureVaultAddress, ethers.parseEther("0.005"), ethers.parseEther("0.005")] };
    console.log(`✅ ProtocolFeeController deployed: ${protocolFeeControllerAddress}\n`);
    
    // Step 4: Deploy Vault (should be at calculated address)
    console.log("4️⃣ Deploying Vault...");
    const VaultFactory = await ethers.getContractFactory("Vault");
    const vault = await VaultFactory.deploy(
      vaultExtensionAddress,         // vaultExtension - real address
      deployer.address,              // authorizer - deployer is admin
      protocolFeeControllerAddress   // protocolFeeController - real address
    );
    await vault.waitForDeployment();
    const actualVaultAddress = await vault.getAddress();
    deployments.Vault = { address: actualVaultAddress, args: [vaultExtensionAddress, deployer.address, protocolFeeControllerAddress] };
    
    // Verify address calculation
    if (actualVaultAddress.toLowerCase() === futureVaultAddress.toLowerCase()) {
      console.log(`✅ Address calculation CORRECT! Vault at: ${actualVaultAddress}\n`);
    } else {
      console.warn(`⚠️  Address mismatch - Expected: ${futureVaultAddress}, Got: ${actualVaultAddress}\n`);
    }
    
    console.log("🔍 Phase 3: Immediate Verification");
    console.log("-".repeat(50));
    
    // Verify each contract immediately after deployment
    await verifyContract("VaultAdmin", deployments.VaultAdmin);
    await verifyContract("VaultExtension", deployments.VaultExtension);
    await verifyContract("ProtocolFeeController", deployments.ProtocolFeeController);
    await verifyContract("Vault", deployments.Vault);
    
    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=" .repeat(70));
    
    Object.entries(deployments).forEach(([name, info]) => {
      console.log(`   ${name}: ${info.address}`);
    });
    
    console.log(`\n⏱️  Total time: ${duration}s`);
    console.log(`👑 You are the admin/authorizer with full protocol control!`);
    
    // Save deployments
    saveDeployments(deployments);
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

async function verifyContract(name, deployment, maxRetries = 3) {
  const { address, args } = deployment;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Verifying ${name} at ${address} (attempt ${attempt}/${maxRetries})`);
      
      // Wait a bit for contract to propagate
      if (attempt === 1) {
        console.log("   ⏳ Waiting 10 seconds for contract propagation...");
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: args
      });
      
      console.log(`✅ ${name} verified successfully!`);
      return true;
      
    } catch (error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes("already verified")) {
        console.log(`ℹ️  ${name} already verified - skipping`);
        return true;
      }
      
      if (attempt < maxRetries) {
        console.log(`⚠️  Verification attempt ${attempt} failed: ${error.message}`);
        console.log(`   🔄 Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.warn(`❌ Verification failed for ${name} after ${maxRetries} attempts`);
        console.warn(`   Manual command: npx hardhat verify --network sepolia ${address} ${args.map(arg => `"${arg.toString()}"`).join(' ')}`);
        return false;
      }
    }
  }
  
  return false;
}

function saveDeployments(deployments) {
  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentData = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    timestamp: new Date().toISOString(),
    contracts: deployments
  };
  
  const filename = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
  console.log(`📁 Deployment data saved to: ${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
