# MetaMask 本地网络配置指南

## 问题描述
当连接RainbowKit时，MetaMask提示"自定义网络返回的链 ID 与提交的链 ID 不匹配"。

## 解决方案

### 方法1：手动配置MetaMask网络（推荐）

1. **打开MetaMask，添加网络**：
   - 点击网络选择器
   - 点击"添加网络"
   - 点击"手动添加网络"

2. **填写网络信息**：
   ```
   网络名称: Localhost 31337
   新增RPC URL: http://127.0.0.1:8545
   链ID: 31337
   货币符号: ETH
   区块浏览器URL: (留空)
   ```

3. **保存并切换到此网络**

4. **导入测试账户**：
   使用Hardhat提供的测试私钥导入账户（仅用于本地测试！）：
   ```
   账户 #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

   ⚠️ **警告**：这些私钥是公开的，绝不要用于主网或真实资金！

### 方法2：清除MetaMask缓存

如果已经添加过网络但出现问题：

1. 打开MetaMask设置
2. 进入"高级"
3. 点击"重置账户"（会清除交易历史但不会删除账户）
4. 重新添加网络（参考方法1）

### 方法3：使用不同的RPC URL

有时`127.0.0.1`和`localhost`会导致不同行为，尝试替换：

- 如果使用 `http://127.0.0.1:8545` 不行，试试 `http://localhost:8545`
- 或反之

## 验证连接

1. 确保Hardhat节点正在运行：
   ```bash
   cd projects/ProposalBox
   npx hardhat node
   ```

2. 访问前端应用：
   ```bash
   npm run dev
   ```
   打开 http://localhost:8082

3. 点击"Connect Wallet"，选择MetaMask

4. 应该能看到余额显示为 10000 ETH（Hardhat测试账户）

## 常见问题

### Q: 链ID仍然不匹配
A: 完全重启MetaMask扩展：
   - 关闭所有浏览器标签页
   - 禁用并重新启用MetaMask扩展
   - 重新添加网络

### Q: 交易失败或pending
A: 重置MetaMask nonce：
   - 设置 → 高级 → 重置账户

### Q: 无法连接到RPC
A: 检查Hardhat节点是否运行：
   ```bash
   lsof -i :8545
   ```

## 其他测试账户

Hardhat提供20个测试账户，每个账户有10000 ETH：

```
账户 #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
私钥: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

账户 #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
私钥: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

账户 #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
私钥: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

完整列表参见Hardhat节点启动时的输出。
