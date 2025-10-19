// Demo data for better UI presentation
export interface DemoSlate {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'ended';
  deadline: string;
  proposals: Array<{ id: string; title: string; description: string }>;
  category: string;
  totalVotes: number;
}

export const DEMO_SLATES: DemoSlate[] = [
  {
    id: 'demo-1',
    title: 'Q1 2025 Treasury Allocation',
    description: 'Vote on multiple proposals for quarterly treasury allocation including development grants, marketing budget, and community initiatives.',
    status: 'active',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    proposals: [
      { id: 'demo-1-1', title: 'Developer Grant Program', description: 'Allocate $500K for developer grants' },
      { id: 'demo-1-2', title: 'Marketing Campaign', description: 'Fund comprehensive marketing - $200K' },
      { id: 'demo-1-3', title: 'Community Events', description: 'Support events and hackathons - $100K' },
      { id: 'demo-1-4', title: 'Infrastructure Upgrade', description: 'Upgrade protocol infrastructure - $300K' },
    ],
    category: 'treasury',
    totalVotes: 1247,
  },
  {
    id: 'demo-2',
    title: 'Protocol Upgrade v2.0',
    description: 'Critical protocol upgrades including gas optimization, new features, and security enhancements.',
    status: 'active',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    proposals: [
      { id: 'demo-2-1', title: 'Gas Optimization', description: 'Reduce gas costs by ~40%' },
      { id: 'demo-2-2', title: 'Multi-Signature Support', description: 'Add native multi-sig support' },
      { id: 'demo-2-3', title: 'Cross-Chain Bridge', description: 'Enable cross-chain transfers' },
    ],
    category: 'protocol',
    totalVotes: 892,
  },
  {
    id: 'demo-3',
    title: 'Governance Parameter Updates',
    description: 'Adjust governance parameters including voting periods, quorum requirements, and proposal thresholds.',
    status: 'ended',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    proposals: [
      { id: 'demo-3-1', title: 'Reduce Voting Period', description: 'Decrease to 5 days for faster decisions' },
      { id: 'demo-3-2', title: 'Increase Quorum', description: 'Raise minimum quorum to 15%' },
    ],
    category: 'governance',
    totalVotes: 2156,
  },
  {
    id: 'demo-4',
    title: 'NFT Marketplace Integration',
    description: 'Decide on integrating popular NFT marketplaces and implementing royalty standards.',
    status: 'active',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    proposals: [
      { id: 'demo-4-1', title: 'OpenSea Integration', description: 'Enable OpenSea trading' },
      { id: 'demo-4-2', title: 'Blur Integration', description: 'Support Blur marketplace' },
      { id: 'demo-4-3', title: 'EIP-2981 Royalties', description: 'Implement royalty standard' },
    ],
    category: 'community',
    totalVotes: 567,
  },
  {
    id: 'demo-5',
    title: 'Security Audit Funding',
    description: 'Approve funding for comprehensive security audits from top-tier firms.',
    status: 'active',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    proposals: [
      { id: 'demo-5-1', title: 'Trail of Bits', description: '$150K for smart contract audit' },
      { id: 'demo-5-2', title: 'OpenZeppelin', description: '$120K for security review' },
      { id: 'demo-5-3', title: 'Certora', description: '$100K for formal verification' },
    ],
    category: 'technical',
    totalVotes: 734,
  },
];
