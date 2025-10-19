const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ProposalBoxGovernor to Sepolia...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "ETH");

  const ProposalBoxGovernor = await hre.ethers.getContractFactory("ProposalBoxGovernor");
  console.log("⏳ Deploying contract...");

  const contract = await ProposalBoxGovernor.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ ProposalBoxGovernor deployed to:", address);

  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", address);
  console.log("Network: Sepolia");
  console.log("Deployer:", deployer.address);

  console.log("\n⚠️  Next Steps:");
  console.log("1. Update CONTRACT_ADDRESS in src/lib/contract.ts");
  console.log("2. Verify contract: npx hardhat verify --network sepolia", address);
  console.log("3. Grant VOTER_ROLE to test addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
