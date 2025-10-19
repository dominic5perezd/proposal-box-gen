# ProposalBox 部署指南

本文档将指导你如何将 ProposalBox 项目部署到 GitHub 和 Vercel。

## 📋 前置准备

### 1. GitHub 准备
- GitHub 账号
- 创建一个新仓库：https://github.com/dominic5perezd/proposal-box-gen
- 获取 GitHub Personal Access Token (PAT)
  - 访问：https://github.com/settings/tokens
  - 点击 "Generate new token (classic)"
  - 勾选 `repo` 权限
  - 生成并保存 token

### 2. Vercel 准备
- Vercel 账号：https://vercel.com
- 获取 Vercel Token
  - 访问：https://vercel.com/account/tokens
  - 创建新 token
  - 保存 token

## 🔧 配置步骤

### Step 1: 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
# Frontend configuration
VITE_CONTRACT_ADDRESS=0xeB8B93304C3CEa366D0783B8378BD1F8efbd36b3

# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=your_sepolia_rpc_url_here

# Etherscan API Key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Vercel deployment token
VERCEL_TOKEN=your_vercel_token_here

# GitHub Personal Access Token
GITHUB_PAT=your_github_pat_here
GITHUB_USERNAME=dominic5perezd
GITHUB_EMAIL=your_email@example.com

# Gas reporting
REPORT_GAS=false
```

### Step 2: 推送到 GitHub

#### 方法 1：使用自动化脚本

```bash
npm run upload:github
```

#### 方法 2：手动推送

```bash
# 初始化 git（如果还没有）
git init
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/dominic5perezd/proposal-box-gen.git

# 添加文件并提交
git add .
git commit -m "Initial commit: ProposalBox - Privacy-preserving governance with FHE"

# 推送到 GitHub
git push -u origin main
```

### Step 3: 部署到 Vercel

#### 方法 1：使用自动化脚本

```bash
npm run deploy:vercel
```

#### 方法 2：通过 Vercel CLI

```bash
# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

#### 方法 3：通过 Vercel 网站

1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库：`dominic5perezd/proposal-box-gen`
3. 配置环境变量：
   - `VITE_CONTRACT_ADDRESS`: `0xeB8B93304C3CEa366D0783B8378BD1F8efbd36b3`
4. 点击 "Deploy"

## 🎉 完成！

部署完成后，你会得到：
- **GitHub 仓库**: https://github.com/dominic5perezd/proposal-box-gen
- **Vercel 部署**: https://your-project.vercel.app

## 📝 注意事项

1. **不要提交 .env 文件**：`.env` 文件包含敏感信息，已被 `.gitignore` 忽略
2. **合约地址**: 当前使用的合约地址是 `0xeB8B93304C3CEa366D0783B8378BD1F8efbd36b3` (Sepolia 测试网)
3. **环境变量**: 在 Vercel 部署时，需要在 Vercel 网站上配置 `VITE_CONTRACT_ADDRESS` 环境变量

## 🔍 验证部署

部署完成后，访问你的 Vercel 网址，检查：
- ✅ 页面正常加载
- ✅ 可以连接钱包
- ✅ 可以查看提案
- ✅ 可以进行投票（需要 Sepolia 测试网 ETH）

## 🆘 常见问题

### Q: GitHub 推送失败，提示包含 secrets
**A**: 确保 `.env` 文件已被 `.gitignore` 忽略，删除 `.env` 文件再重新提交。

### Q: Vercel 部署失败
**A**: 检查：
1. 环境变量是否正确配置
2. 构建命令是否正确：`npm run build`
3. 输出目录是否正确：`dist`

### Q: 网站访问正常但无法投票
**A**: 检查：
1. MetaMask 是否连接到 Sepolia 测试网
2. 钱包地址是否有 Sepolia ETH（用于 gas）
3. 合约地址是否正确

## 📚 相关链接

- [GitHub 仓库](https://github.com/dominic5perezd/proposal-box-gen)
- [Vercel 文档](https://vercel.com/docs)
- [Zama FHEVM 文档](https://docs.zama.ai/fhevm)
- [Sepolia 测试网水龙头](https://sepoliafaucet.com/)
