# ProposalBox Sepolia部署指南

## 前置准备

### 1. 获取Sepolia测试ETH

访问以下任一水龙头：
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia
- https://www.alchemy.com/faucets/ethereum-sepolia

需要至少 0.1 SepoliaETH 用于部署合约

### 2. 配置环境变量

复制 `.env.example` 到 `.env`:
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息：

```env
# WalletConnect Project ID (获取: https://cloud.walletconnect.com/)
VITE_WALLET_CONNECT_ID=your_actual_project_id

# 智能合约地址 (部署后填入)
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Sepolia部署配置
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_without_0x_prefix
```

⚠️ **安全提醒**：
- 不要将 `.env` 文件提交到Git
- 不要在生产环境使用含有真实资金的私钥
- 使用专门的测试钱包地址

### 3. 获取WalletConnect Project ID

1. 访问 https://cloud.walletconnect.com/
2. 注册/登录账号
3. 创建新项目
4. 复制 Project ID 到 `.env` 文件

## 部署步骤

### 1. 编译合约

```bash
npx hardhat compile
```

预期输出：
```
Compiled 14 Solidity files successfully (evm target: cancun).
```

### 2. 部署到Sepolia

```bash
npx hardhat run scripts/deploy-sepolia.cjs --network sepolia
```

预期输出示例：
```
🚀 Deploying ProposalBoxGovernor to Sepolia...
📝 Deployer address: 0x1234...
💰 Deployer balance: 0.5 ETH
⏳ Deploying contract...
✅ ProposalBoxGovernor deployed to: 0xABCD...

📋 Deployment Summary:
Contract Address: 0xABCD...
Network: Sepolia
Deployer: 0x1234...

⚠️  Next Steps:
1. Update CONTRACT_ADDRESS in src/lib/contract.ts
2. Verify contract: npx hardhat verify --network sepolia 0xABCD...
3. Grant VOTER_ROLE to test addresses
```

### 3. 更新前端配置

将部署的合约地址更新到：
- `.env` 文件中的 `VITE_CONTRACT_ADDRESS`
- `src/lib/contract.ts` 中的 `CONTRACT_ADDRESS` 常量

### 4. 验证合约（可选）

在 Etherscan 上验证合约源码：

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 合约管理

### 授予投票权限

部署后，需要给用户授予 VOTER_ROLE 才能投票。

```javascript
// 使用 Hardhat console
npx hardhat console --network sepolia

const contract = await ethers.getContractAt(
  "ProposalBoxGovernor",
  "0xYOUR_CONTRACT_ADDRESS"
);

await contract.grantVoterRole([
  "0xUSER_ADDRESS_1",
  "0xUSER_ADDRESS_2"
]);
```

### 创建提案

只有 ADMIN_ROLE 可以创建提案：

```javascript
await contract.createProposal(
  "提案标题",
  "提案详细描述",
  86400  // 投票时长（秒），这里是24小时
);
```

## 测试部署

部署成功后，建议按以下流程测试：

1. ✅ 创建测试提案
2. ✅ 授予测试地址投票权
3. ✅ 使用前端进行加密投票
4. ✅ 等待投票截止
5. ✅ 请求解密结果
6. ✅ 查看解密后的投票统计

## 常见问题

### Q: 部署时提示 insufficient funds
A: 确保钱包有足够的 Sepolia ETH（至少 0.1）

### Q: 前端无法连接钱包
A: 检查 `.env` 中的 `VITE_WALLET_CONNECT_ID` 是否正确配置

### Q: MetaMask 提示链ID不匹配
A: 确保 MetaMask 已添加 Sepolia 网络（Chain ID: 11155111）

### Q: 合约调用失败
A:
1. 确认用户已被授予 VOTER_ROLE
2. 确认提案处于 Active 状态
3. 检查投票截止时间是否已过

## 网络信息

**Sepolia 测试网配置**：
- Network Name: Sepolia
- RPC URL: https://ethereum-sepolia-rpc.publicnode.com
- Chain ID: 11155111
- Currency Symbol: ETH
- Block Explorer: https://sepolia.etherscan.io/

## 下一步

部署完成后，你可以：

1. 📱 在前端测试完整的投票流程
2. 🔍 在 Sepolia Etherscan 查看交易记录
3. 🎨 调整 UI 样式和用户体验
4. 🧪 编写自动化测试脚本
5. 📊 添加数据统计和分析功能
