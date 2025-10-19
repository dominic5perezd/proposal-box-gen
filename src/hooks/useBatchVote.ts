import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { encryptVote } from '@/lib/fhe';

// Sepolia gas cap workaround
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_MAX_GAS = 10000000n; // Safe limit below 16777216 cap

export function useBatchVote() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [isEncrypting, setIsEncrypting] = useState(false);

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const submitBatchVote = async (proposalIds: number[], choices: number[]) => {
    if (!address || proposalIds.length !== 1 || choices.length !== 1) {
      throw new Error('Only single proposal voting is supported');
    }

    try {
      setIsEncrypting(true);

      const proposalId = proposalIds[0];
      const choice = choices[0]; // 0 = Against/No, 1 = For/Yes, 2 = Abstain

      // Encrypt the vote choice
      const { encryptedVote, inputProof } = await encryptVote(
        CONTRACT_ADDRESS,
        address,
        choice
      );

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'voteSingleChoice',
        args: [
          BigInt(proposalId),
          encryptedVote,
          inputProof,
        ],
        ...(chainId === SEPOLIA_CHAIN_ID && { gas: SEPOLIA_MAX_GAS }),
      });

      setTxHash(hash);
      return hash;
    } catch (error) {
      throw error;
    } finally {
      setIsEncrypting(false);
    }
  };

  return {
    submitBatchVote,
    isEncrypting,
    isConfirming,
    txHash,
  };
}
