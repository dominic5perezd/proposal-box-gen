const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ProposalBoxGovernor to Incentiv Testnet...");

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
  console.log("Network: Incentiv Testnet");
  console.log("Chain ID: 11690");
  console.log("Deployer:", deployer.address);

  console.log("\n⚠️  Next Steps:");
  console.log("1. Update CONTRACT_ADDRESS in src/lib/contract.ts");
  console.log("2. Update frontend to connect to Incentiv network");
  console.log("3. Test creating proposals with FHE encryption");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
