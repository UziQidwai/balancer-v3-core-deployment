const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🚀 COMPLETING BALANCER V3 CORE DEPLOYMENT");
  console.log("=" .repeat(60));
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${hre.network.name}\n`);
  
  // Your successfully deployed addresses
  const vaultAdminAddress = "0x8DacF405f5c08f02995731FA0756B3FFE8e82f8f";
  const vaultExtensionAddress = "0xe24139688a1F650F597Fa14FAFD37889578Eb8FB";  // ✅ Just deployed!
  const futureVaultAddress = "0x5232f37e846e91E67B48B6c2c69824DB5bd25061";  // Calculated
  
  const deployments = {
    VaultAdmin: { address: vaultAdminAddress, args: [futureVaultAddress, 7776000, 2592000, ethers.parseEther("0.000001"), ethers.parseEther("0.000001")] },
    VaultExtension: { address: vaultExtensionAddress, args: [futureVaultAddress, vaultAdminAddress] }
  };
  
  try {
    // Step 1: Deploy ProtocolFeeController
    console.log("3️⃣ Deploying ProtocolFeeController...");
    const ProtocolFeeControllerFactory = await ethers.getContractFactory("ProtocolFeeController");
    const protocolFeeController = await ProtocolFeeControllerFactory.deploy(
      futureVaultAddress,              // vault - calculated future address
      ethers.parseEther("0.005"),      // maxYieldValue (0.5%)
      ethers.parseEther("0.005")       // maxAumValue (0.5%)
    );
    await protocolFeeController.waitForDeployment();
    const protocolFeeControllerAddress = await protocolFeeController.getAddress();
    deployments.ProtocolFeeController = { 
      address: protocolFeeControllerAddress, 
      args: [futureVaultAddress, ethers.parseEther("0.005"), ethers.parseEther("0.005")] 
    };
    console.log(`✅ ProtocolFeeController deployed: ${protocolFeeControllerAddress}\n`);
    
    // Step 2: Deploy Vault (should be at calculated address)
    console.log("4️⃣ Deploying Vault...");
    const VaultFactory = await ethers.getContractFactory("Vault");
    const vault = await VaultFactory.deploy(
      vaultExtensionAddress,         // vaultExtension - real address
      deployer.address,              // authorizer - deployer is admin
      protocolFeeControllerAddress   // protocolFeeController - real address
    );
    await vault.waitForDeployment();
    const actualVaultAddress = await vault.getAddress();
    deployments.Vault = { 
      address: actualVaultAddress, 
      args: [vaultExtensionAddress, deployer.address, protocolFeeControllerAddress] 
    };
    
    // Verify address calculation
    if (actualVaultAddress.toLowerCase() === futureVaultAddress.toLowerCase()) {
      console.log(`✅ Address calculation PERFECT! Vault at: ${actualVaultAddress}\n`);
    } else {
      console.warn(`⚠️  Address mismatch - Expected: ${futureVaultAddress}, Got: ${actualVaultAddress}\n`);
    }
    
    console.log("🔍 Phase 3: Contract Verification");
    console.log("-".repeat(50));
    
    // Verify all contracts
    for (const [name, deployment] of Object.entries(deployments)) {
      await verifyContract(name, deployment);
    }
    
    // Final Summary
    console.log("\n🎉 BALANCER V3 CORE DEPLOYMENT COMPLETE!");
    console.log("=" .repeat(60));
    
    Object.entries(deployments).forEach(([name, info]) => {
      console.log(`   ${name}: ${info.address}`);
    });
    
    console.log(`\n👑 You are the admin/authorizer with full protocol control!`);
    console.log(`🌐 View on Sepolia Etherscan:`);
    Object.entries(deployments).forEach(([name, info]) => {
      console.log(`   ${name}: https://sepolia.etherscan.io/address/${info.address}`);
    });
    
    // Save deployment data
    saveDeployments(deployments);
    
  } catch (error) {
    console.error("\n❌ Remaining deployment failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

async function verifyContract(name, deployment, maxRetries = 3) {
  const { address, args } = deployment;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Verifying ${name} at ${address} (attempt ${attempt}/${maxRetries})`);
      
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
  const fs = require("fs");
  const path = require("path");
  
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
