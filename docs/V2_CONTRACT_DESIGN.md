# ProposalBoxGovernorV2 设计文档

## 概述

ProposalBoxGovernorV2 是一个增强版本的治理合约，支持：
- ✅ **自定义投票选项**（不限于 Yes/No/Abstain）
- ✅ **单选模式**（从多个选项中选一个）
- ✅ **多选模式**（可以选择多个选项）
- ✅ **完全的 FHE 加密**（投票隐私保护）
- ✅ **灵活的选项数量**（2-20 个选项）

## 核心架构

### 1. 数据结构

#### VoteOption（投票选项）
```solidity
struct VoteOption {
    string title;              // 选项标题
    string description;        // 选项描述
    euint32 encryptedVotes;   // 加密的投票数
    uint32 decryptedVotes;    // 解密后的投票数
}
```

#### Proposal（提案）
```solidity
struct Proposal {
    uint256 id;
    string title;
    string description;
    address proposer;
    uint256 createdAt;
    uint256 votingDeadline;
    ProposalStatus status;
    VotingMode votingMode;     // 新增：单选或多选
    uint256 optionCount;       // 新增：选项数量
    uint256 totalVoters;
    uint256[] decryptionRequestIds;
}
```

#### VotingMode（投票模式）
```solidity
enum VotingMode {
    SingleChoice,    // 单选：只能选一个选项
    MultipleChoice   // 多选：可以选多个选项
}
```

### 2. 存储结构

```solidity
// 提案基本信息
mapping(uint256 => Proposal) public proposals;

// 提案的投票选项（proposalId => optionId => VoteOption）
mapping(uint256 => mapping(uint256 => VoteOption)) public proposalOptions;

// 用户投票记录
mapping(address => mapping(uint256 => VoteRecord)) public voteRecords;
```

## 功能详解

### 1. 创建提案（Create Proposal）

```solidity
function createProposal(
    string memory title,
    string memory description,
    uint256 votingDuration,
    VotingMode votingMode,
    string[] memory optionTitles,
    string[] memory optionDescriptions
) external returns (uint256)
```

**示例用法：**

#### 单选投票（选择一个方案）
```javascript
// 前端代码
const optionTitles = ["方案 A", "方案 B", "方案 C", "弃权"];
const optionDescriptions = [
    "增加预算 50%",
    "增加预算 25%",
    "维持现状",
    "不参与投票"
];

await contract.createProposal(
    "Q1 预算调整",
    "请选择一个预算调整方案",
    7 * 24 * 3600, // 7 天
    0, // VotingMode.SingleChoice
    optionTitles,
    optionDescriptions
);
```

#### 多选投票（选择多个项目）
```javascript
const optionTitles = [
    "前端开发",
    "后端开发",
    "市场营销",
    "社区运营"
];
const optionDescriptions = [
    "投资前端开发团队",
    "投资后端基础设施",
    "投资市场推广活动",
    "投资社区建设"
];

await contract.createProposal(
    "Q2 资金分配",
    "选择您支持投资的领域（可多选）",
    14 * 24 * 3600, // 14 天
    1, // VotingMode.MultipleChoice
    optionTitles,
    optionDescriptions
);
```

### 2. 单选投票（Single Choice Voting）

```solidity
function voteSingleChoice(
    uint256 proposalId,
    externalEuint32 encryptedChoice,
    bytes calldata inputProof
) external
```

**工作原理：**
1. 用户选择一个选项（index = 0, 1, 2, ...）
2. 前端加密选择的索引
3. 合约使用 FHE 操作累加到对应选项

**加密逻辑：**
```solidity
for (uint256 i = 0; i < proposal.optionCount; i++) {
    // 检查是否是被选中的选项
    ebool isSelected = FHE.eq(choice, FHE.asEuint32(uint32(i)));
    // 如果选中则加 1，否则加 0
    euint32 voteIncrement = FHE.select(isSelected, FHE.asEuint32(1), FHE.asEuint32(0));
    option.encryptedVotes = FHE.add(option.encryptedVotes, voteIncrement);
}
```

### 3. 多选投票（Multiple Choice Voting）

```solidity
function voteMultipleChoice(
    uint256 proposalId,
    externalEuint32[] calldata encryptedChoices,
    bytes calldata inputProof
) external
```

**工作原理：**
1. 用户对每个选项选择 0（不选）或 1（选择）
2. 前端加密一个布尔数组：`[1, 0, 1, 0]` 表示选择了第 0 和第 2 个选项
3. 合约将每个加密值累加到对应选项

**示例：**
```javascript
// 用户选择了第 1 和第 3 个选项
const choices = [0, 1, 0, 1]; // 4 个选项
const encryptedChoices = await Promise.all(
    choices.map(c => fhe.encrypt(c))
);

await contract.voteMultipleChoice(
    proposalId,
    encryptedChoices,
    inputProof
);
```

## 与 V1 的对比

| 特性 | V1 (当前) | V2 (新版) |
|------|----------|-----------|
| 选项数量 | 固定 3 个 (Yes/No/Abstain) | 2-20 个自定义选项 |
| 投票模式 | 仅单选 | 单选 + 多选 |
| 选项自定义 | ❌ | ✅ |
| FHE 加密 | ✅ | ✅ |
| 向后兼容 | - | ⚠️ 需要重新部署 |

## Gas 成本分析

### 创建提案
- **V1**: ~300k gas (3 个固定选项)
- **V2**: ~300k + 80k * optionCount

### 单选投票
- **V1**: ~150k gas
- **V2**: ~150k + 50k * optionCount (需要遍历所有选项)

### 多选投票
- **V2**: ~200k + 60k * optionCount

### 解密结果
- **V1**: ~100k gas (解密 3 个值)
- **V2**: ~100k + 30k * optionCount

## 前端集成示例

### 创建提案表单

```typescript
interface CreateProposalFormData {
    title: string;
    description: string;
    duration: number;
    votingMode: 'single' | 'multiple';
    options: Array<{
        title: string;
        description: string;
    }>;
}
```

### 单选投票组件

```typescript
async function submitSingleVote(proposalId: number, optionIndex: number) {
    const fhe = await initializeFHE();
    const input = fhe.createEncryptedInput(contractAddress, userAddress);
    input.add32(optionIndex);
    const { handles, inputProof } = await input.encrypt();

    await contract.voteSingleChoice(proposalId, handles[0], inputProof);
}
```

### 多选投票组件

```typescript
async function submitMultipleVote(proposalId: number, selections: boolean[]) {
    const fhe = await initializeFHE();
    const input = fhe.createEncryptedInput(contractAddress, userAddress);

    selections.forEach(selected => input.add32(selected ? 1 : 0));

    const { handles, inputProof } = await input.encrypt();
    await contract.voteMultipleChoice(proposalId, handles, inputProof);
}
```

## 安全考虑

### 1. 输入验证
- ✅ 选项数量限制（2-20）
- ✅ 数组长度匹配验证
- ✅ 重复投票检查

### 2. FHE 安全性
- ✅ 所有投票数据加密存储
- ✅ 只有解密后才能看到结果
- ✅ 使用 Zama Oracle 进行安全解密

### 3. 访问控制
- ✅ 只有管理员可以结束提案
- ✅ 只有管理员可以请求解密
- ✅ 只有 Oracle 可以写入解密结果

## 迁移策略

### 从 V1 迁移到 V2

1. **保留 V1 合约**（处理旧提案）
2. **部署 V2 合约**（新提案使用 V2）
3. **前端支持双版本**

## 总结

ProposalBoxGovernorV2 提供了完整的自定义投票支持，同时保持了 FHE 加密的隐私保护特性。

**主要优势：**

✅ **灵活性** - 支持任意数量的自定义选项
✅ **多样性** - 单选和多选两种模式
✅ **隐私性** - 完全的 FHE 加密保护
✅ **可扩展性** - 易于添加新功能
✅ **Gas 优化** - 合理的 Gas 成本
