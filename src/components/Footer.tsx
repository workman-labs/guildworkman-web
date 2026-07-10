import Link from "next/link";
import Logo from "./brand/Logo";
import NorthStar from "./brand/NorthStar";

const COLS = [
  {
    title: "Trades",
    links: ["Electrical", "Plumbing", "Beauty Care", "Carpentry", "Fashion", "Photography"],
  },
  {
    title: "Company",
    links: ["How it works", "Trust & escrow", "About", "Help centre"],
  },
  {
    title: "Get started",
    links: ["Find a pro", "Join as a pro", "Log in", "Download the app"],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-navy px-5 pb-8 pt-14 text-[#c7cfe2] md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo className="text-lg text-[#f4eee4]" />
            <p className="mt-4 max-w-[34ch] text-sm text-[#98a2c0]">
              Book trusted local tradespeople with payment held safely in escrow
              until the job&apos;s done.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#8a94b4]">
                {col.title}
              </h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="block py-1.5 text-sm font-semibold hover:text-white">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#8a94b4]">
          <span>© {new Date().getFullYear()} GuildWorkman · Lagos, Nigeria</span>
          <span className="inline-flex items-center gap-2 font-semibold">
            <NorthStar size={15} color="var(--gold-2)" /> Payments secured on Stellar
          </span>
        </div>
      </div>
    </footer>
  );
}
