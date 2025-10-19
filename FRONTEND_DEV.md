# ProposalBox - 前端开发文档

## 项目概述

ProposalBox是基于FHE的隐私投票系统，支持批量投票功能。用户可以一次性对多个提案投票，所有投票选择都在客户端加密，链上统计加密状态的投票结果。

## 技术栈

### 核心版本要求

```json
{
  "dependencies": {
    "@zama-fhe/relayer-sdk": "0.2.0",
    "next": "14.2.0",
    "react": "18.3.0",
    "ethers": "^6.13.0",
    "wagmi": "^2.12.0",
    "viem": "^2.21.0",
    "@rainbow-me/rainbowkit": "^2.1.0"
  }
}
```

### 框架与库

- **Next.js 14**: App Router、Server Components
- **React 18**: Hooks、Suspense
- **TypeScript 5**: 严格类型
- **Tailwind CSS 3**: 样式系统
- **Wagmi v2**: Web3 React Hooks
- **RainbowKit 2**: 钱包连接
- **Viem 2**: Ethereum库
- **@zama-fhe/relayer-sdk 0.2.0**: FHE加密SDK

## 核心配置

### 1. SDK初始化

**文件**: `lib/fhe.ts`

```typescript
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

let fheInstance = null;
let initPromise = null;

export async function initializeFHE() {
  if (fheInstance) return fheInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await initSDK();
    fheInstance = await createInstance(SepoliaConfig);
    return fheInstance;
  })();

  return initPromise;
}
```

**关键点**：
- ✅ 使用`/bundle`导入路径（必需）
- ✅ 先调用`initSDK()`初始化WASM
- ✅ 使用`SepoliaConfig`自动获取公钥
- ✅ 单例模式避免重复初始化

### 2. Wagmi配置

**文件**: `lib/wagmi.ts`

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ProposalBox',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!,
  chains: [sepolia],
  ssr: true,
});
```

### 3. 合约配置

**文件**: `lib/contract.ts`

```typescript
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const ABI = [
  {
    "name": "createProposal",
    "type": "function",
    "inputs": [
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "duration", "type": "uint256"}
    ],
    "outputs": [{"name": "proposalId", "type": "uint256"}]
  },
  {
    "name": "batchVote",
    "type": "function",
    "inputs": [
      {"name": "proposalIds", "type": "uint256[]"},
      {"name": "encryptedChoices", "type": "externalEuint32[]"},
      {"name": "inputProof", "type": "bytes"}
    ]
  },
  {
    "name": "getProposal",
    "type": "function",
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "outputs": [{
      "type": "tuple",
      "components": [
        {"name": "title", "type": "string"},
        {"name": "description", "type": "string"},
        {"name": "endTime", "type": "uint256"},
        {"name": "isActive", "type": "bool"}
      ]
    }]
  },
  {
    "name": "hasVoted",
    "type": "function",
    "inputs": [
      {"name": "proposalId", "type": "uint256"},
      {"name": "voter", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "bool"}]
  }
] as const;
```

## Hooks实现

### useFHE Hook

**文件**: `hooks/useFHE.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { initializeFHE } from '@/lib/fhe';

export function useFHE() {
  const [fhe, setFhe] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const initialize = async () => {
    if (fhe || isInitializing) return;

    setIsInitializing(true);
    try {
      const instance = await initializeFHE();
      setFhe(instance);
    } catch (error) {
      console.error('FHE初始化失败:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  return { fhe, initialize, isInitializing };
}
```

### useBatchVote Hook

**文件**: `hooks/useBatchVote.ts`

```typescript
'use client';

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

  const submitBatchVote = async (
    proposalIds: number[],
    choices: number[]
  ) => {
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
        args: [proposalIds, handles, inputProof],
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

### useProposals Hook

**文件**: `hooks/useProposals.ts`

```typescript
'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';

export function useProposal(proposalId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getProposal',
    args: [BigInt(proposalId)],
  });
}

export function useHasVoted(proposalId: number, voter?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'hasVoted',
    args: voter ? [BigInt(proposalId), voter] : undefined,
    query: { enabled: !!voter },
  });
}
```

## 核心组件

### BatchVoteModal组件

**文件**: `components/BatchVoteModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useBatchVote } from '@/hooks/useBatchVote';
import { X, Vote, Loader2 } from 'lucide-react';

interface Proposal {
  id: number;
  title: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  proposals: Proposal[];
}

const CHOICES = [
  { value: 1, label: '赞成', color: 'bg-green-500' },
  { value: 0, label: '反对', color: 'bg-red-500' },
  { value: 2, label: '弃权', color: 'bg-gray-500' },
];

export default function BatchVoteModal({ isOpen, onClose, proposals }: Props) {
  const [choices, setChoices] = useState<Record<number, number>>({});
  const { submitBatchVote, isEncrypting, isConfirming } = useBatchVote();

  const handleSubmit = async () => {
    const proposalIds = proposals.map(p => p.id);
    const voteChoices = proposals.map(p => choices[p.id] ?? 2);

    try {
      await submitBatchVote(proposalIds, voteChoices);
      onClose();
    } catch (error) {
      console.error('投票失败:', error);
    }
  };

  const isLoading = isEncrypting || isConfirming;
  const selectedCount = Object.keys(choices).length;

  return (
    <Dialog open={isOpen} onClose={isLoading ? () => {} : onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <Vote className="w-6 h-6 text-purple-600" />
              <Dialog.Title className="text-xl font-bold">
                批量投票 ({proposals.length}个提案)
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {proposals.map(proposal => (
              <div key={proposal.id} className="mb-6 last:mb-0">
                <h3 className="font-semibold mb-2">{proposal.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{proposal.description}</p>

                <div className="flex gap-2">
                  {CHOICES.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setChoices(prev => ({ ...prev, [proposal.id]: value }))}
                      disabled={isLoading}
                      className={`
                        flex-1 py-2 px-4 rounded-lg font-medium transition
                        ${choices[proposal.id] === value
                          ? `${color} text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                        disabled:opacity-50
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              已选择 {selectedCount}/{proposals.length} 个提案
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isEncrypting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEncrypting ? '加密中...' : isConfirming ? '确认中...' : '提交投票'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
```

### ProposalCard组件

**文件**: `components/ProposalCard.tsx`

```typescript
'use client';

import { Clock, CheckCircle2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useProposal, useHasVoted } from '@/hooks/useProposals';

interface Props {
  proposalId: number;
  onVote?: (id: number) => void;
}

export default function ProposalCard({ proposalId, onVote }: Props) {
  const { address } = useAccount();
  const { data: proposal } = useProposal(proposalId);
  const { data: hasVoted } = useHasVoted(proposalId, address);

  if (!proposal) return null;

  const [title, description, endTime, isActive] = proposal;
  const timeRemaining = Number(endTime) * 1000 - Date.now();
  const daysLeft = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {hasVoted && (
          <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
            已投票
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className={isActive ? 'text-gray-600' : 'text-red-600'}>
            {isActive ? `剩余 ${daysLeft} 天` : '已结束'}
          </span>
        </div>

        {isActive && !hasVoted && onVote && (
          <button
            onClick={() => onVote(proposalId)}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
          >
            投票
          </button>
        )}
      </div>
    </div>
  );
}
```

### ProposalList组件

**文件**: `components/ProposalList.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import ProposalCard from './ProposalCard';
import BatchVoteModal from './BatchVoteModal';
import { Vote } from 'lucide-react';

// 实际项目中从合约读取
const MOCK_PROPOSALS = [
  { id: 1, title: '提案1', description: '描述1' },
  { id: 2, title: '提案2', description: '描述2' },
  { id: 3, title: '提案3', description: '描述3' },
];

export default function ProposalList() {
  const { isConnected } = useAccount();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchVote = () => {
    if (selectedIds.length === 0) return;
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">活跃提案</h2>

        {isConnected && selectedIds.length > 0 && (
          <button
            onClick={handleBatchVote}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Vote className="w-4 h-4" />
            批量投票 ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_PROPOSALS.map(p => (
          <div key={p.id} className="relative">
            {isConnected && (
              <input
                type="checkbox"
                checked={selectedIds.includes(p.id)}
                onChange={() => toggleSelect(p.id)}
                className="absolute top-4 right-4 w-5 h-5 z-10"
              />
            )}
            <ProposalCard proposalId={p.id} />
          </div>
        ))}
      </div>

      <BatchVoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        proposals={MOCK_PROPOSALS.filter(p => selectedIds.includes(p.id))}
      />
    </div>
  );
}
```

## Landing Page

### Hero Section

**文件**: `components/landing/Hero.tsx`

```typescript
import Link from 'next/link';
import { Vote, Shield } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Shield className="w-12 h-12 text-purple-300" />
          <Vote className="w-12 h-12 text-purple-300" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          ProposalBox
        </h1>

        <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-3xl mx-auto">
          基于FHE的隐私投票系统，支持批量投票，保护投票隐私
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/app"
            className="px-8 py-4 bg-white text-purple-900 font-semibold rounded-lg hover:bg-purple-50 transition"
          >
            启动应用 →
          </Link>
          <a
            href="#features"
            className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
          >
            了解更多
          </a>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 text-purple-200 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            完全加密
          </div>
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            批量投票
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center">🔐</span>
            隐私保护
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Features Section

**文件**: `components/landing/Features.tsx`

```typescript
import { Shield, Zap, Users, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: '完全隐私',
    description: '使用FHE技术，所有投票选择在客户端加密，链上仅存储密文',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: Zap,
    title: '批量投票',
    description: '一次交易完成多个提案投票，节省Gas费用约36%',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Users,
    title: '社区治理',
    description: '去中心化的提案创建和投票机制，透明且公平',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: BarChart3,
    title: '实时统计',
    description: '链上实时统计加密投票结果，投票结束后可解密查看',
    gradient: 'from-cyan-500 to-cyan-600',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">核心功能</h2>
          <p className="text-xl text-gray-600">隐私投票的完整解决方案</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, description, gradient }) => (
            <div key={title} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} text-white mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### HowItWorks Section

**文件**: `components/landing/HowItWorks.tsx`

```typescript
import { Wallet, FileText, Lock, BarChart } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: '连接钱包',
    description: '使用RainbowKit连接以太坊钱包',
    icon: Wallet,
  },
  {
    number: '02',
    title: '浏览提案',
    description: '查看社区创建的活跃提案',
    icon: FileText,
  },
  {
    number: '03',
    title: '批量投票',
    description: '选择多个提案，客户端加密投票选择后提交',
    icon: Lock,
  },
  {
    number: '04',
    title: '查看结果',
    description: '投票结束后解密查看统计结果',
    icon: BarChart,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">使用流程</h2>

        <div className="max-w-4xl mx-auto">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <div key={number} className="flex items-start gap-6 mb-12 last:mb-0">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {number}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-2xl font-bold">{title}</h3>
                </div>
                <p className="text-lg text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## 页面实现

### Landing Page

**文件**: `app/page.tsx`

```typescript
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';

export const metadata = {
  title: 'ProposalBox - 隐私投票系统',
  description: '基于FHE的去中心化隐私投票平台，支持批量投票',
};

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
    </main>
  );
}
```

### App Page

**文件**: `app/app/page.tsx`

```typescript
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import ProposalList from '@/components/ProposalList';

export default function AppPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-900">ProposalBox</h1>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ProposalList />
      </main>
    </div>
  );
}
```

## 环境变量

**文件**: `.env.local`

```bash
NEXT_PUBLIC_WALLET_CONNECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

## 性能优化

### 延迟初始化

```typescript
// ❌ 错误 - 页面加载时自动初始化
useEffect(() => {
  initializeFHE();
}, []);

// ✅ 正确 - 用户点击投票时才初始化
const handleVote = async () => {
  if (!fhe) await initialize();
  // 开始加密
};
```

### 批量加密优势

- **Gas节省**: 约36%（vs单独投票）
- **单proof验证**: 所有参数共享一个proof
- **最大批量**: 建议≤50个提案

## 错误处理

### 常见错误

```typescript
// 错误1: SDK导入路径错误
// ❌ import { createInstance } from '@zama-fhe/relayer-sdk';
// ✅ import { createInstance } from '@zama-fhe/relayer-sdk/bundle';

// 错误2: 忘记先初始化WASM
// ❌ const fhe = await createInstance(SepoliaConfig);
// ✅ await initSDK(); const fhe = await createInstance(SepoliaConfig);

// 错误3: 地址格式错误
// ❌ fhe.createEncryptedInput(contractAddr, userAddr);
// ✅ fhe.createEncryptedInput(getAddress(contractAddr) as `0x${string}`, userAddr);

// 错误4: handles顺序错误
// ❌ await contract.batchVote(ids, [handles[1], handles[0]], proof);
// ✅ await contract.batchVote(ids, handles, proof);
```

## 构建与部署

```bash
# 安装依赖
npm install

# 开发
npm run dev

# 构建
npm run build

# 生产运行
npm start
```

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

**版本**: 1.0.0
**最后更新**: 2025-01-16
**基于**: @zama-fhe/relayer-sdk 0.2.0
