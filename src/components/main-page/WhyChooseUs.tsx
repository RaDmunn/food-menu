import Image from "next/image";
import { ArrowRight, Layers3, PencilLine, QrCode } from "lucide-react";

const steps = [
  { icon: Layers3, number: "01", title: "Shape your collection", text: "Create a summer, spring or special menu for each restaurant." },
  { icon: PencilLine, number: "02", title: "Organize every course", text: "Inside each menu, group food and drinks into categories such as pasta, pizza and cocktails." },
  { icon: QrCode, number: "03", title: "Share one link", text: "Put the QR code on a table. Guests see every update as soon as you publish it." },
];

export default function WhyChooseUs() {
  return (
    <section className="site-process" id="how-it-works">
      <div className="container">
        <div className="site-section-heading"><span className="site-eyebrow">A simpler way to publish</span><h2>From your kitchen to their table.</h2><p>A straightforward workflow for teams that change menus as often as they need to.</p></div>
        <div className="site-process__grid">
          <div className="site-process__steps">{steps.map(({ icon: Icon, number, title, text }) => <div className="site-process__step" key={number}><span className="site-process__number">{number}</span><div><div className="site-process__step-title"><Icon size={21} strokeWidth={1.8} /><h3>{title}</h3></div><p>{text}</p></div><ArrowRight className="site-process__arrow" size={19} /></div>)}</div>
          <div className="site-process__image"><Image src="/img/editorial/vegetables.webp" alt="Roasted seasonal vegetables served on a restaurant plate" fill sizes="(max-width: 900px) 100vw, 45vw" /></div>
        </div>
      </div>
    </section>
  );
}
