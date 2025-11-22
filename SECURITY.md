# Security Policy

## Reporting a Vulnerability

**Please DO NOT file a public issue for security vulnerabilities.**

If you discover a security vulnerability in PrediChain, please send an email to:

**security@predichain.io** (or your actual security contact)

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and provide a timeline for a fix.

## Security Features

### Smart Contract Security

#### 1. Oracle Manipulation Prevention
- **TWAP (Time-Weighted Average Price)**: 1-hour minimum period prevents flash loan attacks
- **Circuit Breaker**: Automatically triggers if price deviates >50%
- **Price Staleness Checks**: Prices expire after 5 minutes

#### 2. Reentrancy Protection
- All state-changing functions use `nonReentrant` modifier
- Checks-Effects-Interactions pattern implemented
- No external calls before state updates

#### 3. Emergency Controls
- **Pause Mechanism**: Owner can pause all trading in crisis
- **Market Cancellation**: Emergency market cancellation with refunds
- **Timelock Withdrawals**: 2-day delay for protocol fee withdrawals

#### 4. Access Control
- **Multi-sig Recommended**: Owner should be Gnosis Safe (3-of-5 minimum)
- **Authorized Feeders**: Multiple oracle price sources for redundancy
- **Fee Rate Caps**: Maximum 10% protocol fee (hard-coded)

### Known Limitations

1. **Oracle Dependency**: System relies on oracle price feeds
   - Mitigation: TWAP + circuit breaker + multi-source validation

2. **Centralized Resolution**: Markets resolve based on oracle data
   - Mitigation: Decentralized oracle integration (Redstone Finance)

3. **Gas Price Volatility**: High gas prices may affect user experience
   - Mitigation: BNB Chain has low gas fees (~$0.10-0.50/tx)

## Audit Status

- **Status**: Pending
- **Recommended Firms**:
  - Hacken (BNB Chain specialized) - $15-20K, 2 weeks
  - CertiK (Industry standard) - $25-35K, 3 weeks
  - PeckShield - $20-30K, 2-3 weeks

## Security Checklist (Pre-Audit)

- [x] Reentrancy guards on all state-changing functions
- [x] TWAP oracle integration
- [x] Circuit breaker for price manipulation
- [x] Emergency pause mechanism
- [x] Timelock for sensitive operations
- [x] Fee rate caps
- [x] Input validation on all parameters
- [x] DoS prevention (market creation limits)
- [x] Comprehensive NatSpec documentation
- [ ] Formal verification (optional, expensive)
- [ ] External audit by reputable firm
- [ ] Bug bounty program (post-launch)

## Bug Bounty Program

**Status**: Planned for post-launch

**Rewards**:
- Critical: Up to $50,000
- High: Up to $10,000
- Medium: Up to $5,000
- Low: Up to $1,000

## Security Best Practices for Users

1. **Never share your private key**
2. **Verify contract addresses** before interacting
3. **Start with small amounts** to test functionality
4. **Use hardware wallets** for large holdings
5. **Check BSCScan** for contract verification

## Contact

- **Security Email**: security@predichain.io
- **General Contact**: contact@predichain.io
- **Twitter**: @PrediChain
- **Discord**: discord.gg/predichain
