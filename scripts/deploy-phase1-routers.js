// scripts/deploy-phase1-routers.js
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 DEPLOYING BALANCER V3 ROUTER CONTRACTS - PHASE 1");
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  // Your deployed core contracts
  const vaultAddress = "0xcdB7445d555258D3cAADAea6Ee2d6D946fC41F0e";
  const wethAddress = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"; // Sepolia WETH
  const permit2Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3"; // Universal Permit2
  const routerVersion = "v1.0.0";
  
  const deployments = [];
  
  try {
    // 1. Deploy Router
    console.log("1️⃣ Deploying Router...");
    const RouterFactory = await ethers.getContractFactory("Router");
    const router = await RouterFactory.deploy(
      vaultAddress,
      wethAddress,
      permit2Address,
      routerVersion
    );
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    deployments.push({ 
      name: "Router", 
      address: routerAddress, 
      args: [vaultAddress, wethAddress, permit2Address, routerVersion] 
    });
    console.log(`✅ Router deployed: ${routerAddress}`);
    
    // 2. Deploy BatchRouter
    console.log("2️⃣ Deploying BatchRouter...");
    const BatchRouterFactory = await ethers.getContractFactory("BatchRouter");
    const batchRouter = await BatchRouterFactory.deploy(
      vaultAddress,
      wethAddress,
      permit2Address,
      routerVersion
    );
    await batchRouter.waitForDeployment();
    const batchRouterAddress = await batchRouter.getAddress();
    deployments.push({ 
      name: "BatchRouter", 
      address: batchRouterAddress, 
      args: [vaultAddress, wethAddress, permit2Address, routerVersion] 
    });
    console.log(`✅ BatchRouter deployed: ${batchRouterAddress}`);
    
    // 3. Deploy BufferRouter
    console.log("3️⃣ Deploying BufferRouter...");
    const BufferRouterFactory = await ethers.getContractFactory("BufferRouter");
    const bufferRouter = await BufferRouterFactory.deploy(
      vaultAddress,
      wethAddress,
      permit2Address,
      routerVersion
    );
    await bufferRouter.waitForDeployment();
    const bufferRouterAddress = await bufferRouter.getAddress();
    deployments.push({ 
      name: "BufferRouter", 
      address: bufferRouterAddress, 
      args: [vaultAddress, wethAddress, permit2Address, routerVersion] 
    });
    console.log(`✅ BufferRouter deployed: ${bufferRouterAddress}`);
    
    // 4. Deploy CompositeLiquidityRouter (AggregateRouter)
    console.log("4️⃣ Deploying CompositeLiquidityRouter...");
    const CompositeLiquidityRouterFactory = await ethers.getContractFactory("CompositeLiquidityRouter");
    const compositeLiquidityRouter = await CompositeLiquidityRouterFactory.deploy(
      vaultAddress,
      wethAddress,
      permit2Address,
      routerVersion
    );
    await compositeLiquidityRouter.waitForDeployment();
    const compositeLiquidityRouterAddress = await compositeLiquidityRouter.getAddress();
    deployments.push({ 
      name: "CompositeLiquidityRouter", 
      address: compositeLiquidityRouterAddress, 
      args: [vaultAddress, wethAddress, permit2Address, routerVersion] 
    });
    console.log(`✅ CompositeLiquidityRouter deployed: ${compositeLiquidityRouterAddress}`);
    
    // Verification
    console.log("\n🔍 Starting contract verification...");
    for (const deployment of deployments) {
      await verifyContract(deployment.name, deployment.address, deployment.args);
    }
    
    console.log("\n🎉 PHASE 1 COMPLETE - ALL ROUTER CONTRACTS DEPLOYED!");
    deployments.forEach(d => console.log(`${d.name}: ${d.address}`));
    
  } catch (error) {
    console.error("❌ Phase 1 deployment failed:", error.message);
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
