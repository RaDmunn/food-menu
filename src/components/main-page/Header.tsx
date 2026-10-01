"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Link href="/" className="site-header__brand" aria-label="FoodMenu home">
          <span className="site-header__mark">fm<span>.</span></span>
          <span>FoodMenu</span>
        </Link>
        <nav className={`site-header__nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
          <Link href="/#how-it-works" onClick={() => setOpen(false)}>How it works</Link>
          <Link href="/features" onClick={() => setOpen(false)}>Features</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
          <Link href="/auth" className="site-header__mobile-cta" onClick={() => setOpen(false)}>Open dashboard</Link>
        </nav>
        <Link href="/auth" className="site-header__cta">Open dashboard <ArrowUpRight size={17} /></Link>
        <button className="site-header__menu" type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
