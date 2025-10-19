const hre = require("hardhat");

async function main() {
  const txHash = "0x3663c8682a7625736b7f334c0b9dc64ed880cc6c05844ea6377220e139d232d6";

  console.log("🔍 Checking Transaction:", txHash);
  console.log();

  try {
    const tx = await hre.ethers.provider.getTransaction(txHash);
    const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);

    console.log("Transaction Details:");
    console.log("• From:", tx.from);
    console.log("• To:", tx.to);
    console.log("• Gas Limit:", tx.gasLimit.toString());
    console.log("• Gas Price:", hre.ethers.formatUnits(tx.gasPrice || 0n, "gwei"), "gwei");
    console.log();

    console.log("Receipt:");
    console.log("• Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
    console.log("• Gas Used:", receipt.gasUsed.toString());
    console.log("• Block:", receipt.blockNumber);
    console.log();

    if (receipt.status === 0) {
      console.log("❌ Transaction Failed!");
      console.log();

      // Try to get revert reason
      try {
        await hre.ethers.provider.call(tx, tx.blockNumber);
      } catch (error) {
        console.log("Revert Reason:");
        console.log(error.message);
        if (error.data) {
          console.log("Error Data:", error.data);
        }
      }
    }

    // Decode input data
    console.log("Input Data Analysis:");
    const CONTRACT_ADDRESS = "0xeB8B93304C3CEa366D0783B8378BD1F8efbd36b3";
    const ProposalBoxGovernor = await hre.ethers.getContractFactory("ProposalBoxGovernor");
    const contract = ProposalBoxGovernor.attach(CONTRACT_ADDRESS);

    try {
      const decoded = contract.interface.parseTransaction({ data: tx.data });
      console.log("• Function:", decoded.name);
      console.log("• Arguments:");
      decoded.args.forEach((arg, idx) => {
        console.log(`  ${idx}: ${arg}`);
      });
    } catch (e) {
      console.log("Could not decode input data");
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
