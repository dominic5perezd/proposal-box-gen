import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ProposalBox',
  projectId: import.meta.env.VITE_WALLET_CONNECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia],
});
