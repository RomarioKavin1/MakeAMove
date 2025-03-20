// types.ts
export type AptosWallet = {
  connect: () => Promise<{ address: string }>;
  disconnect: () => Promise<void>;
  account: () => Promise<{ address: string }>;
  signAndSubmitTransaction: (transaction: any) => Promise<{ hash: string }>;
  signTransaction: (transaction: any) => Promise<any>;
  network: () => Promise<{ name: string }>;
  isConnected: () => Promise<boolean>;
};

export type WalletContextType = {
  wallet: AptosWallet | null;
  connected: boolean;
  connecting: boolean;
  account: { address: string } | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: Error | null;
  network: string | null;
};
