// scripts/deploy-vault-with-precalculation.js
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 DEPLOYING VAULT WITH ADDRESS PRE-CALCULATION");
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  // Get current nonce for address calculation
  const currentNonce = await ethers.provider.getTransactionCount(deployer.address);
  console.log(`Current nonce: ${currentNonce}`);
  
  // Pre-calculate ALL contract addresses
  const vaultAdminAddress = ethers.getCreateAddress({ 
    from: deployer.address, 
    nonce: currentNonce 
  });
  const vaultExtensionAddress = ethers.getCreateAddress({ 
    from: deployer.address, 
    nonce: currentNonce + 1 
  });
  const protocolFeeControllerAddress = ethers.getCreateAddress({ 
    from: deployer.address, 
    nonce: currentNonce + 2 
  });
  const vaultAddress = ethers.getCreateAddress({ 
    from: deployer.address, 
    nonce: currentNonce + 3 
  });
  
  console.log("Pre-calculated addresses:");
  console.log(`VaultAdmin: ${vaultAdminAddress}`);
  console.log(`VaultExtension: ${vaultExtensionAddress}`);
  console.log(`ProtocolFeeController: ${protocolFeeControllerAddress}`);
  console.log(`Vault: ${vaultAddress}`);
  
  try {
    // Deploy in exact order with calculated addresses
    console.log("\n1️⃣ Deploying VaultAdmin...");
    const VaultAdminFactory = await ethers.getContractFactory("VaultAdmin");
    const vaultAdmin = await VaultAdminFactory.deploy(
      vaultAddress,                     // vault address (pre-calculated)
      7776000,                         // pauseWindowDuration (90 days)
      2592000,                         // bufferPeriodDuration (30 days)
      ethers.parseEther("0.000001"),   // minTradeAmount
      ethers.parseEther("0.000001")    // minWrapAmount
    );
    await vaultAdmin.waitForDeployment();
    console.log(`✅ VaultAdmin deployed: ${await vaultAdmin.getAddress()}`);
    
    console.log("2️⃣ Deploying VaultExtension...");
    const VaultExtensionFactory = await ethers.getContractFactory("VaultExtension");
    const vaultExtension = await VaultExtensionFactory.deploy(
      vaultAddress,                    // vault address (pre-calculated)
      await vaultAdmin.getAddress()    // vaultAdmin address (actual)
    );
    await vaultExtension.waitForDeployment();
    console.log(`✅ VaultExtension deployed: ${await vaultExtension.getAddress()}`);
    
    console.log("3️⃣ Deploying ProtocolFeeController...");
    const ProtocolFeeControllerFactory = await ethers.getContractFactory("ProtocolFeeController");
    const protocolFeeController = await ProtocolFeeControllerFactory.deploy(
      vaultAddress,                    // vault address (pre-calculated)
      ethers.parseEther("0.005"),      // maxYieldValue (0.5%)
      ethers.parseEther("0.005")       // maxAumValue (0.5%)
    );
    await protocolFeeController.waitForDeployment();
    console.log(`✅ ProtocolFeeController deployed: ${await protocolFeeController.getAddress()}`);
    
    console.log("4️⃣ Deploying Vault...");
    const VaultFactory = await ethers.getContractFactory("Vault");
    const vault = await VaultFactory.deploy(
      await vaultExtension.getAddress(),      // vaultExtension address (actual)
      deployer.address,                       // authorizer (deployer)
      await protocolFeeController.getAddress() // protocolFeeController address (actual)
    );
    await vault.waitForDeployment();
    const actualVaultAddress = await vault.getAddress();
    
    // Verify address calculation was correct
    if (actualVaultAddress.toLowerCase() === vaultAddress.toLowerCase()) {
      console.log(`✅ Address calculation PERFECT! Vault: ${actualVaultAddress}`);
    } else {
      console.error(`❌ Address mismatch - Expected: ${vaultAddress}, Got: ${actualVaultAddress}`);
    }
    
    console.log("\n🎉 BALANCER V3 DEPLOYMENT COMPLETE!");
    console.log("=" .repeat(60));
    console.log(`VaultAdmin: ${await vaultAdmin.getAddress()}`);
    console.log(`VaultExtension: ${await vaultExtension.getAddress()}`);
    console.log(`ProtocolFeeController: ${await protocolFeeController.getAddress()}`);
    console.log(`Vault: ${actualVaultAddress}`);
    
    // Immediate verification
    console.log("\n🔍 Starting contract verification...");
    const contracts = [
      { name: "VaultAdmin", address: await vaultAdmin.getAddress(), args: [vaultAddress, 7776000, 2592000, ethers.parseEther("0.000001"), ethers.parseEther("0.000001")] },
      { name: "VaultExtension", address: await vaultExtension.getAddress(), args: [vaultAddress, await vaultAdmin.getAddress()] },
      { name: "ProtocolFeeController", address: await protocolFeeController.getAddress(), args: [vaultAddress, ethers.parseEther("0.005"), ethers.parseEther("0.005")] },
      { name: "Vault", address: actualVaultAddress, args: [await vaultExtension.getAddress(), deployer.address, await protocolFeeController.getAddress()] }
    ];
    
    for (const contract of contracts) {
      await verifyContract(contract.name, contract.address, contract.args);
    }
    
    console.log("\n🌐 View on Sepolia Etherscan:");
    contracts.forEach(contract => {
      console.log(`${contract.name}: https://sepolia.etherscan.io/address/${contract.address}`);
    });
    
    console.log("\n👑 Deployment successful! You now have a fully functional Balancer V3 core system!");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    throw error;
  }
}

async function verifyContract(name, address, args) {
  try {
    console.log(`🔍 Verifying ${name}...`);
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for propagation
    
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: args
    });
    console.log(`✅ ${name} verified successfully!`);
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log(`ℹ️  ${name} already verified`);
    } else {
      console.warn(`⚠️  ${name} verification failed: ${error.message}`);
      console.warn(`Manual command: npx hardhat verify --network sepolia ${address} ${args.map(arg => `"${arg.toString()}"`).join(' ')}`);
    }
  }
}

main().catch(console.error);
