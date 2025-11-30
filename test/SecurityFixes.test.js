const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Security Fixes Verification", function () {
    let oracleAdapter, treasury, predictionMarket;
    let owner, user1, user2, feeder;

    // Constants
    const MAX_PRICE_DEVIATION = 5000; // 50%
    const PRICE_VALIDITY_PERIOD = 300; // 5 minutes
    const PUBLIC_RESOLUTION_DELAY = 3600; // 1 hour
    const WITHDRAWAL_TIMELOCK = 2 * 24 * 3600; // 2 days

    beforeEach(async function () {
        [owner, user1, user2, feeder] = await ethers.getSigners();

        // Deploy OracleAdapter
        const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
        oracleAdapter = await OracleAdapter.deploy();
        await oracleAdapter.setFeederAuthorization(feeder.address, true);

        // Deploy Treasury
        const Treasury = await ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy();

        // Deploy PredictionMarket
        const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
        predictionMarket = await PredictionMarket.deploy();
        await predictionMarket.initialize(oracleAdapter.target, treasury.target);
    });

    describe("C-1: Batch Update Circuit Breaker Bypass", function () {
        it("Should prevent batch updates with excessive deviation", async function () {
            // Set initial price
            await oracleAdapter.connect(feeder).updatePrice("BTC", ethers.parseEther("50000"));

            // Attempt batch update with >50% deviation (50k -> 80k is 60% increase)
            const assets = ["BTC"];
            const prices = [ethers.parseEther("80000")];

            await expect(
                oracleAdapter.connect(feeder).batchUpdatePrices(assets, prices)
            ).to.be.revertedWith("Circuit breaker triggered in batch");

            // Note: State changes are reverted, so circuitBreakerActive remains false
            // The revert confirms the check is working
        });

        it("Should allow batch updates within deviation limits", async function () {
            // Set initial price
            await oracleAdapter.connect(feeder).updatePrice("ETH", ethers.parseEther("3000"));

            // Attempt batch update with 10% deviation (safe)
            const assets = ["ETH"];
            const prices = [ethers.parseEther("3300")];

            await expect(
                oracleAdapter.connect(feeder).batchUpdatePrices(assets, prices)
            ).to.not.be.reverted;

            const priceData = await oracleAdapter.getPrice("ETH");
            expect(priceData.price).to.equal(ethers.parseEther("3300"));
        });
    });

    describe("C-2: TWAP Manipulation Protection", function () {
        it("Should have increased MAX_PRICE_HISTORY to 1000", async function () {
            const maxHistory = await oracleAdapter.MAX_PRICE_HISTORY();
            expect(maxHistory).to.equal(1000);
        });

        it("Should enforce minimum update interval to prevent stuffing", async function () {
            await oracleAdapter.connect(feeder).updatePrice("SOL", ethers.parseEther("100"));

            // Try to update immediately
            await expect(
                oracleAdapter.connect(feeder).updatePrice("SOL", ethers.parseEther("101"))
            ).to.be.revertedWith("Update too frequent - wait 5 minutes between updates");

            // Wait 5 minutes
            await time.increase(301);

            // Should succeed now
            await expect(
                oracleAdapter.connect(feeder).updatePrice("SOL", ethers.parseEther("101"))
            ).to.not.be.reverted;
        });
    });

    describe("H-1: Resolution Access Control", function () {
        beforeEach(async function () {
            // Create a market
            const now = await time.latest();
            const resolutionTime = now + 3600 + 60; // 1 hour + 1 minute buffer

            await predictionMarket.connect(user1).createMarket(
                "Will BTC hit 100k?",
                "BTC",
                ethers.parseEther("100000"),
                resolutionTime
            );

            // Setup oracle price with sufficient history for TWAP
            await oracleAdapter.connect(feeder).updatePrice("BTC", ethers.parseEther("90000"));

            // Advance time to satisfy MIN_UPDATE_INTERVAL (5 mins)
            await time.increase(300);
            await oracleAdapter.connect(feeder).updatePrice("BTC", ethers.parseEther("92000"));

            // Advance past resolution time and satisfy TWAP period (1 hour)
            await time.increase(3600);
            await oracleAdapter.connect(feeder).updatePrice("BTC", ethers.parseEther("95000"));
        });

        it("Should prevent public resolution before delay period", async function () {
            // User2 (public) tries to resolve immediately after resolution time
            await expect(
                predictionMarket.connect(user2).resolveMarket(1)
            ).to.be.revertedWith("Public resolution window not open yet");
        });

        it("Should allow creator to resolve immediately", async function () {
            await expect(
                predictionMarket.connect(user1).resolveMarket(1)
            ).to.not.be.reverted;
        });

        it("Should allow public resolution after delay period", async function () {
            // Wait for delay period
            await time.increase(PUBLIC_RESOLUTION_DELAY + 1);

            await expect(
                predictionMarket.connect(user2).resolveMarket(1)
            ).to.not.be.reverted;
        });
    });

    describe("H-2: Treasury Reserved Balance Tracking", function () {
        beforeEach(async function () {
            // Fund treasury
            await owner.sendTransaction({
                to: treasury.target,
                value: ethers.parseEther("10.0")
            });
        });

        it("Should reserve funds when withdrawal is requested", async function () {
            const amount = ethers.parseEther("4.0");
            await treasury.requestWithdrawal(user1.address, amount);

            const reserved = await treasury.reservedWithdrawalAmount();
            expect(reserved).to.equal(amount);
        });

        it("Should prevent fee distribution if funds are reserved", async function () {
            // Total balance: 10 ETH
            // Request withdrawal: 8 ETH (Reserved: 8 ETH, Available: 2 ETH)
            await treasury.requestWithdrawal(user1.address, ethers.parseEther("8.0"));

            // Try to distribute 3 ETH (Should fail as only 2 ETH is available)
            await expect(
                treasury.distributeFees(user2.address, ethers.parseEther("3.0"), "Team split")
            ).to.be.revertedWith("Insufficient available balance (reserved for withdrawals)");

            // Try to distribute 1 ETH (Should succeed)
            await expect(
                treasury.distributeFees(user2.address, ethers.parseEther("1.0"), "Team split")
            ).to.not.be.reverted;
        });

        it("Should release reserved funds when withdrawal is executed", async function () {
            const amount = ethers.parseEther("2.0");
            const tx = await treasury.requestWithdrawal(user1.address, amount);
            const receipt = await tx.wait();

            // Get requestId from event
            const event = receipt.logs.find(log => {
                try {
                    return treasury.interface.parseLog(log).name === "WithdrawalRequested";
                } catch (e) { return false; }
            });
            const requestId = treasury.interface.parseLog(event).args[0];

            // Wait for timelock
            await time.increase(WITHDRAWAL_TIMELOCK + 1);

            // Execute
            await treasury.executeWithdrawal(requestId);

            const reserved = await treasury.reservedWithdrawalAmount();
            expect(reserved).to.equal(0);
        });

        it("Should release reserved funds when withdrawal is cancelled", async function () {
            const amount = ethers.parseEther("2.0");
            const tx = await treasury.requestWithdrawal(user1.address, amount);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    return treasury.interface.parseLog(log).name === "WithdrawalRequested";
                } catch (e) { return false; }
            });
            const requestId = treasury.interface.parseLog(event).args[0];

            // Cancel
            await treasury.cancelWithdrawal(requestId);

            const reserved = await treasury.reservedWithdrawalAmount();
            expect(reserved).to.equal(0);
        });
    });
});
