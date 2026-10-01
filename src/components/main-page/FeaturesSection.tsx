import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Globe2, Image as ImageIcon, ScanLine, SlidersHorizontal } from "lucide-react";

const features = [
  { icon: SlidersHorizontal, title: "One place to manage", text: "Keep each restaurant, menu, section and dish organized without a crowded workspace." },
  { icon: ImageIcon, title: "Details guests need", text: "Show clear descriptions, pricing, photos, ingredients and dietary information." },
  { icon: ScanLine, title: "Made for the table", text: "Every public menu has a shareable link and a QR code ready for print." },
  { icon: Globe2, title: "Flexible for growth", text: "Run several restaurants and several menus with one owner account." },
];

export default function FeaturesSection() {
  return <>
    <section className="site-features" id="features"><div className="container"><div className="site-section-heading site-section-heading--split"><div><span className="site-eyebrow">Thoughtfully practical</span><h2>All the essentials.<br />None of the clutter.</h2></div><p>Make edits in the dashboard, then let guests explore a polished menu on their own phone.</p></div><div className="site-features__grid">{features.map(({ icon: Icon, title, text }) => <article className="site-feature" key={title}><Icon size={27} strokeWidth={1.6} /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    <section className="site-showcase"><div className="container site-showcase__grid"><div className="site-showcase__image"><Image src="/img/editorial/tart.webp" alt="Lemon tart and espresso in a café" fill sizes="(max-width: 900px) 100vw, 47vw" /></div><div className="site-showcase__copy"><span className="site-eyebrow">For the guest experience</span><h2>Let the food speak for itself.</h2><p>Readable menus, beautiful dish photography and helpful details make choosing feel effortless. Every change you make is reflected in the guest view.</p><Link href="/auth" className="site-button site-button--light">Start building your menu <ArrowUpRight size={18} /></Link></div></div></section>
  </>;
}
