// Full UI test on Hardhat network: deploy contracts, create market, trade, resolve
require('dotenv').config();
const hre = require('hardhat');

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log('Deployer:', deployer.address);

    // Deploy contracts
    const OracleAdapter = await hre.ethers.getContractFactory('OracleAdapter');
    const oracleAdapter = await OracleAdapter.deploy();
    await oracleAdapter.waitForDeployment();
    console.log('OracleAdapter:', await oracleAdapter.getAddress());

    const Treasury = await hre.ethers.getContractFactory('Treasury');
    const treasury = await Treasury.deploy();
    await treasury.waitForDeployment();
    console.log('Treasury:', await treasury.getAddress());

    const PredictionMarket = await hre.ethers.getContractFactory('PredictionMarket');
    const predictionMarket = await PredictionMarket.deploy();
    await predictionMarket.waitForDeployment();
    console.log('PredictionMarket:', await predictionMarket.getAddress());

    // Initialize PredictionMarket
    await predictionMarket.initialize(await oracleAdapter.getAddress(), await treasury.getAddress());

    // Set initial price
    await oracleAdapter.updatePrice('BTC', hre.ethers.parseEther('50000'));

    // Create market (resolution in 2 hours)
    const question = 'Will BTC price exceed $120,000 in 2 hours?';
    const asset = 'BTC';
    const targetPrice = hre.ethers.parseEther('120000');
    const now = (await hre.ethers.provider.getBlock('latest')).timestamp;
    const resolutionTime = now + 7200; // 2h
    const txCreate = await predictionMarket.createMarket(question, asset, targetPrice, resolutionTime);
    const receipt = await txCreate.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === 'MarketCreated');
    const marketId = event ? event.args.marketId : 1;
    console.log('Created marketId:', marketId.toString());

    // Buy YES position with 0.1 BNB
    const tradeAmount = hre.ethers.parseEther('0.1');
    await predictionMarket.connect(deployer).buyPosition(marketId, true, { value: tradeAmount });
    console.log('Bought YES position');

    // Fast‑forward time to after resolution
    await hre.network.provider.send('evm_increaseTime', [7200]);
    await hre.network.provider.send('evm_mine');

    // Resolve market
    await predictionMarket.resolveMarket(marketId);
    console.log('Market resolved');

    const market = await predictionMarket.getMarket(marketId);
    console.log('Outcome (true = price >= target):', market.outcome);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
