"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import Button from "./ui/Button";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse skills", href: "/book" },
  { label: "For clients", href: "/client" },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink-900 text-cream">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="font-heading text-xl font-semibold tracking-tight"
        >
          GuildWorkman
        </button>

        <nav className="hidden lg:flex items-center gap-8 text-sm text-ink-100">
          {navLinks.map((link) => (
            <button key={link.href} onClick={() => router.push(link.href)} className="hover:text-cream transition-colors">
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="outline-inverse" size="sm" onClick={() => router.push("/login")}>
            Log in
          </Button>
          <Button variant="outline-inverse" size="sm" onClick={() => router.push("/skilWok")}>
            Join as a worker
          </Button>
          <Button size="sm" onClick={() => router.push("/book")}>
            Book now
          </Button>
        </div>

        <button
          className="lg:hidden text-2xl"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-cream/10 px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => {
                setOpen(false);
                router.push(link.href);
              }}
              className="text-left py-1 text-ink-100"
            >
              {link.label}
            </button>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            <Button variant="outline-inverse" onClick={() => router.push("/login")}>
              Log in
            </Button>
            <Button variant="outline-inverse" onClick={() => router.push("/skilWok")}>
              Join as a worker
            </Button>
            <Button onClick={() => router.push("/book")}>Book now</Button>
          </div>
        </div>
      )}
    </header>
  );
}
