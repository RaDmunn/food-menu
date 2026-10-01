import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="site-hero">
      <div className="site-hero__inner container">
        <div className="site-hero__copy">
          <span className="site-eyebrow"><span /> A considered platform for hospitality</span>
          <h1>Every menu has a <em>story.</em> Let it be seen.</h1>
          <p>Seasonal menus, thoughtful presentation and effortless updates. A digital experience made to feel at home in a real restaurant.</p>
          <div className="site-hero__actions">
            <Link className="site-button site-button--dark" href="/contact">Talk to us <ArrowUpRight size={19} /></Link>
            <Link className="site-button site-button--text" href="#how-it-works">Explore the platform <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="site-hero__proof">01 / Crafted for restaurants <span /> 02 / Designed for guests</div>
        </div>
        <div className="site-hero__visual">
          <Image src="/img/editorial/bistro-table.webp" alt="Seasonal pasta served in a contemporary restaurant" fill priority sizes="(max-width: 900px) 100vw, 52vw" />
          <div className="site-hero__float"><span>01 — 03</span><strong>A better way to present what you serve.</strong></div>
        </div>
      </div>
      <div className="site-hero__bottom container"><span>FOODMENU / THE DIGITAL MENU STUDIO</span><span>Restaurant → Seasonal menus → Food &amp; drinks → Dishes</span></div>
    </section>
  );
}
