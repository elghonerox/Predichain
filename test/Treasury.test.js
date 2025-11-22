const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Treasury - Comprehensive Tests", function () {
    let treasury;
    let owner, recipient, unauthorized;

    const FEE_AMOUNT = ethers.parseEther("1"); // 1 BNB

    beforeEach(async function () {
        [owner, recipient, unauthorized] = await ethers.getSigners();

        const Treasury = await ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy();
        await treasury.waitForDeployment();
    });

    describe("Fee Collection", function () {
        it("Should collect fees", async function () {
            // Send BNB to treasury
            await owner.sendTransaction({
                to: await treasury.getAddress(),
                value: FEE_AMOUNT,
            });

            await expect(treasury.collectFee(FEE_AMOUNT))
                .to.emit(treasury, "FeeCollected")
                .withArgs(owner.address, FEE_AMOUNT, await time.latest() + 1);

            expect(await treasury.totalFeesCollected()).to.equal(FEE_AMOUNT);
        });

        it("Should reject zero fee collection", async function () {
            await expect(treasury.collectFee(0)).to.be.revertedWith("Amount must be positive");
        });

        it("Should track total fees collected", async function () {
            await owner.sendTransaction({
                to: await treasury.getAddress(),
                value: FEE_AMOUNT * BigInt(3),
            });

            await treasury.collectFee(FEE_AMOUNT);
            await treasury.collectFee(FEE_AMOUNT);
            await treasury.collectFee(FEE_AMOUNT);

            expect(await treasury.totalFeesCollected()).to.equal(FEE_AMOUNT * BigInt(3));
        });
    });

    describe("Fee Distribution", function () {
        beforeEach(async function () {
            // Fund treasury
            await owner.sendTransaction({
                to: await treasury.getAddress(),
                value: ethers.parseEther("10"),
            });
        });

        it("Should distribute fees to recipient", async function () {
            const balanceBefore = await ethers.provider.getBalance(recipient.address);

            await expect(
                treasury.distributeFees(recipient.address, FEE_AMOUNT, "Market creator reward")
            )
                .to.emit(treasury, "FeesDistributed")
                .withArgs(recipient.address, FEE_AMOUNT, "Market creator reward");

            const balanceAfter = await ethers.provider.getBalance(recipient.address);
            expect(balanceAfter - balanceBefore).to.equal(FEE_AMOUNT);
        });

        it("Should track total fees distributed", async function () {
            await treasury.distributeFees(recipient.address, FEE_AMOUNT, "Test 1");
            await treasury.distributeFees(recipient.address, FEE_AMOUNT, "Test 2");

            expect(await treasury.totalFeesDistributed()).to.equal(FEE_AMOUNT * BigInt(2));
        });

        it("Should reject zero address recipient", async function () {
            await expect(
                treasury.distributeFees(ethers.ZeroAddress, FEE_AMOUNT, "Test")
            ).to.be.revertedWith("Invalid recipient");
        });

        it("Should reject zero amount", async function () {
            await expect(
                treasury.distributeFees(recipient.address, 0, "Test")
            ).to.be.revertedWith("Amount must be positive");
        });

        it("Should reject insufficient balance", async function () {
            const tooMuch = ethers.parseEther("100");

            await expect(
                treasury.distributeFees(recipient.address, tooMuch, "Test")
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should reject non-owner distribution", async function () {
            await expect(
                treasury.connect(unauthorized).distributeFees(recipient.address, FEE_AMOUNT, "Test")
            ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");
        });
    });

    describe("Timelock Withdrawals", function () {
        beforeEach(async function () {
            // Fund treasury
            await owner.sendTransaction({
                to: await treasury.getAddress(),
                value: ethers.parseEther("10"),
            });
        });

        it("Should request withdrawal", async function () {
            const tx = await treasury.requestWithdrawal(recipient.address, FEE_AMOUNT);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                (log) => log.fragment && log.fragment.name === "WithdrawalRequested"
            );

            expect(event).to.not.be.undefined;
        });

        it("Should execute withdrawal after timelock", async function () {
            const tx = await treasury.requestWithdrawal(recipient.address, FEE_AMOUNT);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                (log) => log.fragment && log.fragment.name === "WithdrawalRequested"
            );

            const requestId = event.args[0];

            // Fast forward 2 days
            await time.increase(2 * 24 * 60 * 60);

            const balanceBefore = await ethers.provider.getBalance(recipient.address);

            await expect(treasury.executeWithdrawal(requestId))
                .to.emit(treasury, "WithdrawalExecuted")
                .withArgs(requestId, recipient.address, FEE_AMOUNT);

            const balanceAfter = await ethers.provider.getBalance(recipient.address);
            expect(balanceAfter - balanceBefore).to.equal(FEE_AMOUNT);
        });

        it("Should reject execution before timelock", async function () {
            const tx = await treasury.requestWithdrawal(recipient.address, FEE_AMOUNT);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                (log) => log.fragment && log.fragment.name === "WithdrawalRequested"
            );

            const requestId = event.args[0];

            await expect(
                treasury.executeWithdrawal(requestId)
            ).to.be.revertedWith("Timelock not expired");
        });

        it("Should reject double execution", async function () {
            const tx = await treasury.requestWithdrawal(recipient.address, FEE_AMOUNT);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                (log) => log.fragment && log.fragment.name === "WithdrawalRequested"
            );

            const requestId = event.args[0];

            // Fast forward and execute
            await time.increase(2 * 24 * 60 * 60);
            await treasury.executeWithdrawal(requestId);

            // Try to execute again
            await expect(
                treasury.executeWithdrawal(requestId)
            ).to.be.revertedWith("Already executed");
        });

        it("Should allow cancelling withdrawal", async function () {
            const tx = await treasury.requestWithdrawal(recipient.address, FEE_AMOUNT);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                (log) => log.fragment && log.fragment.name === "WithdrawalRequested"
            );

            const requestId = event.args[0];

            await expect(treasury.cancelWithdrawal(requestId))
                .to.emit(treasury, "WithdrawalCancelled")
                .withArgs(requestId);
        });

        it("Should check if withdrawal is ready", async function () {
            const tx = await treasury.requestWithdrawal(recipient.address, FEE_AMOUNT);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                (log) => log.fragment && log.fragment.name === "WithdrawalRequested"
            );

            const requestId = event.args[0];

            // Not ready yet
            expect(await treasury.isWithdrawalReady(requestId)).to.be.false;

            // Fast forward
            await time.increase(2 * 24 * 60 * 60);

            // Now ready
            expect(await treasury.isWithdrawalReady(requestId)).to.be.true;
        });
    });

    describe("Fee Rate Management", function () {
        it("Should allow owner to set fee rate", async function () {
            await expect(treasury.setFeeRate(90))
                .to.emit(treasury, "FeeRateUpdated")
                .withArgs(80, 90);

            expect(await treasury.protocolFeeRate()).to.equal(90);
        });

        it("Should reject fee rate > 100%", async function () {
            await expect(treasury.setFeeRate(101)).to.be.revertedWith("Rate exceeds 100%");
        });

        it("Should reject fee rate > max cap", async function () {
            // The contract checks <= 100 first, so 1001 will fail on "Rate exceeds 100%"
            // This test verifies the 100% cap is enforced
            await expect(treasury.setFeeRate(1001)).to.be.revertedWith("Rate exceeds 100%");
        });

        it("Should reject non-owner fee rate change", async function () {
            await expect(
                treasury.connect(unauthorized).setFeeRate(90)
            ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");
        });
    });

    describe("View Functions", function () {
        it("Should return correct balance", async function () {
            await owner.sendTransaction({
                to: await treasury.getAddress(),
                value: FEE_AMOUNT,
            });

            expect(await treasury.getBalance()).to.equal(FEE_AMOUNT);
        });

        it("Should return withdrawal request details", async function () {
            await owner.sendTransaction({
                to: await treasury.getAddress(),
                value: FEE_AMOUNT,
            });

            const tx = await treasury.requestWithdrawal(recipient.address, FEE_AMOUNT);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                (log) => log.fragment && log.fragment.name === "WithdrawalRequested"
            );

            const requestId = event.args[0];

            const request = await treasury.getWithdrawalRequest(requestId);
            expect(request.recipient).to.equal(recipient.address);
            expect(request.amount).to.equal(FEE_AMOUNT);
            expect(request.executed).to.be.false;
        });
    });
});
