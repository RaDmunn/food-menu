type HeroProps = {
  domain?: string;
  line1?: string;
  line2?: string;
  subtitle?: string;
};

export default function Hero({
  domain = "DOMAIN",
  line1 = "DOMAIN",
  line2 = "Digital menus built for faster service",
  subtitle = "A clean QR menu platform for restaurants that need instant updates, multilingual content, and a smoother guest experience.",
}: HeroProps) {
  return (
    <section className="hero-qrmenu" aria-labelledby="hero-title" data-section="hero">
      <div className="hero-qrmenu__inner container">
        <div className="hero-qrmenu__grid">
          <div className="hero-qrmenu__content">
            <div className="hero-qrmenu__eyebrow" data-i18n="hero.eyebrow">
              QR menu for cafes & restaurants
            </div>
            <h1 id="hero-title" className="hero-qrmenu__title" aria-live="polite">
              <span className="hero-qrmenu__title-main" data-i18n="hero.titleMain">
                {line1 || domain}
              </span>
              <span className="hero-qrmenu__title-accent" data-i18n="hero.titleAccent">
                {line2}
              </span>
            </h1>
            <p className="hero-qrmenu__subtitle" data-i18n="hero.subtitle">
              {subtitle}
            </p>
            <ul className="hero-qrmenu__badges" aria-label="Highlights">
              <li className="badge" data-i18n="hero.badge1">
                No app needed
              </li>
              <li className="badge" data-i18n="hero.badge2">
                Multi-language
              </li>
              <li className="badge" data-i18n="hero.badge3">
                Table analytics
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
