const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xeB8B93304C3CEa366D0783B8378BD1F8efbd36b3";
  const [signer] = await hre.ethers.getSigners();

  console.log("🔍 Checking Proposal Status\n");
  console.log("Signer:", signer.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log();

  const ProposalBoxGovernor = await hre.ethers.getContractFactory("ProposalBoxGovernor");
  const contract = ProposalBoxGovernor.attach(CONTRACT_ADDRESS);

  // Get proposal count
  const count = await contract.proposalCount();
  console.log(`Total proposals: ${count.toString()}\n`);

  if (count > 0) {
    const proposalId = count; // Latest proposal
    const proposal = await contract.getProposal(proposalId);

    console.log(`Proposal #${proposalId}:`);
    console.log(`• Title: ${proposal.title}`);
    console.log(`• Proposer: ${proposal.proposer}`);
    console.log(`• Status: ${proposal.status} (0=Active, 1=Ended, 2=Decrypted, 3=Canceled)`);
    console.log(`• Voting Mode: ${proposal.votingMode} (0=Single, 1=Multiple)`);
    console.log(`• Option Count: ${proposal.optionCount}`);
    console.log(`• Total Voters: ${proposal.totalVoters}`);
    console.log(`• Created: ${new Date(Number(proposal.createdAt) * 1000).toLocaleString()}`);
    console.log(`• Deadline: ${new Date(Number(proposal.votingDeadline) * 1000).toLocaleString()}`);
    console.log();

    // Check if user has voted
    const voteRecord = await contract.voteRecords(signer.address, proposalId);
    console.log(`Vote Record for ${signer.address}:`);
    console.log(`• Has Voted: ${voteRecord.hasVoted}`);
    if (voteRecord.hasVoted) {
      console.log(`• Voted At: ${new Date(Number(voteRecord.votedAt) * 1000).toLocaleString()}`);
    }
    console.log();

    // Check if proposal is still active
    const now = Math.floor(Date.now() / 1000);
    const deadline = Number(proposal.votingDeadline);
    const isActive = now < deadline && proposal.status === 0n;
    console.log(`Current time: ${new Date().toLocaleString()}`);
    console.log(`Is Active: ${isActive}`);
    console.log();

    // Read options
    console.log("Options:");
    for (let i = 0; i < Number(proposal.optionCount); i++) {
      const option = await contract.proposalOptions(proposalId, i);
      console.log(`${i}. ${option.title} - ${option.description}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
