# PrediChain

## 🏆 Seedify Prediction Markets Hackathon Submission

**Track:** YZi Labs Preferred Projects Track  
**Tagline:** Fast-Resolution Prediction Markets with Gasless UX on BNB Chain

### The Problem

Prediction markets face two critical barriers to mainstream adoption:
1. **Slow Resolution**: Current platforms (Augur, UMA OO) require 24-48 hour resolution windows, frustrating users
2. **Complex UX**: Gas fees and wallet management complexity prevent casual users from participating

### Our Solution

**PrediChain** is a prediction market platform on BNB Chain that solves both problems:
- **Fast Resolution**: Redstone oracle integration enables minutes-to-hours resolution (vs. 24-48 hours)
- **Gasless UX**: Account abstraction (Plena Finance) removes gas fees for users
- **Crypto-Native**: Focused on crypto price predictions (high volume, fast resolution)
- **Mobile-First**: Optimized for mobile users

### Why BNB Chain

BNB Chain offers unique advantages for prediction markets:
- **Low Fees**: $0.03 average (vs. $5-50 on Ethereum)
- **Fast Finality**: ~3 seconds (vs. 12+ seconds)
- **Redstone Partnership**: Fast oracle resolution for prediction markets
- **Account Abstraction**: ERC-4337 support for gasless transactions
- **Growing Ecosystem**: $5.5B TVL, 486M+ addresses

### Revenue Model

**Primary Revenue Streams:**
1. **Trading Fees**: 2% of trade volume (collected on every trade)
2. **Premium Subscription**: $9.99/month (advanced analytics, lower fees, early access)

**Projected Revenue:**
- Year 1: $100K-500K (1,000 active users)
- Year 2: $500K-2M (5,000 active users)
- Year 3: $2M-10M (20,000 active users)

---

## 🎯 Key Features

- **Fast Resolution**: Redstone oracle = minutes/hours vs. 24-48 hours
- **Gasless Transactions**: Account abstraction = no gas fees for users
- **Crypto Price Predictions**: Specialized for crypto markets (BTC, ETH, BNB)
- **Mobile-Responsive**: Optimized for mobile users
- **Real-Time Updates**: Live market data and position tracking
- **Fee Collection**: 2% trading fee automatically collected

  ## 🌐 Live Demo

- **Frontend**: https://predichain-3ioehcnrh-hamzas-projects-2a3d5002.vercel.app
- **Demo Video**: https://youtu.be/BDy5iViN8V0

## 📝 Deployed Contracts (BNB Chain Testnet)

| Contract             | Address                                      | BSCScan                                                                                           |
|----------------------|----------------------------------------------|---------------------------------------------------------------------------------------------------|
| **PredictionMarket** | `0xb1C705cf1c065577ddC773C52319d4d24CDbb1BE` | [View on BSCScan](https://testnet.bscscan.com/address/0xb1C705cf1c065577ddC773C52319d4d24CDbb1BE) |
| **OracleAdapter**    | `0x6a9F9D5Cc268C118cCDAA4D353026A069a4F8ECD` | [View on BSCScan](https://testnet.bscscan.com/address/0x6a9F9D5Cc268C118cCDAA4D353026A069a4F8ECD) |
| **Treasury**         | `0x7B1AEc850e98Cc619f463815714B0A6cd69D3299` | [View on BSCScan](https://testnet.bscscan.com/address/0x7B1AEc850e98Cc619f463815714B0A6cd69D3299) |

**Network:** BNB Smart Chain Testnet (Chain ID: 97)

## 🏗️ Tech Stack

- **Blockchain**: BNB Smart Chain (BSC)
- **Smart Contracts**: Solidity 0.8.20
- **Frontend**: Next.js 14, React, TypeScript
- **Web3**: wagmi, viem
- **Oracles**: Redstone Finance (primary), Chainlink (backup)
- **Account Abstraction**: Plena Finance (gasless transactions)
- **Styling**: Tailwind CSS


- **Demo Video**: https://youtu.be/BDy5iViN8V0

---


## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
npm or yarn
MetaMask or Binance Wallet
BNB testnet tokens
```

### Installation

```bash
# Clone repository
git clone [repo-url]
cd seedify-prediction-markets

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values (WalletConnect Project ID, contract addresses)
```

### Smart Contract Deployment

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to BNB testnet
npm run deploy:testnet
```

### Frontend Development

```bash
cd frontend

# Set up environment variables
cp .env.example .env.local
# Add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID and contract addresses

# Run development server
npm run dev
```

---

## 📖 How to Use

### For Users:

1. **Connect Wallet**: Click "Connect Wallet" and select MetaMask, Trust Wallet, or Binance Wallet
2. **Browse Markets**: View active prediction markets on the home page
3. **Create Market**: Click "Create Market" to create a new prediction market
4. **Trade**: Buy "Yes" or "No" positions on active markets
5. **Claim Payouts**: After market resolution, claim payouts for winning positions

### For Market Creators:

1. Navigate to "Create Market"
2. Enter market question, asset, target price, and resolution time
3. Submit transaction (gasless if using account abstraction)
4. Market is created and available for trading

---

## 🏛️ Architecture

**Smart Contracts:**
- `PredictionMarket.sol`: Core market logic (creation, trading, resolution)
- `OracleAdapter.sol`: Oracle integration (Redstone, Chainlink)
- `Treasury.sol`: Fee collection and distribution

**Frontend:**
- Next.js 14 with App Router
- wagmi for Web3 interactions
- Real-time market updates
- Mobile-responsive design

**Key Components:**
- Wallet connection (Web3Modal)
- Market browsing and creation
- Trading interface
- Position management
- Market resolution display

---

## 💰 Revenue Model

**Trading Fees:**
- 2% of trade volume collected on every trade
- Fees sent to Treasury contract
- 80% to protocol, 20% to market creators

**Premium Features:**
- $9.99/month subscription
- Advanced analytics
- Lower trading fees (1.5% vs. 2%)
- Early access to new markets

**Future Revenue:**
- Data monetization (prediction data, sentiment analysis)
- B2B services (oracle-as-a-service, white-label)
- Token launch (utility token with fee discounts)

---

## 🔒 Security

- OpenZeppelin contracts for security (ReentrancyGuard, AccessControl)
- Integer overflow protection (Solidity 0.8+)
- Oracle validation (multiple sources)
- Comprehensive testing (unit + integration tests)

**Known Limitations:**
- MVP focuses on crypto price predictions only
- Oracle price updates require admin (can be automated)
- Testnet deployment (mainnet after security audit)

---

## 🧪 Testing

```bash
# Run smart contract tests
npm test

# Test coverage
# - Market creation
# - Position trading
# - Fee collection
# - Market resolution
# - Treasury operations
```

**Test Coverage:**
- 7 passing tests
- Core flows tested (create, trade, resolve)
- Edge cases covered

---

## 🛣️ Roadmap

**Post-Hackathon:**
- [ ] Mainnet deployment
- [ ] Redstone oracle full integration (automated price updates)
- [ ] Plena Finance account abstraction integration
- [ ] Advanced analytics dashboard
- [ ] Multiple market types (sports, politics, DeFi metrics)
- [ ] Mobile app (React Native)
- [ ] Token launch (utility token)
- [ ] Governance system

---

**Team Info:**

I’m a passionate Web3 builder with a strong interest in decentralized finance and cross-chain infrastructure. My background includes exploring and experimenting with DeFi protocol design, understanding how Layer 2 scaling solutions improve blockchain performance, and studying zero-knowledge proofs for secure and privacy-preserving applications. I also enjoy analyzing tokenomics models, especially those designed for emerging markets, where incentives and accessibility matter most. Beyond infrastructure, I’m deeply interested in blockchain gaming and the potential of on-chain economies.

Even though I am solo builder for this project, I am open minded to collaboration, learn continuousling from mentors, and focus on creating practical, user-centered products. My motivation comes from solving real problems with decentralized technology and pushing the boundaries of what’s possible in Web3.

---

## 🙏 Acknowledgments

- Seedify for hosting this incredible hackathon
- BNB Chain for infrastructure and support
- YZi Labs for problem space guidance
- Redstone Finance for oracle solutions
- Plena Finance for account abstraction
- OpenZeppelin for security libraries

---

## 📄 License

MIT License - See LICENSE file for details


---

## 🏆 Hackathon Submission Requirements


### 🔥 Key Differentiators

**Fast Resolution:**
- Redstone oracle = minutes/hours vs. 24-48 hours (UMA OO)
- Solves major user frustration

**Gasless UX:**
- Account abstraction = no gas fees for users
- Removes barrier to mainstream adoption

**BNB Chain Native:**
- Leverages BNB Chain partnerships (Redstone)
- Low fees ($0.03 vs. $5+ on Ethereum)
- Fast finality (3 seconds vs. 12+ seconds)

---

## Project Description

PrediChain solves two critical barriers preventing prediction market adoption: slow resolution (24-48 hours) and complex UX (gas fees). Our platform leverages BNB Chain's Redstone oracle partnership for fast resolution (minutes/hours) and account abstraction for gasless transactions. Focused on crypto price predictions, PrediChain offers a mobile-first experience with real-time updates. Revenue model: 2% trading fees plus $9.99/month premium subscriptions. We target crypto traders seeking fast outcomes and casual users deterred by gas fees. BNB Chain's low fees ($0.03), fast finality (3s), and oracle partnerships make it ideal for prediction markets. Projected Year 1 revenue: $100K-500K with 1,000 active users. Post-hackathon: mainnet deployment, automated oracle integration, token launch, and expansion to sports/politics markets.

---
