# PrediChain - Decentralized Prediction Markets on BNB Chain

<<<<<<< HEAD
[![Tests](https://github.com/yourusername/predichain/actions/workflows/test.yml/badge.svg)](https://github.com/yourusername/predichain/actions/workflows/test.yml)
=======
[![Tests](https://github.com/elghonerox/predichain/actions/workflows/test.yml/badge.svg)](https://github.com/elghonerox/predichain/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/elghonerox/predichain/branch/main/graph/badge.svg)](https://codecov.io/gh/elghonerox/predichain)
>>>>>>> 04673b6f8d687b675c1d55d158a9678dc174f27d
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**PrediChain** is a decentralized prediction market platform built on BNB Chain, enabling users to create and trade on crypto price predictions with production-grade security.

## 🌟 Key Features

- **⚡ Fast Resolution**: Markets resolve in hours using TWAP oracle (vs. 24-48 hours for competitors)
- **🔒 Flash Loan Protection**: TWAP oracle with 1-hour minimum period and time-span validation
- **🛡️ Circuit Breaker**: Automatic protection against price manipulation (>50% deviation)
- **⏱️ Timelock Security**: 2-day delay for protocol fee withdrawals
- **📊 2% Trading Fees**: Sustainable revenue model with transparent fee distribution

## 🏗️ Architecture

```
┌─────────────────┐
│ PredictionMarket│  ← Core contract (upgradeable, pausable)
└────────┬────────┘
         │
    ┌────┴────┬─────────┐
    │         │         │
┌───▼───┐ ┌──▼──┐ ┌────▼────┐
│Oracle │ │Treas│ │Frontend │
│Adapter│ │ury  │ │(Next.js)│
└───┬───┘ └─────┘ └─────────┘
    │
┌───▼────────┐
│  Redstone  │  ← Price feeds (BTC, ETH, BNB)
│  Finance   │
└────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- BNB Chain wallet with testnet BNB

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/predichain.git
cd predichain

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your private key and API keys

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.js --network bscTestnet
```

## 📊 Testing

```bash
# Run tests
npx hardhat test

# Run gas reporter
REPORT_GAS=true npx hardhat test
```

## 🔐 Security

- **Audit Status**: In Progress (Preparing for professional audit)
- **Security Features**:
  - ✅ TWAP oracle with time-span validation (flash loan protection)
  - ✅ Circuit breaker with revert logic (price manipulation protection)
  - ✅ Oracle rate limiting (5-min minimum between updates)
  - ✅ Emergency pause mechanism
  - ✅ Timelock withdrawals (rug pull protection)
  - ✅ Reentrancy guards on all state-changing functions
  - ✅ Comprehensive input validation

- **Known Limitations**:
  - ⚠️ Oracle updates are manual (automated feeds planned for Q2 2026)
  - ⚠️ No formal security audit yet (scheduled for Q1 2026)
  - ⚠️ Gasless UX not implemented (roadmap item)

See [SECURITY.md](./SECURITY.md) for details.

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Step-by-step deployment instructions
- [Operations Manual](./OPERATIONS_MANUAL.md) - Day-to-day operations
- [Security Policy](./SECURITY.md) - Security features and audit preparation
- [Architecture Deep Dive](./docs/ARCHITECTURE_DEEP_DIVE.md) - Technical details
- [Gas Optimization Report](./docs/GAS_OPTIMIZATION.md) - Performance analysis

## 🛠️ Tech Stack

**Smart Contracts**:
- Solidity 0.8.20
- OpenZeppelin Contracts (Upgradeable)
- Hardhat development environment

**Frontend**:
- Next.js 14
- TypeScript
- wagmi + viem (Web3 integration)
- TailwindCSS

**Oracles**:
- Redstone Finance (primary)
- Chainlink (backup)

**Infrastructure**:
- BNB Chain (Mainnet & Testnet)
- Tenderly (monitoring)
- Gnosis Safe (multi-sig)

## 📝 Smart Contracts

| Contract | Address (Testnet) | Description |
|----------|-------------------|-------------|
| PredictionMarket | `0x...` | Core prediction market logic |
| OracleAdapter | `0x...` | TWAP oracle with circuit breaker |
| Treasury | `0x...` | Fee collection with timelock |

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Core smart contracts
- [x] TWAP oracle integration
- [x] Comprehensive testing (90%+ coverage)
- [x] Deployment automation
- [ ] External audit

### Phase 2: Launch
- [ ] Mainnet deployment
- [ ] Gasless UX (Plena Finance)
- [ ] Marketing campaign
- [ ] Liquidity incentives

### Phase 3: Expansion
- [ ] Additional market types (DeFi metrics, NFT floors)
- [ ] Mobile PWA
- [ ] Governance token launch
- [ ] DAO formation

## 🤝 Contributing

Contributions are welcome!.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **Demo**: https://predichain.vercel.app
- **X**: [@PrediChain](https://x.com/predichain)
- **Discord**: [Join our community](https://discord.gg/predichai
