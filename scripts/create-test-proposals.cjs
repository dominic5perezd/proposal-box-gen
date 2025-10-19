const hre = require("hardhat");

async function main() {
  console.log("创建测试提案...");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [deployer, voter1, voter2, voter3] = await hre.ethers.getSigners();

  const ProposalBox = await hre.ethers.getContractAt("ProposalBoxGovernor", contractAddress);

  console.log("使用账户:", deployer.address);

  // 创建3个测试提案
  const proposals = [
    {
      title: "Proposal 1: Increase Block Gas Limit",
      description: "Should we increase the block gas limit to 30M?",
      duration: 7 * 24 * 60 * 60 // 7 days
    },
    {
      title: "Proposal 2: Add New Token Pair",
      description: "Should we add ETH/USDC trading pair?",
      duration: 7 * 24 * 60 * 60
    },
    {
      title: "Proposal 3: Community Grant Program",
      description: "Should we allocate 100K for community grants?",
      duration: 7 * 24 * 60 * 60
    }
  ];

  for (const proposal of proposals) {
    const tx = await ProposalBox.createProposal(
      proposal.title,
      proposal.description,
      proposal.duration
    );
    const receipt = await tx.wait();
    console.log(`✅ 创建提案: ${proposal.title}`);
  }

  // 授予投票权限给测试账户
  console.log("\n授予投票权限...");
  const tx = await ProposalBox.grantVoterRole([
    deployer.address,
    voter1.address,
    voter2.address,
    voter3.address
  ]);
  await tx.wait();
  console.log("✅ 已授予投票权限给 4 个测试账户");

  // 显示提案列表
  const proposalCount = await ProposalBox.proposalCount();
  console.log(`\n当前提案总数: ${proposalCount}`);

  console.log("\n测试账户地址:");
  console.log("Account #0 (Admin+Voter):", deployer.address);
  console.log("Account #1 (Voter):", voter1.address);
  console.log("Account #2 (Voter):", voter2.address);
  console.log("Account #3 (Voter):", voter3.address);

  console.log("\n✅ 测试数据创建完成!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
