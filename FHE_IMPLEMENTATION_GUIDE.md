# ProposalBox FHE完整实施指南

## 📋 概述

本指南将帮助你完成ProposalBox项目从简化版到完整FHE加密版本的升级。

---

## ✅ 已完成

- ✅ 安装FHE依赖 (`@fhevm/solidity`, `@fhevm/core-contracts`)
- ✅ 编写FHE加密合约 (`ProposalBoxGovernorFHE.sol`)
- ✅ 简化版前后端联通测试
- ✅ 基础E2E测试通过（4/4）

---

## 🚀 下一步实施步骤

### 1. 配置Sepolia测试网环境

#### 1.1 获取测试资源

```bash
# 1. 获取Sepolia测试ETH
# 访问: https://sepoliafaucet.com/
# 或: https://www.alchemy.com/faucets/ethereum-sepolia

# 2. 获取WalletConnect Project ID
# 访问: https://cloud.walletconnect.com/
# 创建新项目并复制Project ID
```

#### 1.2 配置环境变量

编辑 `.env` 文件:

```env
# Sepolia RPC URL (可使用Alchemy或Infura)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# 部署私钥（仅用于测试！）
PRIVATE_KEY=your_private_key_here

# WalletConnect Project ID
VITE_WALLET_CONNECT_ID=your_project_id_here

# 合约地址（部署后填写）
VITE_CONTRACT_ADDRESS=
```

### 2. 部署FHE合约到Sepolia

#### 2.1 编译FHE合约

```bash
npm run compile
```

#### 2.2 创建部署脚本

创建 `scripts/deploy-fhe.cjs`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("部署 ProposalBoxGovernorFHE 到 Sepolia...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);

  const ProposalBoxFHE = await hre.ethers.getContractFactory("ProposalBoxGovernorFHE");
  const proposalBox = await ProposalBoxFHE.deploy();

  await proposalBox.waitForDeployment();

  const address = await proposalBox.getAddress();
  console.log("ProposalBoxGovernorFHE 部署到:", address);

  console.log("请更新 .env 中的 VITE_CONTRACT_ADDRESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### 2.3 部署到Sepolia

```bash
npm run compile
npx hardhat run scripts/deploy-fhe.cjs --network sepolia
```

### 3. 更新前端使用FHE SDK

#### 3.1 更新 `src/lib/fhe.ts`

```typescript
let fheInstance: any = null;

export async function initializeFHE() {
  if (fheInstance) return fheInstance;

  try {
    const sdk = await import('https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js');
    const { initSDK, createInstance, SepoliaConfig } = sdk;

    await initSDK();
    fheInstance = await createInstance(SepoliaConfig);

    console.log('[FHE] Instance initialized successfully');
    return fheInstance;
  } catch (error) {
    console.error('[FHE] Initialization failed:', error);
    throw error;
  }
}

export function getFHEInstance() {
  return fheInstance;
}
```

#### 3.2 更新 `src/hooks/useBatchVote.ts`

恢复FHE加密逻辑:

```typescript
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getAddress } from 'ethers';
import { useFHE } from './useFHE';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';

export function useBatchVote() {
  const { address } = useAccount();
  const { fhe, initialize } = useFHE();
  const { writeContractAsync } = useWriteContract();

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const submitBatchVote = async (proposalIds: number[], choices: number[]) => {
    if (!address || proposalIds.length !== choices.length) throw new Error('参数错误');

    if (!fhe) await initialize();

    setIsEncrypting(true);

    try {
      const input = fhe.createEncryptedInput(
        getAddress(CONTRACT_ADDRESS) as `0x${string}`,
        address
      );

      choices.forEach(choice => input.add32(choice));

      const { handles, inputProof } = await input.encrypt();

      setIsEncrypting(false);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'batchVote',
        args: [proposalIds.map(id => BigInt(id)), handles, inputProof],
      });

      setTxHash(hash);

      return hash;
    } catch (error) {
      setIsEncrypting(false);
      throw error;
    }
  };

  return {
    submitBatchVote,
    isEncrypting,
    isConfirming,
    txHash,
  };
}
```

#### 3.3 更新 `src/lib/wagmi.ts`

切换到Sepolia网络:

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ProposalBox',
  projectId: import.meta.env.VITE_WALLET_CONNECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia],
});
```

### 4. 添加提案列表页面

#### 4.1 创建 `src/pages/ProposalsList.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { Link } from 'react-router-dom';

export default function ProposalsList() {
  const { data: proposals, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getProposalsBatch',
    args: [BigInt(1), BigInt(50)],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Proposals</h1>

        {isLoading && <p>Loading proposals...</p>}

        <div className="grid gap-4">
          {proposals && proposals[0].map((id: bigint, index: number) => (
            <Link key={id.toString()} to={`/proposal/${id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {proposals[1][index]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Deadline: {new Date(Number(proposals[2][index]) * 1000).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={
                    proposals[3][index] === 0 ? 'default' :
                    proposals[3][index] === 1 ? 'secondary' : 'outline'
                  }>
                    {proposals[3][index] === 0 ? 'Active' :
                     proposals[3][index] === 1 ? 'Ended' : 'Executed'}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
```

### 5. 添加投票结果可视化

#### 5.1 创建 `src/components/voting/ResultsChart.tsx`

```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ResultsChartProps {
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
}

const COLORS = ['#10b981', '#ef4444', '#6b7280'];

export function ResultsChart({ votesFor, votesAgainst, votesAbstain }: ResultsChartProps) {
  const data = [
    { name: 'For', value: votesFor },
    { name: 'Against', value: votesAgainst },
    { name: 'Abstain', value: votesAbstain },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### 6. 添加完整投票流程E2E测试

#### 6.1 创建 `e2e/voting-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Voting Flow', () => {

  test('should complete full voting process', async ({ page, context }) => {
    // 注意：需要安装MetaMask测试扩展
    // 这里是基础框架，完整实现需要MetaMask钱包插件

    // 1. 访问提案列表
    await page.goto('/proposals');
    await expect(page.getByText(/All Proposals/i)).toBeVisible();

    // 2. 选择第一个提案
    await page.locator('.proposal-card').first().click();

    // 3. 连接钱包（需要MetaMask配置）
    // TODO: 添加MetaMask自动化

    // 4. 投票
    await page.getByRole('button', { name: /Vote/i }).click();
    await page.getByRole('button', { name: /For/i }).click();

    // 5. 确认交易
    // TODO: 添加MetaMask确认自动化

    // 6. 验证投票成功
    await expect(page.getByText(/Vote submitted/i)).toBeVisible({ timeout: 30000 });
  });
});
```

### 7. 最终部署检查清单

- [ ] Sepolia测试ETH充足
- [ ] WalletConnect Project ID已配置
- [ ] 私钥已安全保存
- [ ] FHE合约已部署到Sepolia
- [ ] 合约地址已更新到.env
- [ ] 前端已切换到Sepolia网络
- [ ] FHE SDK已正确初始化
- [ ] 测试提案已创建
- [ ] 投票流程已测试
- [ ] UI优化完成

---

## 🔍 测试步骤

### 本地测试

```bash
# 1. 启动前端
npm run dev

# 2. 运行E2E测试
npm run test:e2e
```

### Sepolia测试网测试

```bash
# 1. 部署合约
npx hardhat run scripts/deploy-fhe.cjs --network sepolia

# 2. 创建测试提案
npx hardhat run scripts/create-test-proposals.cjs --network sepolia

# 3. 访问前端测试
# 打开浏览器访问 http://localhost:8082
# 连接MetaMask（Sepolia网络）
# 测试完整投票流程
```

---

## 📚 参考资源

- **Zama FHE文档**: https://docs.zama.ai/fhevm
- **Relayer SDK文档**: https://docs.zama.ai/fhevm/fhevm-clients/relayer-sdk
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **WalletConnect**: https://cloud.walletconnect.com/
- **Hardhat文档**: https://hardhat.org/docs

---

## ⚠️ 重要提示

1. **私钥安全**: 永远不要将私钥提交到Git仓库
2. **测试网**: 先在Sepolia测试网充分测试后再考虑主网
3. **Gas费用**: FHE操作需要更多Gas，确保账户有足够ETH
4. **解密延迟**: FHE结果解密需要等待Gateway处理，可能需要几分钟

---

## 🎯 当前进度

- [x] FHE合约编写
- [x] 基础测试通过
- [ ] 部署到Sepolia
- [ ] FHE功能测试
- [ ] UI优化
- [ ] 完整E2E测试

继续加油！🚀
