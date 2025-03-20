declare global {
  interface Window {
    aptos?: import("../types").AptosWallet;
  }
}
