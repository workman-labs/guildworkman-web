// Barrel for the wallet system (same pattern as theme/index.ts,
// notifications/index.ts). WalletProvider/NetworkGuard only import from
// "@/lib/wallet" and "./WalletProvider" directly — nothing here imports
// back through this barrel — so re-exporting creates no circular-import risk.
export { default as NetworkGuard } from "./NetworkGuard";
export { WalletProvider, useWallet } from "./WalletProvider";
