"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Lang = { code: string; label: string; flag: ReactNode };

function FlagEN() {
  return (
    <svg viewBox="0 0 60 40" className="flag" aria-hidden="true">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 60,40 M60,0 0,40" stroke="#FFF" strokeWidth="8" />
      <path d="M0,0 60,40 M60,0 0,40" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 V40 M0,20 H60" stroke="#FFF" strokeWidth="12" />
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8" />
    </svg>
  );
}

function FlagRO() {
  return (
    <svg viewBox="0 0 60 40" className="flag" aria-hidden="true">
      <rect width="20" height="40" x="0" y="0" fill="#002B7F" />
      <rect width="20" height="40" x="20" y="0" fill="#FCD116" />
      <rect width="20" height="40" x="40" y="0" fill="#CE1126" />
    </svg>
  );
}

const languages: Lang[] = [
  { code: "en", label: "English", flag: <FlagEN /> },
  { code: "ro", label: "Română", flag: <FlagRO /> },
];

export default function Header() {
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [current, setCurrent] = useState<Lang>(languages[0]);
  const ddRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="header-wrap">
      <header className="header">
        <a className="header__brand" href="/">
          DOMAIN
        </a>
        <nav className="header__nav">
          <a href="/" className="header__link">
            Home
          </a>
          <a href="/features" className="header__link">
            Features
          </a>
          <a href="/pricing" className="header__link">
            Pricing
          </a>
          <a href="/contact" className="header__link">
            Contact
          </a>
        </nav>
        <div className="header__actions">
          <a href="/docs" className="header__button header__button--ghost">
            Docs
          </a>
          <a href="/faq" className="header__button header__button--ghost">
            FAQ
          </a>
          <a href="/demo" className="header__button header__button--cta">
            Request demo
          </a>
          <div className="lang" ref={ddRef}>
            <button
              className="lang__trigger"
              onClick={() => setLangOpen((v) => !v)}
            >
              {current.flag}
              <span className="lang__code">{current.code.toUpperCase()}</span>
              <span className={`lang__chev ${langOpen ? "is-open" : ""}`}>
                ▾
              </span>
            </button>
            <div className={`lang__menu ${langOpen ? "is-open" : ""}`}>
              {languages.map((l) => (
                <button
                  key={l.code}
                  className={`lang__item ${
                    l.code === current.code ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setCurrent(l);
                    setLangOpen(false);
                  }}
                >
                  {l.flag}
                  <span className="lang__label">{l.label}</span>
                  <span className="lang__tag">{l.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            className="header__burger"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`header-mobile ${menuOpen ? "is-open" : ""}`}>
        <div className="header-mobile__panel">
          <div className="header-mobile__top">
            <a
              className="header__brand"
              href="/"
              onClick={() => setMenuOpen(false)}
            >
              habernier.com
            </a>
            <button
              className="header-mobile__close"
              aria-label="Close"
              onClick={() => setMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          <nav className="header-mobile__nav">
            <a href="/" onClick={() => setMenuOpen(false)}>
              Home
            </a>
            <a href="/features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="/pricing" onClick={() => setMenuOpen(false)}>
              Pricing
            </a>
            <a href="/contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
          </nav>
          <div className="header-mobile__actions">
            <a
              href="/docs"
              className="header__button header__button--ghost"
              onClick={() => setMenuOpen(false)}
            >
              Docs
            </a>
            <a
              href="/faq"
              className="header__button header__button--ghost"
              onClick={() => setMenuOpen(false)}
            >
              FAQ
            </a>
            <a
              href="/demo"
              className="header__button header__button--cta"
              onClick={() => setMenuOpen(false)}
            >
              Request demo
            </a>
          </div>
          <div className="header-mobile__langs">
            {languages.map((l) => (
              <button
                key={l.code}
                className={`header-mobile__lang ${
                  l.code === current.code ? "is-active" : ""
                }`}
                onClick={() => {
                  setCurrent(l);
                  setMenuOpen(false);
                }}
              >
                {l.flag}
                <span>{l.label}</span>
                <em>{l.code.toUpperCase()}</em>
              </button>
            ))}
          </div>
        </div>
        <button
          className="header-mobile__backdrop"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      </div>
    </div>
  );
}
