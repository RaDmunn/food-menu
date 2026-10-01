import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check, QrCode } from "lucide-react";

export default function Hero() {
  return (
    <section className="site-hero">
      <div className="site-hero__inner container">
        <div className="site-hero__copy">
          <span className="site-eyebrow"><span /> Digital menus for hospitality</span>
          <h1>A better menu experience, from first scan to last course.</h1>
          <p>Create clear, beautiful digital menus for every venue. Update dishes in one place and give guests a menu that is always current.</p>
          <div className="site-hero__actions">
            <Link className="site-button site-button--dark" href="/auth">Create your menu <ArrowUpRight size={19} /></Link>
            <Link className="site-button site-button--text" href="#how-it-works">See how it works <span aria-hidden="true">→</span></Link>
          </div>
          <div className="site-hero__proof"><Check size={17} /> No app for guests <span /> <Check size={17} /> Updates appear instantly</div>
        </div>
        <div className="site-hero__visual">
          <Image src="/img/editorial/bistro-table.webp" alt="Seasonal pasta served in a contemporary restaurant" fill priority sizes="(max-width: 900px) 100vw, 52vw" />
          <div className="site-hero__float"><QrCode size={24} strokeWidth={1.6} /><div><strong>One scan. Your menu.</strong><span>Ready at every table</span></div></div>
        </div>
      </div>
      <div className="site-hero__bottom container"><span>BUILT FOR REAL RESTAURANT WORKFLOWS</span><span>Restaurant → Menus → Sections → Dishes</span></div>
    </section>
  );
}
