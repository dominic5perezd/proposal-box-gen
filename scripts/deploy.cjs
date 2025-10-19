const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("开始部署 ProposalBoxGovernor...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  // 部署合约
  const ProposalBox = await hre.ethers.getContractFactory("ProposalBoxGovernor");
  const proposalBox = await ProposalBox.deploy();

  await proposalBox.waitForDeployment();

  const address = await proposalBox.getAddress();
  console.log("ProposalBoxGovernor 部署到:", address);

  // 验证部署
  console.log("验证部署...");
  const proposalCount = await proposalBox.proposalCount();
  console.log("当前提案数:", proposalCount.toString());

  // 保存部署信息
  const deploymentInfo = {
    contractAddress: address,
    deployer: deployer.address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  console.log("\n部署信息:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // 保存到文件
  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n部署信息已保存到 deployment.json");

  // 保存ABI到前端目录
  const artifactPath = path.join(__dirname, "../artifacts/contracts/ProposalBoxGovernor.sol/ProposalBoxGovernor.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abiPath = path.join(__dirname, "../src/lib/ProposalBoxGovernor.abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log("ABI已保存到 src/lib/ProposalBoxGovernor.abi.json");

  console.log("\n✅ 部署完成!");
  console.log("\n下一步:");
  console.log("1. 更新前端 .env 文件中的合约地址:", address);
  console.log("2. 启动前端: npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
