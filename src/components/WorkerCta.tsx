import Link from "next/link";
import { FaCheck } from "react-icons/fa6";
import AdinkraPattern from "./brand/AdinkraPattern";
import { buttonClasses } from "./ui/Button";

const PERKS = [
  { b: "Guaranteed pay.", t: "Funds are locked before you start the job." },
  { b: "A rating that's yours.", t: "Your track record is on-chain — tamper-proof, and it follows you." },
  { b: "No cold calls.", t: "Clients come to you, filtered by your trade and area." },
];

export default function WorkerCta() {
  return (
    <section id="workers" className="px-5 py-16 md:px-10 md:py-20">
      <div className="relative mx-auto grid max-w-6xl items-center gap-7 overflow-hidden rounded-3xl bg-gradient-to-br from-terra-2 to-terra-deep p-8 text-[#f5dccb] sm:p-12 lg:grid-cols-[1.1fr_0.9fr]">
        <AdinkraPattern id="adpat-cta" color="#fbe3c9" opacity={0.13} />
        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#fbd9be]">
            For skilled workers
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Got a skill? Get booked.
          </h2>
          <p className="mt-3 max-w-md text-lg">
            List your trade, set your rates, and let clients across Lagos find
            you. Every job is paid up front into escrow — so you always get paid
            for good work.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/skilWok" className={buttonClasses("sand", "lg")}>
              Join as a pro
            </Link>
            <Link href="/#how" className={buttonClasses("outline-inverse", "lg")}>
              See how payouts work
            </Link>
          </div>
        </div>
        <ul className="relative grid gap-3">
          {PERKS.map((p) => (
            <li key={p.b} className="flex items-start gap-3 text-[#f3d8c6]">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <FaCheck aria-hidden className="text-xs text-white" />
              </span>
              <span>
                <b className="font-bold text-white">{p.b}</b> {p.t}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
