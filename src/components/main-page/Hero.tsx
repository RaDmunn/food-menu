import React from "react";

type HeroProps = {
  domain?: string;
  line1?: string;
  line2?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  demoQrSrc?: string;
  mockupImgSrc?: string;
};

export default function Hero({
  domain = "DOMAIN",
  line1 = "DOMAIN",
  line2 = "Menus that live in your guest’s pocket",
  subtitle = "Replace paper menus with a blazing-fast, multilingual QR experience.",
  ctaPrimary = "Try live demo",
  ctaSecondary = "Pricing",
  demoQrSrc = "/assets/img/qr-demo.png",
  mockupImgSrc = "/assets/img/phone-mock.webp",
}: HeroProps) {
  return (
    <section className="hero-qrmenu" aria-labelledby="hero-title" data-section="hero">
      <div className="hero-qrmenu__inner container">
        <div className="hero-qrmenu__grid">
          <div className="hero-qrmenu__content">
            <div className="hero-qrmenu__eyebrow" data-i18n="hero.eyebrow">QR menu for cafés & restaurants</div>
            <h1 id="hero-title" className="hero-qrmenu__title" aria-live="polite">
              <span className="hero-qrmenu__title-main" data-i18n="hero.titleMain">{line1 || domain}</span>
              <span className="hero-qrmenu__title-accent" data-i18n="hero.titleAccent">{line2}</span>
            </h1>
            <p className="hero-qrmenu__subtitle" data-i18n="hero.subtitle">{subtitle}</p>
            <div className="hero-qrmenu__actions">
              <a href="#demo" className="btn btn--primary" data-i18n="hero.ctaPrimary" aria-label="Open live demo">{ctaPrimary}</a>
              <a href="#pricing" className="btn btn--ghost" data-i18n="hero.ctaSecondary" aria-label="See pricing">{ctaSecondary}</a>
            </div>
            <ul className="hero-qrmenu__badges" aria-label="Highlights">
              <li className="badge" data-i18n="hero.badge1">No app needed</li>
              <li className="badge" data-i18n="hero.badge2">Multi-language</li>
              <li className="badge" data-i18n="hero.badge3">Table analytics</li>
            </ul>
          </div>
          <div className="hero-qrmenu__media">
            <figure className="hero-qrmenu__qr" aria-label="Scan to view demo menu">
              <img src={demoQrSrc} alt="QR code demo" className="hero-qrmenu__qr-img" />
              <figcaption className="hero-qrmenu__qr-caption" data-i18n="hero.qrCaption">Scan me</figcaption>
            </figure>
            <div className="hero-qrmenu__mock">
              <img src={mockupImgSrc} alt="Menu on smartphone preview" className="hero-qrmenu__mock-img" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
