export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://guildworkman-api.onrender.com";

/** The Stellar networks Freighter can be connected to. */
export type StellarNetwork = "PUBLIC" | "TESTNET" | "FUTURENET";

/** The network GuildWorkman's escrow flow expects the connected wallet to be
    on. Defaults to Testnet, matching the Soroban contracts' current
    deployment target (see the README's "Web3 / Stellar touches" section) —
    override via NEXT_PUBLIC_STELLAR_NETWORK once a mainnet deployment exists. */
export const EXPECTED_STELLAR_NETWORK: StellarNetwork =
  (process.env.NEXT_PUBLIC_STELLAR_NETWORK as StellarNetwork | undefined) ?? "TESTNET";
