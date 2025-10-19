# ProposalBox - Privacy-Preserving DAO Governance Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by Zama](https://img.shields.io/badge/Powered%20by-Zama-blue)](https://www.zama.ai/)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636)](https://soliditylang.org/)

A privacy-preserving governance platform built with Zama's Fully Homomorphic Encryption (FHE) technology, enabling secure batch voting and encrypted voting results for DAOs.

🔗 **Live Demo**: [https://proposal-box-gen.vercel.app](https://proposal-box-gen.vercel.app)

🔗 **GitHub Repository**: [https://github.com/dominic5perezd/proposal-box-gen](https://github.com/dominic5perezd/proposal-box-gen)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contracts](#smart-contracts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

ProposalBox is a decentralized governance platform that leverages Zama's FHE technology to provide:

- **Privacy-Preserving Voting**: All votes are encrypted using Fully Homomorphic Encryption
- **Batch Voting**: Vote on multiple proposals in a single transaction to save gas
- **Transparent Results**: Encrypted vote counts that can be decrypted only when authorized
- **DAO Governance**: Complete governance framework for decentralized organizations

### Use Cases

- DAO proposal voting with privacy guarantees
- Community governance decisions
- Private corporate voting
- Grant allocation decisions
- Protocol parameter changes

## ✨ Key Features

### Core Functionality

- ✅ **Create Proposals**: Submit governance proposals with detailed descriptions
- ✅ **Batch Voting**: Vote on up to 50 proposals in a single transaction
- ✅ **Encrypted Votes**: Votes are encrypted client-side using FHE
- ✅ **Vote Aggregation**: Encrypted vote counts with homomorphic addition
- ✅ **Access Control**: Role-based permissions for admins and voters
- ✅ **Proposal States**: Active, Ended, and Executed states with proper lifecycle management

### Privacy Features

- 🔐 Individual votes remain private and encrypted
- 🔐 Only aggregated results can be decrypted by authorized parties
- 🔐 Vote choices protected by FHE during entire process
- 🔐 Gateway decryption for result verification

## 🏗️ Architecture

### System Design

```
┌─────────────────┐         ┌──────────────────┐
│   React DApp    │◄────────┤  Smart Contract  │
│   (Frontend)    │         │  (Blockchain)    │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │                           │
    ┌────▼────┐                 ┌────▼─────┐
    │ FHE SDK │                 │   FHE    │
    │(Client) │                 │ Library  │
    └─────────┘                 └──────────┘
```

### Smart Contract Architecture

- **ProposalBoxGovernor.sol**: Main governance contract with batch voting
- **FHE Integration**: Uses `@fhevm/solidity` for encrypted operations
- **Access Control**: OpenZeppelin-based role management
- **Gas Optimization**: Batch operations and efficient storage

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18.3.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **Web3**:
  - Wagmi 2.18.1
  - RainbowKit 2.2.9
  - Ethers.js 6.15.0
- **UI Components**:
  - Shadcn/ui
  - Radix UI
  - Tailwind CSS 3.4.17
- **State Management**: TanStack React Query 5.83.0

### Smart Contracts

- **Language**: Solidity 0.8.24
- **Framework**: Hardhat 2.22.0
- **FHE Library**: @fhevm/solidity 0.8.0
- **Security**: OpenZeppelin Contracts 5.4.0
- **Testing**: Hardhat Test, Chai

### Development Tools

- **Testing**: Playwright 1.56.1
- **Linting**: ESLint 9.32.0
- **Type Checking**: TypeScript
- **Package Manager**: npm

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask or compatible Web3 wallet
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dominic5perezd/proposal-box-gen.git
   cd proposal-box-gen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   VITE_CONTRACT_ADDRESS=0xeB8B93304C3CEa366D0783B8378BD1F8efbd36b3
   PRIVATE_KEY=your_private_key_here
   SEPOLIA_RPC_URL=your_sepolia_rpc_url
   ```

## 💻 Usage

### Local Development

1. **Start local Hardhat node** (Terminal 1)
   ```bash
   npm run node
   ```

2. **Deploy smart contracts** (Terminal 2)
   ```bash
   npm run deploy:local
   ```

3. **Start frontend development server** (Terminal 3)
   ```bash
   npm run dev
   ```

4. **Access the application**

   Open http://localhost:8082 in your browser

### Creating Test Data

```bash
npx hardhat run scripts/create-test-proposals.cjs --network localhost
```

This creates 3 sample proposals for testing.

### Connecting MetaMask

1. Add Hardhat Network to MetaMask:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

2. Import test account (use private key from Hardhat node output)

3. Connect wallet through RainbowKit button in the app

## 📜 Smart Contracts

### ProposalBoxGovernor Contract

**Main Functions:**

- `createProposal(string description)`: Create a new proposal
- `batchVote(uint256[] proposalIds, uint8[] votes)`: Vote on multiple proposals
- `endProposal(uint256 proposalId)`: End voting period
- `executeProposal(uint256 proposalId)`: Execute passed proposal
- `getProposalsInRange(uint256 start, uint256 end)`: Batch query proposals

**Events:**

- `ProposalCreated(uint256 proposalId, string description)`
- `VoteCast(address voter, uint256 proposalId, uint8 vote)`
- `ProposalEnded(uint256 proposalId)`
- `ProposalExecuted(uint256 proposalId)`

**Roles:**

- `ADMIN_ROLE`: Can end and execute proposals
- `VOTER_ROLE`: Can create proposals and vote

### Contract Addresses

- **Sepolia Testnet**: `0xeB8B93304C3CEa366D0783B8378BD1F8efbd36b3`
- **Local Development**: Deployed dynamically (check `deployment.json`)

## 🧪 Testing

### Run E2E Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode

```bash
npm run test:e2e:ui
```

### View Test Report

```bash
npm run test:e2e:report
```

### Test Coverage

Current test suite includes:
- ✅ Homepage loading
- ✅ Navigation between pages
- ✅ Wallet connection functionality
- ✅ Proposal list display

## 📦 Deployment

### Deploy to Sepolia Testnet

1. **Configure Sepolia RPC**

   Add to `.env`:
   ```env
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   ```

2. **Get Sepolia ETH**

   Use a faucet: https://sepoliafaucet.com/

3. **Deploy contract**
   ```bash
   npm run deploy:sepolia
   ```

### Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

Or use the automated script:
```bash
npm run deploy:vercel
```

## 🗂️ Project Structure

```
proposal-box/
├── contracts/              # Solidity smart contracts
│   └── ProposalBoxGovernor.sol
├── scripts/               # Deployment and utility scripts
│   ├── deploy.cjs
│   ├── deploy-sepolia.cjs
│   ├── create-test-proposals.cjs
│   ├── upload-to-github.js
│   └── deploy-vercel.js
├── src/
│   ├── components/        # React components
│   │   ├── layout/
│   │   ├── voting/
│   │   └── ui/
│   ├── hooks/            # Custom React hooks
│   │   ├── useFHE.ts
│   │   ├── useBatchVote.ts
│   │   └── useProposals.ts
│   ├── lib/              # Utilities and configurations
│   │   ├── contract.ts
│   │   ├── wagmi.ts
│   │   ├── fhe.ts
│   │   └── utils.ts
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Slates.tsx
│   │   ├── SlateDetail.tsx
│   │   └── About.tsx
│   └── types/            # TypeScript type definitions
├── e2e/                  # E2E test files
├── docs/                 # Documentation
├── hardhat.config.cjs    # Hardhat configuration
├── vite.config.ts        # Vite configuration
├── playwright.config.ts  # Playwright configuration
└── package.json          # Dependencies and scripts
```

## 📚 Documentation

Additional documentation available in the repository:

- [Frontend Development Guide](FRONTEND_DEV.md)
- [Backend Development Guide](BACKEND_DEV.md)
- [FHE Implementation Guide](FHE_IMPLEMENTATION_GUIDE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [MetaMask Setup](METAMASK_SETUP.md)
- [Project Summary](PROJECT_SUMMARY.md)

## 🔒 Security

- Never commit `.env` files or private keys
- Use hardware wallets for production deployments
- Audit smart contracts before mainnet deployment
- Follow OpenZeppelin security best practices

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Zama Team** for providing FHE technology and developer support
- **OpenZeppelin** for secure smart contract libraries
- **RainbowKit** for excellent wallet connection UI
- **Wagmi** for comprehensive Web3 React hooks

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Zama FHE**

Last Updated: 2025-10-20
