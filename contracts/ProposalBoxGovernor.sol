// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProposalBoxGovernor
 * @dev Enhanced governance contract supporting custom voting options and multiple choice voting
 * @notice Uses Fully Homomorphic Encryption (FHE) for privacy-preserving voting
 */
contract ProposalBoxGovernor is SepoliaConfig, AccessControl, ReentrancyGuard, Pausable {
    enum ProposalStatus { Active, Ended, Decrypted, Executed }
    enum VotingMode { SingleChoice, MultipleChoice }

    struct VoteOption {
        string title;
        string description;
        euint32 encryptedVotes;
        uint32 decryptedVotes;
    }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 createdAt;
        uint256 votingDeadline;
        ProposalStatus status;
        VotingMode votingMode;
        uint256 optionCount;
        uint256 totalVoters;
        uint256[] decryptionRequestIds;
    }

    struct VoteRecord {
        address voter;
        uint256 proposalId;
        uint256 votedAt;
        bool hasVoted;
        // For multiple choice: track which options were voted on
        mapping(uint256 => bool) votedOptions;
    }

    // State variables
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(uint256 => VoteOption)) public proposalOptions; // proposalId => optionId => VoteOption
    mapping(address => mapping(uint256 => VoteRecord)) public voteRecords;
    mapping(uint256 => uint256) public requestIdToProposalId;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Events
    event ProposalCreated(
        uint256 indexed proposalId, 
        address indexed proposer, 
        string title, 
        uint256 votingDeadline,
        VotingMode votingMode,
        uint256 optionCount
    );
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint256 timestamp);
    event ProposalEnded(uint256 indexed proposalId, uint256 timestamp);
    event DecryptionRequested(uint256 indexed proposalId, uint256 timestamp);
    event ProposalDecrypted(uint256 indexed proposalId, uint256 timestamp);

    // Modifiers
    modifier proposalExists(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "Proposal does not exist");
        _;
    }

    modifier isActive(uint256 proposalId) {
        require(proposals[proposalId].status == ProposalStatus.Active, "Proposal is not active");
        require(block.timestamp < proposals[proposalId].votingDeadline, "Voting period has ended");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Create a new proposal with custom voting options
     * @param title Proposal title
     * @param description Proposal description
     * @param votingDuration Duration of voting period in seconds
     * @param votingMode Single or multiple choice voting
     * @param optionTitles Array of option titles
     * @param optionDescriptions Array of option descriptions
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 votingDuration,
        VotingMode votingMode,
        string[] memory optionTitles,
        string[] memory optionDescriptions
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(votingDuration >= 1 hours, "Voting duration too short");
        require(votingDuration <= 30 days, "Voting duration too long");
        require(optionTitles.length >= 2, "Must have at least 2 options");
        require(optionTitles.length <= 20, "Too many options");
        require(optionTitles.length == optionDescriptions.length, "Arrays length mismatch");

        proposalCount++;
        uint256 proposalId = proposalCount;

        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.title = title;
        proposal.description = description;
        proposal.proposer = msg.sender;
        proposal.createdAt = block.timestamp;
        proposal.votingDeadline = block.timestamp + votingDuration;
        proposal.status = ProposalStatus.Active;
        proposal.votingMode = votingMode;
        proposal.optionCount = optionTitles.length;

        // Initialize vote options
        for (uint256 i = 0; i < optionTitles.length; i++) {
            VoteOption storage option = proposalOptions[proposalId][i];
            option.title = optionTitles[i];
            option.description = optionDescriptions[i];
            option.encryptedVotes = FHE.asEuint32(0);
            // Don't call allowThis() here - only after modifications in vote functions
        }

        emit ProposalCreated(
            proposalId, 
            msg.sender, 
            title, 
            proposal.votingDeadline,
            votingMode,
            optionTitles.length
        );
        
        return proposalId;
    }

    /**
     * @notice Cast a vote on a proposal (single choice)
     * @param proposalId The proposal ID
     * @param encryptedChoice Encrypted option index
     * @param inputProof ZK proof for the encrypted input
     */
    function voteSingleChoice(
        uint256 proposalId, 
        externalEuint32 encryptedChoice, 
        bytes calldata inputProof
    ) external nonReentrant whenNotPaused proposalExists(proposalId) isActive(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.votingMode == VotingMode.SingleChoice, "Not a single choice vote");
        
        VoteRecord storage record = voteRecords[msg.sender][proposalId];
        require(!record.hasVoted, "Already voted on this proposal");

        euint32 choice = FHE.fromExternal(encryptedChoice, inputProof);
        FHE.allowThis(choice);

        // Add vote to the selected option using FHE operations
        for (uint256 i = 0; i < proposal.optionCount; i++) {
            VoteOption storage option = proposalOptions[proposalId][i];
            
            // Check if this is the selected option
            ebool isSelected = FHE.eq(choice, FHE.asEuint32(uint32(i)));
            euint32 voteIncrement = FHE.select(isSelected, FHE.asEuint32(1), FHE.asEuint32(0));
            
            option.encryptedVotes = FHE.add(option.encryptedVotes, voteIncrement);
            FHE.allowThis(option.encryptedVotes);
        }

        record.voter = msg.sender;
        record.proposalId = proposalId;
        record.votedAt = block.timestamp;
        record.hasVoted = true;
        proposal.totalVoters++;

        emit VoteCast(proposalId, msg.sender, block.timestamp);
    }

    /**
     * @notice Cast votes on multiple options (multiple choice)
     * @param proposalId The proposal ID
     * @param encryptedChoices Array of encrypted boolean flags (1 = selected, 0 = not selected)
     * @param inputProof ZK proof for the encrypted inputs
     */
    function voteMultipleChoice(
        uint256 proposalId,
        externalEuint32[] calldata encryptedChoices,
        bytes calldata inputProof
    ) external nonReentrant whenNotPaused proposalExists(proposalId) isActive(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.votingMode == VotingMode.MultipleChoice, "Not a multiple choice vote");
        require(encryptedChoices.length == proposal.optionCount, "Invalid choices length");
        
        VoteRecord storage record = voteRecords[msg.sender][proposalId];
        require(!record.hasVoted, "Already voted on this proposal");

        // Process each option
        for (uint256 i = 0; i < proposal.optionCount; i++) {
            euint32 choice = FHE.fromExternal(encryptedChoices[i], inputProof);
            FHE.allowThis(choice);

            VoteOption storage option = proposalOptions[proposalId][i];
            
            // Choice should be 0 or 1 (not selected or selected)
            // Add the choice value directly (0 or 1)
            option.encryptedVotes = FHE.add(option.encryptedVotes, choice);
            FHE.allowThis(option.encryptedVotes);
            
            record.votedOptions[i] = true;
        }

        record.voter = msg.sender;
        record.proposalId = proposalId;
        record.votedAt = block.timestamp;
        record.hasVoted = true;
        proposal.totalVoters++;

        emit VoteCast(proposalId, msg.sender, block.timestamp);
    }

    /**
     * @notice End a proposal's voting period
     */
    function endProposal(uint256 proposalId) 
        external 
        onlyRole(ADMIN_ROLE) 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal is not active");
        require(block.timestamp >= proposal.votingDeadline, "Voting period not ended");
        
        proposal.status = ProposalStatus.Ended;
        emit ProposalEnded(proposalId, block.timestamp);
    }

    /**
     * @notice Request decryption of vote results
     */
    function requestDecryption(uint256 proposalId) 
        external 
        onlyRole(ADMIN_ROLE) 
        proposalExists(proposalId) 
        returns (uint256[] memory) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Ended, "Proposal not ended");

        bytes32[] memory cts = new bytes32[](proposal.optionCount);
        
        for (uint256 i = 0; i < proposal.optionCount; i++) {
            cts[i] = FHE.toBytes32(proposalOptions[proposalId][i].encryptedVotes);
        }

        uint256 requestId = FHE.requestDecryption(
            cts,
            this.fulfillDecryption.selector
        );

        proposal.decryptionRequestIds.push(requestId);
        requestIdToProposalId[requestId] = proposalId;

        emit DecryptionRequested(proposalId, block.timestamp);
        
        uint256[] memory requestIds = new uint256[](1);
        requestIds[0] = requestId;
        return requestIds;
    }

    /**
     * @notice Callback function for decryption results (FHEVM 0.8.0)
     */
    function fulfillDecryption(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures against the request and provided cleartexts
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        uint256 proposalId = requestIdToProposalId[requestId];
        require(proposalId > 0, "Invalid request ID");

        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Ended, "Proposal not ended");

        // Decode cleartexts based on option count
        uint32[] memory decryptedValues = new uint32[](proposal.optionCount);

        if (proposal.optionCount == 2) {
            (uint32 v0, uint32 v1) = abi.decode(cleartexts, (uint32, uint32));
            decryptedValues[0] = v0;
            decryptedValues[1] = v1;
        } else if (proposal.optionCount == 3) {
            (uint32 v0, uint32 v1, uint32 v2) = abi.decode(cleartexts, (uint32, uint32, uint32));
            decryptedValues[0] = v0;
            decryptedValues[1] = v1;
            decryptedValues[2] = v2;
        } else if (proposal.optionCount == 4) {
            (uint32 v0, uint32 v1, uint32 v2, uint32 v3) = abi.decode(cleartexts, (uint32, uint32, uint32, uint32));
            decryptedValues[0] = v0;
            decryptedValues[1] = v1;
            decryptedValues[2] = v2;
            decryptedValues[3] = v3;
        } else {
            // For more options, decode as array
            decryptedValues = abi.decode(cleartexts, (uint32[]));
        }

        for (uint256 i = 0; i < decryptedValues.length && i < proposal.optionCount; i++) {
            proposalOptions[proposalId][i].decryptedVotes = decryptedValues[i];
        }

        proposal.status = ProposalStatus.Decrypted;
        emit ProposalDecrypted(proposalId, block.timestamp);
    }

    /**
     * @notice Get proposal details
     */
    function getProposal(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (
            string memory title,
            string memory description,
            address proposer,
            uint256 votingDeadline,
            ProposalStatus status,
            VotingMode votingMode,
            uint256 optionCount,
            uint256 totalVoters
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.proposer,
            proposal.votingDeadline,
            proposal.status,
            proposal.votingMode,
            proposal.optionCount,
            proposal.totalVoters
        );
    }

    /**
     * @notice Get vote option details
     */
    function getVoteOption(uint256 proposalId, uint256 optionId)
        external
        view
        proposalExists(proposalId)
        returns (
            string memory title,
            string memory description,
            uint32 decryptedVotes
        )
    {
        require(optionId < proposals[proposalId].optionCount, "Invalid option ID");
        VoteOption storage option = proposalOptions[proposalId][optionId];
        return (option.title, option.description, option.decryptedVotes);
    }

    /**
     * @notice Get all decrypted results for a proposal
     */
    function getResults(uint256 proposalId)
        external
        view
        proposalExists(proposalId)
        returns (uint32[] memory)
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Decrypted, "Results not yet decrypted");

        uint32[] memory results = new uint32[](proposal.optionCount);
        for (uint256 i = 0; i < proposal.optionCount; i++) {
            results[i] = proposalOptions[proposalId][i].decryptedVotes;
        }
        return results;
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
