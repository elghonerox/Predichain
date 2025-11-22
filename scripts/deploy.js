const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 PrediChain Deployment Script");
  console.log("================================\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("📋 Deployment Configuration:");
  console.log(`   Network: ${network}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} BNB`);
  console.log();

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const minBalance = hre.ethers.parseEther("0.1");

  if (balance < minBalance) {
    throw new Error(`❌ Insufficient balance. Need at least 0.1 BNB, have ${hre.ethers.formatEther(balance)} BNB`);
  }

  const deploymentInfo = {
    network: network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {},
  };

  // Deploy OracleAdapter
  console.log("📡 Deploying OracleAdapter...");
  const OracleAdapter = await hre.ethers.getContractFactory("OracleAdapter");
  const oracleAdapter = await OracleAdapter.deploy();
  await oracleAdapter.waitForDeployment();
  const oracleAdapterAddress = await oracleAdapter.getAddress();

  console.log(`   ✅ OracleAdapter deployed at: ${oracleAdapterAddress}`);
  deploymentInfo.contracts.OracleAdapter = {
    address: oracleAdapterAddress,
    deploymentTx: oracleAdapter.deploymentTransaction().hash,
  };

  console.log("   ⏳ Waiting for 3 confirmations...");
  await oracleAdapter.deploymentTransaction().wait(3);
  console.log("   ✅ Confirmed\n");

  // Deploy Treasury
  console.log("💰 Deploying Treasury...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();

  console.log(`   ✅ Treasury deployed at: ${treasuryAddress}`);
  deploymentInfo.contracts.Treasury = {
    address: treasuryAddress,
    deploymentTx: treasury.deploymentTransaction().hash,
  };

  console.log("   ⏳ Waiting for 3 confirmations...");
  await treasury.deploymentTransaction().wait(3);
  console.log("   ✅ Confirmed\n");

  // Deploy PredictionMarket
  console.log("🎯 Deploying PredictionMarket...");
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy();
  await predictionMarket.waitForDeployment();
  const predictionMarketAddress = await predictionMarket.getAddress();

  console.log(`   ✅ PredictionMarket deployed at: ${predictionMarketAddress}`);
  deploymentInfo.contracts.PredictionMarket = {
    address: predictionMarketAddress,
    deploymentTx: predictionMarket.deploymentTransaction().hash,
  };

  console.log("   ⏳ Waiting for 3 confirmations...");
  await predictionMarket.deploymentTransaction().wait(3);
  console.log("   ✅ Confirmed\n");

  // Initialize PredictionMarket
  console.log("⚙️  Initializing PredictionMarket...");
  const initTx = await predictionMarket.initialize(oracleAdapterAddress, treasuryAddress);
  await initTx.wait();
  console.log("   ✅ Initialized\n");

  // Setup initial oracle prices
  console.log("📊 Setting up initial oracle prices...");
  const initialPrices = {
    BTC: hre.ethers.parseEther("50000"),
    ETH: hre.ethers.parseEther("3000"),
    BNB: hre.ethers.parseEther("500"),
  };

  for (const [asset, price] of Object.entries(initialPrices)) {
    console.log(`      - Setting ${asset} price to $${hre.ethers.formatEther(price)}`);
    const tx = await oracleAdapter.updatePrice(asset, price);
    await tx.wait();
  }
  console.log("   ✅ Initial prices set\n");

  // Save deployment info
  console.log("💾 Saving deployment information...");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${network}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`   ✅ Saved to: ${deploymentFile}\n`);

  const latestFile = path.join(deploymentsDir, `${network}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`   ✅ Updated: ${latestFile}\n`);

  // Print summary
  console.log("📊 Deployment Summary:");
  console.log("=====================\n");
  console.log(`✅ Network: ${network}`);
  console.log(`✅ Chain ID: ${deploymentInfo.chainId}`);
  console.log(`✅ Deployer: ${deployer.address}`);
  console.log();
  console.log("📋 Contract Addresses:");
  console.log(`   OracleAdapter:    ${oracleAdapterAddress}`);
  console.log(`   Treasury:         ${treasuryAddress}`);
  console.log(`   PredictionMarket: ${predictionMarketAddress}`);
  console.log();

  const explorerBase = network === "bscTestnet" ? "https://testnet.bscscan.com" : "https://bscscan.com";
  console.log("🔗 BSCScan Links:");
  console.log(`   OracleAdapter:    ${explorerBase}/address/${oracleAdapterAddress}`);
  console.log(`   Treasury:         ${explorerBase}/address/${treasuryAddress}`);
  console.log(`   PredictionMarket: ${explorerBase}/address/${predictionMarketAddress}`);
  console.log();

  console.log("🎉 Deployment completed successfully!");
  console.log();

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
