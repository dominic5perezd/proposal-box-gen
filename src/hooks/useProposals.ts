import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';

export function useProposal(proposalId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getProposal',
    args: [BigInt(proposalId)],
  });
}

export function useHasVoted(proposalId: number, voter?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'hasVoted',
    args: voter ? [BigInt(proposalId), voter] : undefined,
    query: { enabled: !!voter },
  });
}
