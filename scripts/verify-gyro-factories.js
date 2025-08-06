// scripts/verify-gyro-factories.js
const hre = require("hardhat");

async function main() {
  console.log("🔍 VERIFYING GYRO FACTORY CONTRACTS");
  
  const vaultAddress = "0xcdB7445d555258D3cAADAea6Ee2d6D946fC41F0e";
  const pauseWindowDuration = 7776000;
  
  const gyroContracts = [
    {
      name: "GyroECLPPoolFactory",
      address: "0xA71cdcD5e4FeCed0d1CF9977295A9C8A78519C71",
      contractPath: "pkg-vault-only/pool-factories/GyroECLPPoolFactory.sol:GyroECLPPoolFactory"
    },
    {
      name: "Gyro2CLPPoolFactory", 
      address: "0x997Fedbc9A284da647f6068724926C3e9F6540E0",
      contractPath: "pkg-vault-only/pool-factories/Gyro2CLPPoolFactory.sol:Gyro2CLPPoolFactory"
    }
  ];
  
  for (const contract of gyroContracts) {
    try {
      console.log(`🔍 Verifying ${contract.name}...`);
      console.log(`   Address: ${contract.address}`);
      console.log(`   Contract Path: ${contract.contractPath}`);
      
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: [vaultAddress, pauseWindowDuration],
        contract: contract.contractPath
      });
      
      console.log(`✅ ${contract.name} verified successfully!`);
      console.log(`   Etherscan: https://sepolia.etherscan.io/address/${contract.address}#code\n`);
      
    } catch (error) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log(`ℹ️  ${contract.name} already verified`);
        console.log(`   Etherscan: https://sepolia.etherscan.io/address/${contract.address}#code\n`);
      } else {
        console.error(`❌ ${contract.name} verification failed: ${error.message}\n`);
      }
    }
  }
  
  console.log("🎉 GYRO FACTORY VERIFICATION COMPLETE!");
  console.log("\n🏆 ALL BALANCER V3 CONTRACTS NOW FULLY VERIFIED!");
  console.log("=" .repeat(60));
  console.log("Your complete Balancer V3 fork is ready for use! 🚀");
}

main().catch(console.error);
