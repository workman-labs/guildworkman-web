"use client";

import { useState } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import Logo from "./brand/Logo";
import ThemeToggle from "./ThemeToggle";
import NotificationCenter from "./notifications/NotificationCenter";
import { buttonClasses } from "./ui/Button";

const navLinks = [
  { label: "Browse trades", href: "/#categories" },
  { label: "How it works", href: "/#how" },
  { label: "For workers", href: "/skilWok" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-sand/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-5 md:px-10">
        <Link href="/" aria-label="GuildWorkman home">
          <Logo className="text-lg text-ink" />
        </Link>

        <nav className="ml-3 hidden items-center gap-7 text-sm font-semibold text-muted lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          <NotificationCenter />
          <Link href="/login" className={buttonClasses("outline", "sm")}>
            Log in
          </Link>
          <Link href="/client" className={buttonClasses("primary", "sm")}>
            Sign up
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <NotificationCenter />
          <button
            className="text-2xl text-ink"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line px-5 py-4 sm:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2 font-semibold text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)} className={buttonClasses("outline", "md")}>
              Log in
            </Link>
            <Link href="/client" onClick={() => setOpen(false)} className={buttonClasses("primary", "md")}>
              Sign up
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
