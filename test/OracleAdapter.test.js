const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("OracleAdapter - Comprehensive Tests", function () {
    let oracleAdapter;
    let owner, feeder1, feeder2, unauthorized;

    const BTC_PRICE = ethers.parseEther("50000");
    const ETH_PRICE = ethers.parseEther("3000");

    beforeEach(async function () {
        [owner, feeder1, feeder2, unauthorized] = await ethers.getSigners();

        const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
        oracleAdapter = await OracleAdapter.deploy();
        await oracleAdapter.waitForDeployment();
    });

    describe("Price Updates", function () {
        it("Should allow owner to update price", async function () {
            await expect(oracleAdapter.updatePrice("BTC", BTC_PRICE))
                .to.emit(oracleAdapter, "PriceUpdated")
                .withArgs("BTC", BTC_PRICE, await time.latest() + 1, owner.address);

            const [price, timestamp] = await oracleAdapter.getPrice("BTC");
            expect(price).to.equal(BTC_PRICE);
        });

        it("Should reject unauthorized price updates", async function () {
            await expect(
                oracleAdapter.connect(unauthorized).updatePrice("BTC", BTC_PRICE)
            ).to.be.revertedWith("Not authorized feeder");
        });

        it("Should reject zero price", async function () {
            await expect(
                oracleAdapter.updatePrice("BTC", 0)
            ).to.be.revertedWith("Price must be positive");
        });

        it("Should reject empty asset", async function () {
            await expect(
                oracleAdapter.updatePrice("", BTC_PRICE)
            ).to.be.revertedWith("Asset cannot be empty");
        });

        it("Should trigger circuit breaker on large deviation", async function () {
            // Set initial price
            await oracleAdapter.updatePrice("BTC", BTC_PRICE);

            // Try to update with 100% increase (> 50% max deviation)
            const doublePrice = BTC_PRICE * BigInt(2);

            // This should trigger circuit breaker but NOT revert (returns early)
            await expect(
                oracleAdapter.updatePrice("BTC", doublePrice)
            ).to.emit(oracleAdapter, "CircuitBreakerTriggered");

            // Circuit breaker should now be active
            expect(await oracleAdapter.circuitBreakerActive()).to.be.true;
        });

        it("Should allow updates within deviation limit", async function () {
            await oracleAdapter.updatePrice("BTC", BTC_PRICE);

            // 40% increase (< 50% max deviation)
            const increasedPrice = (BTC_PRICE * BigInt(140)) / BigInt(100);

            await expect(oracleAdapter.updatePrice("BTC", increasedPrice)).to.not.be.reverted;
        });

        it("Should update price history", async function () {
            await oracleAdapter.updatePrice("BTC", BTC_PRICE);

            const history = await oracleAdapter.getPriceHistory("BTC");
            expect(history.length).to.equal(1);
            expect(history[0].price).to.equal(BTC_PRICE);
        });
    });

    describe("Batch Updates", function () {
        it("Should allow batch price updates", async function () {
            const assets = ["BTC", "ETH", "BNB"];
            const prices = [
                ethers.parseEther("50000"),
                ethers.parseEther("3000"),
                ethers.parseEther("500"),
            ];

            await expect(oracleAdapter.batchUpdatePrices(assets, prices)).to.not.be.reverted;

            // Verify all prices were updated
            const [btcPrice] = await oracleAdapter.getPrice("BTC");
            const [ethPrice] = await oracleAdapter.getPrice("ETH");
            const [bnbPrice] = await oracleAdapter.getPrice("BNB");

            expect(btcPrice).to.equal(prices[0]);
            expect(ethPrice).to.equal(prices[1]);
            expect(bnbPrice).to.equal(prices[2]);
        });

        it("Should reject mismatched array lengths", async function () {
            const assets = ["BTC", "ETH"];
            const prices = [ethers.parseEther("50000")]; // Length mismatch

            await expect(
                oracleAdapter.batchUpdatePrices(assets, prices)
            ).to.be.revertedWith("Array length mismatch");
        });

        it("Should reject batch > 50 assets", async function () {
            const assets = Array(51).fill("BTC");
            const prices = Array(51).fill(BTC_PRICE);

            await expect(
                oracleAdapter.batchUpdatePrices(assets, prices)
            ).to.be.revertedWith("Batch too large");
        });

        it("Should reject batch with zero price", async function () {
            const assets = ["BTC", "ETH"];
            const prices = [BTC_PRICE, 0];

            await expect(
                oracleAdapter.batchUpdatePrices(assets, prices)
            ).to.be.revertedWith("Invalid price in batch");
        });
    });

    describe("TWAP Calculation", function () {
        beforeEach(async function () {
            // Create price history for TWAP
            await oracleAdapter.updatePrice("BTC", ethers.parseEther("50000"));

            for (let i = 1; i <= 5; i++) {
                await time.increase(600); // 10 minutes
                const price = ethers.parseEther((50000 + i * 1000).toString());
                await oracleAdapter.updatePrice("BTC", price);
            }
        });

        it("Should calculate TWAP correctly", async function () {
            const [twapPrice, timestamp] = await oracleAdapter.getTWAPPrice("BTC", 3600);

            expect(twapPrice).to.be.gt(ethers.parseEther("50000"));
            expect(twapPrice).to.be.lt(ethers.parseEther("56000"));
        });

        it("Should reject TWAP period too short", async function () {
            await expect(
                oracleAdapter.getTWAPPrice("BTC", 1800) // 30 minutes < 1 hour min
            ).to.be.revertedWith("TWAP period too short");
        });

        it("Should reject TWAP with insufficient history", async function () {
            await expect(
                oracleAdapter.getTWAPPrice("ETH", 3600) // No ETH price history
            ).to.be.revertedWith("Insufficient price history");
        });
    });

    describe("Price Validity", function () {
        it("Should reject stale prices", async function () {
            await oracleAdapter.updatePrice("BTC", BTC_PRICE);

            // Fast forward beyond validity period (5 minutes)
            await time.increase(301);

            await expect(oracleAdapter.getPrice("BTC")).to.be.revertedWith("Price too stale");
        });

        it("Should return fresh prices", async function () {
            await oracleAdapter.updatePrice("BTC", BTC_PRICE);

            // Within validity period
            await time.increase(200); // 3.3 minutes

            const [price] = await oracleAdapter.getPrice("BTC");
            expect(price).to.equal(BTC_PRICE);
        });

        it("Should reject getting invalid prices", async function () {
            await expect(oracleAdapter.getPrice("XYZ")).to.be.revertedWith("Price not available");
        });
    });

    describe("Feeder Authorization", function () {
        it("Should allow owner to authorize feeders", async function () {
            await expect(oracleAdapter.setFeederAuthorization(feeder1.address, true))
                .to.emit(oracleAdapter, "FeederAuthorized")
                .withArgs(feeder1.address, true);

            expect(await oracleAdapter.authorizedFeeders(feeder1.address)).to.be.true;
        });

        it("Should allow authorized feeder to update prices", async function () {
            await oracleAdapter.setFeederAuthorization(feeder1.address, true);

            await expect(
                oracleAdapter.connect(feeder1).updatePrice("BTC", BTC_PRICE)
            ).to.not.be.reverted;
        });

        it("Should allow owner to revoke feeder", async function () {
            await oracleAdapter.setFeederAuthorization(feeder1.address, true);
            await oracleAdapter.setFeederAuthorization(feeder1.address, false);

            await expect(
                oracleAdapter.connect(feeder1).updatePrice("BTC", BTC_PRICE)
            ).to.be.revertedWith("Not authorized feeder");
        });

        it("Should reject zero address as feeder", async function () {
            await expect(
                oracleAdapter.setFeederAuthorization(ethers.ZeroAddress, true)
            ).to.be.revertedWith("Invalid feeder address");
        });
    });

    describe("Circuit Breaker", function () {
        beforeEach(async function () {
            await oracleAdapter.updatePrice("BTC", BTC_PRICE);

            // Trigger circuit breaker by attempting large price deviation
            const doublePrice = BTC_PRICE * BigInt(2);
            // This will revert but also activate the circuit breaker
            await oracleAdapter.updatePrice("BTC", doublePrice).catch(() => { });
        });

        it("Should block updates when circuit breaker active", async function () {
            await expect(
                oracleAdapter.updatePrice("ETH", ETH_PRICE)
            ).to.be.revertedWith("Circuit breaker active");
        });

        it("Should allow owner to reset circuit breaker", async function () {
            await expect(oracleAdapter.resetCircuitBreaker())
                .to.emit(oracleAdapter, "CircuitBreakerReset");

            expect(await oracleAdapter.circuitBreakerActive()).to.be.false;
        });

        it("Should allow updates after circuit breaker reset", async function () {
            await oracleAdapter.resetCircuitBreaker();

            await expect(oracleAdapter.updatePrice("ETH", ETH_PRICE)).to.not.be.reverted;
        });
    });

    describe("Availability Check", function () {
        it("Should return true when oracle available", async function () {
            expect(await oracleAdapter.isAvailable()).to.be.true;
        });

        it("Should return false when circuit breaker active", async function () {
            await oracleAdapter.updatePrice("BTC", BTC_PRICE);

            // Trigger circuit breaker by attempting large price deviation
            const doublePrice = BTC_PRICE * BigInt(2);
            // This will revert but also activate the circuit breaker
            await oracleAdapter.updatePrice("BTC", doublePrice).catch(() => { });

            // Now circuit breaker should be active
            expect(await oracleAdapter.isAvailable()).to.be.false;
        });
    });
});
