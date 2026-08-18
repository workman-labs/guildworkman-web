import { FaWallet } from "react-icons/fa6";
import Button from "@/components/ui/Button";
import { truncateAddress } from "@/lib/wallet";

interface ConnectWalletStepProps {
  address: string | null;
  connecting: boolean;
  freighterMissing: boolean;
  error: string | null;
  onConnect: () => void;
}

export default function ConnectWalletStep({
  address,
  connecting,
  freighterMissing,
  error,
  onConnect,
}: ConnectWalletStepProps) {
  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Connect your wallet</h2>
      <p className="text-muted mt-1 mb-6">
        We use your Stellar wallet to fund the escrow contract directly — no card details needed.
      </p>

      {address ? (
        <div className="flex items-center gap-3 rounded-xl border border-ok/30 bg-ok/10 p-4">
          <FaWallet className="text-ok" aria-hidden />
          <span className="font-mono text-sm font-semibold text-ink">{truncateAddress(address)}</span>
        </div>
      ) : (
        <div className="rounded-xl border border-line p-6 text-center">
          <FaWallet className="mx-auto mb-3 text-2xl text-muted" aria-hidden />
          <Button type="button" onClick={onConnect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Freighter wallet"}
          </Button>
          {freighterMissing && (
            <p className="mt-3 text-sm text-muted">
              Freighter extension not detected.{" "}
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-navy-2 underline"
              >
                Install Freighter
              </a>{" "}
              to continue.
            </p>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-err">
          {error}
        </p>
      )}
    </div>
  );
}
