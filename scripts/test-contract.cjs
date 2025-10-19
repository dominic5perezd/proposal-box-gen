const hre = require("hardhat");

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     ProposalBox Smart Contract Integration Test           ║");
  console.log("║     Senior Test Engineer - Contract Direct Testing        ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Contract address on Sepolia
  const CONTRACT_ADDRESS = "0xeB8B93304C3CEa366D0783B8378BD1F8efbd36b3";

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Test Account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("🌐 Network:", hre.network.name);
  console.log("🔗 Contract Address:", CONTRACT_ADDRESS);
  console.log("\n" + "═".repeat(60) + "\n");

  // Load contract
  const ProposalBoxGovernor = await hre.ethers.getContractFactory("ProposalBoxGovernor");
  const contract = ProposalBoxGovernor.attach(CONTRACT_ADDRESS);

  // Test results
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, status, details = "") {
    testResults.total++;
    const icon = status ? "✅" : "❌";
    const statusText = status ? "PASS" : "FAIL";
    console.log(`${icon} Test ${testResults.total}: ${name} - ${statusText}`);
    if (details) console.log(`   └─ ${details}`);

    testResults.tests.push({ name, status, details });
    if (status) testResults.passed++;
    else testResults.failed++;
  }

  try {
    // ========== TEST 1: Read Initial State ==========
    console.log("📊 TEST 1: Reading Contract Initial State\n");

    try {
      const proposalCount = await contract.proposalCount();
      logTest(
        "Read proposalCount",
        true,
        `Current count: ${proposalCount.toString()}`
      );
    } catch (error) {
      logTest("Read proposalCount", false, error.message);
    }

    console.log("\n" + "─".repeat(60) + "\n");

    // ========== TEST 2: Create Proposal ==========
    console.log("🆕 TEST 2: Creating Test Proposal\n");

    const proposalData = {
      title: "Community Fund Allocation Test",
      description: "This is a test proposal to verify contract functionality on Sepolia testnet.",
      votingDuration: 7 * 24 * 60 * 60, // 7 days in seconds
      votingMode: 0, // SingleChoice
      optionTitles: [
        "Development - $60K",
        "Marketing - $40K",
        "Events & Community - $50K each",
        "Save for later"
      ],
      optionDescriptions: [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ]
    };

    try {
      console.log("   Proposal Details:");
      console.log(`   • Title: ${proposalData.title}`);
      console.log(`   • Duration: ${proposalData.votingDuration / 3600} hours`);
      console.log(`   • Voting Mode: ${proposalData.votingMode === 0 ? 'Single Choice' : 'Multiple Choice'}`);
      console.log(`   • Options: ${proposalData.optionTitles.length}`);
      proposalData.optionTitles.forEach((opt, idx) => {
        console.log(`     ${idx + 1}. ${opt}`);
      });
      console.log();

      // Estimate gas
      console.log("   ⛽ Estimating gas...");
      const gasEstimate = await contract.createProposal.estimateGas(
        proposalData.title,
        proposalData.description,
        proposalData.votingDuration,
        proposalData.votingMode,
        proposalData.optionTitles,
        proposalData.optionDescriptions
      );
      console.log(`   ✓ Estimated gas: ${gasEstimate.toString()}`);
      logTest("Gas estimation", true, `${gasEstimate.toString()} gas units`);

      // Send transaction
      console.log("\n   📤 Sending transaction...");
      const tx = await contract.createProposal(
        proposalData.title,
        proposalData.description,
        proposalData.votingDuration,
        proposalData.votingMode,
        proposalData.optionTitles,
        proposalData.optionDescriptions,
        {
          gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
        }
      );

      console.log(`   ✓ Transaction sent: ${tx.hash}`);
      console.log(`   ⏳ Waiting for confirmation...`);

      const receipt = await tx.wait();
      console.log(`   ✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);

      logTest(
        "Create proposal transaction",
        receipt.status === 1,
        `Block: ${receipt.blockNumber}, Gas: ${receipt.gasUsed.toString()}`
      );

      // Extract proposal ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'ProposalCreated';
        } catch {
          return false;
        }
      });

      let proposalId;
      if (event) {
        const parsed = contract.interface.parseLog(event);
        proposalId = parsed.args.proposalId;
        console.log(`   📋 Proposal ID: ${proposalId.toString()}`);
        logTest("Proposal ID extraction", true, `ID: ${proposalId.toString()}`);
      } else {
        logTest("Proposal ID extraction", false, "Event not found");
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      logTest("Create proposal transaction", false, error.message);

      if (error.message.includes("revert")) {
        console.log("\n   🔍 Analyzing revert reason...");
        const revertData = error.data || error.error?.data;
        if (revertData) {
          try {
            const decodedError = contract.interface.parseError(revertData);
            console.log(`   Revert reason: ${decodedError.name}`);
          } catch {
            console.log(`   Raw revert data: ${revertData}`);
          }
        }
      }
    }

    console.log("\n" + "─".repeat(60) + "\n");

    // ========== TEST 3: Read Proposal Data ==========
    console.log("📖 TEST 3: Reading Proposal Data\n");

    try {
      const currentCount = await contract.proposalCount();
      console.log(`   Total proposals: ${currentCount.toString()}`);

      if (currentCount > 0) {
        const proposalId = currentCount; // Read the latest proposal
        const proposal = await contract.getProposal(proposalId);

        console.log(`\n   Proposal #${proposalId}:`);
        console.log(`   • Title: ${proposal.title}`);
        console.log(`   • Proposer: ${proposal.proposer}`);
        console.log(`   • Status: ${proposal.status}`);
        console.log(`   • Voting Mode: ${proposal.votingMode === 0n ? 'Single Choice' : 'Multiple Choice'}`);
        console.log(`   • Option Count: ${proposal.optionCount.toString()}`);
        console.log(`   • Total Voters: ${proposal.totalVoters.toString()}`);

        const deadline = new Date(Number(proposal.votingDeadline) * 1000);
        console.log(`   • Deadline: ${deadline.toLocaleString()}`);

        logTest("Read proposal data", true, `Proposal #${proposalId} retrieved successfully`);

        // Read options
        console.log(`\n   Options:`);
        for (let i = 0; i < Number(proposal.optionCount); i++) {
          try {
            const option = await contract.proposalOptions(proposalId, i);
            console.log(`   ${i + 1}. ${option.title} - ${option.description}`);
          } catch (err) {
            console.log(`   ${i + 1}. Error reading option: ${err.message}`);
          }
        }
        logTest("Read proposal options", true, `${proposal.optionCount} options retrieved`);

      } else {
        logTest("Read proposal data", false, "No proposals found");
      }
    } catch (error) {
      logTest("Read proposal data", false, error.message);
      console.log(`   Error: ${error.message}`);
    }

  } catch (error) {
    console.error("\n❌ Critical Error:", error.message);
    console.error(error);
  }

  // ========== FINAL REPORT ==========
  console.log("\n" + "═".repeat(60));
  console.log("\n📊 TEST SUMMARY REPORT\n");
  console.log("─".repeat(60));
  console.log(`Total Tests:  ${testResults.total}`);
  console.log(`✅ Passed:     ${testResults.passed} (${Math.round(testResults.passed/testResults.total*100)}%)`);
  console.log(`❌ Failed:     ${testResults.failed} (${Math.round(testResults.failed/testResults.total*100)}%)`);
  console.log("─".repeat(60));

  console.log("\nDetailed Results:");
  testResults.tests.forEach((test, idx) => {
    const icon = test.status ? "✅" : "❌";
    console.log(`${icon} ${idx + 1}. ${test.name}`);
    if (test.details) {
      console.log(`   ${test.details}`);
    }
  });

  console.log("\n" + "═".repeat(60));

  const overallStatus = testResults.failed === 0 ? "✅ ALL TESTS PASSED" : "⚠️  SOME TESTS FAILED";
  console.log(`\n${overallStatus}\n`);

  process.exit(testResults.failed === 0 ? 0 : 1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test Suite Failed:", error);
    process.exit(1);
  });
