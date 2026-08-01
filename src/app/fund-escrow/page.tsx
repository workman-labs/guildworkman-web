import type { Metadata } from "next";
import EscrowFundingWizard from "@/components/escrow/EscrowFundingWizard";

export const metadata: Metadata = {
  title: "Fund Escrow — GuildWorkman",
  description:
    "Create a milestone-based escrow funding agreement. Funds are held securely on-chain until each milestone condition is met.",
};

export default function FundEscrowPage() {
  return <EscrowFundingWizard />;
}