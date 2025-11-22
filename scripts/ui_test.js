// UI test script: create market, place trade, resolve
require('dotenv').config();
const hre = require('hardhat');

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log('Deployer:', deployer.address);

    const oracleAdapterAddr = "0x27c524BEFC7b14C0Edae2F9979227e2911BFdc0E";
    const treasuryAddr = "0x095aa661AdF5eD7548DF979539cbCF25145AB1A0";
    const predictionMarketAddr = "0xb174f4B30e799c683331CA7815C074BB234153A7";

    const predictionMarket = await hre.ethers.getContractAt('PredictionMarket', predictionMarketAddr);

    // 1. Create market
    const question = "Will BTC price exceed $120,000 by tomorrow?";
    const asset = "BTC";
    const targetPrice = hre.ethers.parseEther('120000');
    const now = await hre.ethers.provider.getBlock('latest').then(b => b.timestamp);
    const resolutionTime = now + 7200; // 2 hours from now

    const txCreate = await predictionMarket.createMarket(question, asset, targetPrice, resolutionTime);
    const receipt = await txCreate.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === 'MarketCreated');
    const marketId = event ? event.args.marketId : 1; // fallback
    console.log('Created marketId:', marketId.toString());

    // 2. Buy a position (YES) with 0.1 BNB
    const tradeAmount = hre.ethers.parseEther('0.1');
    const txBuy = await predictionMarket.connect(deployer).buyPosition(marketId, true, { value: tradeAmount });
    await txBuy.wait();
    console.log('Bought YES position');

    // 3. Fast‑forward time to after resolution
    await hre.network.provider.send('evm_increaseTime', [7200]); // +2h
    await hre.network.provider.send('evm_mine');

    // 4. Resolve market
    const txResolve = await predictionMarket.resolveMarket(marketId);
    await txResolve.wait();
    console.log('Market resolved');

    const market = await predictionMarket.getMarket(marketId);
    console.log('Outcome:', market.outcome);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
