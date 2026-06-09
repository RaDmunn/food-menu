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
  { code: "ro", label: "Romana", flag: <FlagRO /> },
];

export default function Header() {
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [current, setCurrent] = useState<Lang>(languages[0]);
  const ddRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(event.target as Node)) {
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
          <a href="/contact" className="header__link">
            Contact
          </a>
        </nav>

        <div className="header__actions">
          {/*
          <div className="lang" ref={ddRef}>
            <button
              className="lang__trigger"
              onClick={() => setLangOpen((value) => !value)}
              type="button"
            >
              {current.flag}
              <span className="lang__code">{current.code.toUpperCase()}</span>
              <span className={`lang__chev ${langOpen ? "is-open" : ""}`}>
                v
              </span>
            </button>

            <div className={`lang__menu ${langOpen ? "is-open" : ""}`}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  className={`lang__item ${
                    language.code === current.code ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setCurrent(language);
                    setLangOpen(false);
                  }}
                  type="button"
                >
                  {language.flag}
                  <span className="lang__label">{language.label}</span>
                  <span className="lang__tag">{language.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
          */}

          <button
            className="header__burger"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            type="button"
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
              DOMAIN
            </a>
            <button
              className="header-mobile__close"
              aria-label="Close"
              onClick={() => setMenuOpen(false)}
              type="button"
            >
              x
            </button>
          </div>

          <nav className="header-mobile__nav">
            <a href="/" onClick={() => setMenuOpen(false)}>
              Home
            </a>
            <a href="/features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="/contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
          </nav>

          {/*
          <div className="header-mobile__langs">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`header-mobile__lang ${
                  language.code === current.code ? "is-active" : ""
                }`}
                onClick={() => {
                  setCurrent(language);
                  setMenuOpen(false);
                }}
                type="button"
              >
                {language.flag}
                <span>{language.label}</span>
                <em>{language.code.toUpperCase()}</em>
              </button>
            ))}
          </div>
          */}
        </div>
        <button
          className="header-mobile__backdrop"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          type="button"
        />
      </div>
    </div>
  );
}
