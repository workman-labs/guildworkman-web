import { HiLockClosed, HiBadgeCheck, HiGift } from "react-icons/hi";
import Badge from "./ui/Badge";

const pillars = [
  {
    icon: HiLockClosed,
    title: "Escrow-protected payments",
    description:
      "Your payment is held by a Soroban smart contract the moment you book — released to the worker only once you confirm the job is done, refunded in full if you cancel first.",
  },
  {
    icon: HiBadgeCheck,
    title: "On-chain reviews",
    description:
      "Every rating is written immutably to the Stellar network and tied to a real, completed appointment — one review per job, impossible to fake or delete after the fact.",
  },
  {
    icon: HiGift,
    title: "Loyalty rewards",
    description:
      "Clients and workers earn GWP points on every completed appointment — a SEP-41 token you can hold, send, or redeem, minted straight to your Stellar wallet.",
  },
];

export default function TrustSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="max-w-2xl">
        <Badge tone="chain" className="mb-4">
          Built on Stellar
        </Badge>
        <h2 className="font-heading text-3xl md:text-4xl font-semibold">
          Trust, backed by smart contracts
        </h2>
        <p className="mt-4 text-ink-500 text-lg leading-relaxed">
          Behind the booking flow you already know sit three Soroban contracts
          doing the trust-sensitive work — holding funds, recording reviews,
          and paying out rewards — instead of a black box.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {pillars.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl border border-ink-100 p-6">
            <div className="h-11 w-11 rounded-full bg-chain-100 text-chain-600 flex items-center justify-center text-xl">
              <Icon />
            </div>
            <h3 className="mt-5 font-heading text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
