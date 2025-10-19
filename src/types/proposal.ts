// Core types for ProposalBox voting system

export interface Proposal {
  id: string;
  title: string;
  description: string;
  ipfs_hash?: string;
}

export interface Slate {
  id: bigint;
  title: string;
  description: string;
  creator: string;
  proposals: Proposal[];
  voting_end_time: bigint;
  is_active: boolean;
  total_votes: number;
}

export interface VoteChoice {
  proposal_id: string;
  choice: number; // 0: Against, 1: For, 2: Abstain
}

export interface VoteResult {
  for_votes: number;
  against_votes: number;
  abstain_votes: number;
  total_votes: number;
}

export interface SlateWithResults extends Slate {
  results?: Map<string, VoteResult>;
}
