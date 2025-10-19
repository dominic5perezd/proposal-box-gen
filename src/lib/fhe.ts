// Based on SecretVote implementation
// Using Relayer SDK 0.2.0 from CDN
import { hexlify } from 'ethers';

let fheInstance: any = null;

export async function initializeFHE() {
  if (fheInstance) return fheInstance;

  try {
    // Check if ethereum is available
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
    }

    console.log('[FHE] Loading Relayer SDK from CDN...');
    const sdk: any = await import('https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js');
    const { initSDK, createInstance, SepoliaConfig } = sdk as any;

    console.log('[FHE] Initializing WASM...');
    await initSDK();

    console.log('[FHE] Creating FHE instance with Sepolia config:', {
      aclContract: SepoliaConfig.aclContractAddress,
      kmsContract: SepoliaConfig.kmsContractAddress,
      chainId: SepoliaConfig.chainId,
    });

    // Use SepoliaConfig's default RPC instead of MetaMask to avoid provider issues
    const config = SepoliaConfig;

    fheInstance = await createInstance(config);
    console.log('[FHE] Instance created successfully');
    return fheInstance;
  } catch (error: any) {
    console.error('[FHE] Initialization failed:', error);
    console.error('[FHE] Error details:', {
      message: error.message,
      code: error.code,
      data: error.data,
    });
    throw error;
  }
}

export function getFHEInstance() {
  return fheInstance;
}

export async function encryptVote(contractAddress: string, userAddress: string, voteChoice: number) {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE instance');

  console.log('[Vote] Encrypting vote choice:', voteChoice);

  // Create encrypted input
  const ciphertext = await fhe.createEncryptedInput(contractAddress, userAddress);
  ciphertext.add32(BigInt(voteChoice));

  // Encrypt and get handles + proof
  const { handles, inputProof } = await ciphertext.encrypt();

  // Use hexlify to convert to proper hex format (same as SecretVote)
  const encryptedHex = hexlify(handles[0]);
  const proofHex = hexlify(inputProof);

  console.log('[Vote] Encryption complete', {
    encryptedLength: encryptedHex.length,
    proofLength: proofHex.length,
  });

  return {
    encryptedVote: encryptedHex as `0x${string}`,
    inputProof: proofHex as `0x${string}`,
  };
}
