import ABI_JSON from './ProposalBoxGovernor.abi.json';

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '0xeB8B93304C3CEa366D0783B8378BD1F8efbd36b3') as `0x${string}`;

export const ABI = ABI_JSON as const;
