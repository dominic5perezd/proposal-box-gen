// Mock data for demonstration
import { Slate, VoteResult } from "@/types/proposal";

export const MOCK_SLATES: Slate[] = [
  {
    id: BigInt(1),
    title: "Q1 2025 Treasury Allocation",
    description: "Vote on multiple proposals for quarterly treasury allocation including development grants, marketing budget, and community initiatives.",
    creator: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    proposals: [
      {
        id: "1",
        title: "Developer Grant Program - $500K",
        description: "Allocate $500,000 for developer grants to build ecosystem tools and integrations.",
      },
      {
        id: "2",
        title: "Marketing Campaign - $200K",
        description: "Fund a comprehensive marketing campaign including social media, content creation, and partnerships.",
      },
      {
        id: "3",
        title: "Community Events - $100K",
        description: "Support community-organized events, hackathons, and educational programs.",
      },
      {
        id: "4",
        title: "Infrastructure Upgrade - $300K",
        description: "Upgrade protocol infrastructure including nodes, indexers, and monitoring systems.",
      },
    ],
    voting_end_time: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    is_active: true,
    total_votes: 1247,
  },
  {
    id: BigInt(2),
    title: "Protocol Upgrade v2.0",
    description: "Critical protocol upgrades including gas optimization, new features, and security enhancements.",
    creator: "0x8ba1f109551bD432803012645Ac136ddd64DBa72",
    proposals: [
      {
        id: "5",
        title: "Gas Optimization Implementation",
        description: "Implement optimizations to reduce gas costs by ~40% for common operations.",
      },
      {
        id: "6",
        title: "Multi-Signature Support",
        description: "Add native multi-signature wallet support for enhanced security.",
      },
      {
        id: "7",
        title: "Cross-Chain Bridge Integration",
        description: "Enable cross-chain asset transfers via trusted bridge protocols.",
      },
    ],
    voting_end_time: BigInt(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    is_active: true,
    total_votes: 892,
  },
  {
    id: BigInt(3),
    title: "Governance Parameter Updates",
    description: "Adjust governance parameters including voting periods, quorum requirements, and proposal thresholds.",
    creator: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8",
    proposals: [
      {
        id: "8",
        title: "Reduce Voting Period to 5 Days",
        description: "Decrease standard voting period from 7 to 5 days for faster decision making.",
      },
      {
        id: "9",
        title: "Increase Quorum to 15%",
        description: "Raise minimum quorum requirement from 10% to 15% of total voting power.",
      },
    ],
    voting_end_time: BigInt(Date.now() - 2 * 24 * 60 * 60 * 1000), // Ended 2 days ago
    is_active: false,
    total_votes: 2156,
  },
];

export const MOCK_RESULTS: Map<string, VoteResult> = new Map([
  ["1", { for_votes: 856, against_votes: 234, abstain_votes: 157, total_votes: 1247 }],
  ["2", { for_votes: 723, against_votes: 398, abstain_votes: 126, total_votes: 1247 }],
  ["3", { for_votes: 1034, against_votes: 112, abstain_votes: 101, total_votes: 1247 }],
  ["4", { for_votes: 567, against_votes: 523, abstain_votes: 157, total_votes: 1247 }],
  ["5", { for_votes: 701, against_votes: 123, abstain_votes: 68, total_votes: 892 }],
  ["6", { for_votes: 612, against_votes: 198, abstain_votes: 82, total_votes: 892 }],
  ["7", { for_votes: 445, against_votes: 334, abstain_votes: 113, total_votes: 892 }],
  ["8", { for_votes: 1023, against_votes: 987, abstain_votes: 146, total_votes: 2156 }],
  ["9", { for_votes: 1567, against_votes: 456, abstain_votes: 133, total_votes: 2156 }],
]);
