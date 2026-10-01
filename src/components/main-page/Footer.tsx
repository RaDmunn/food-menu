import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return <footer className="site-footer-new"><div className="container"><div className="site-footer-new__top"><div><span className="site-eyebrow">Your next menu starts here</span><h2>Make every menu<br />easy to explore.</h2></div><Link href="/auth" className="site-button site-button--orange">Open dashboard <ArrowUpRight size={19} /></Link></div><div className="site-footer-new__bottom"><Link href="/" className="site-footer-new__brand">FoodMenu<span>.</span></Link><nav aria-label="Footer navigation"><Link href="/features">Features</Link><Link href="/contact">Contact</Link><Link href="/auth">Dashboard</Link></nav><small>© {new Date().getFullYear()} FoodMenu</small></div></div></footer>;
}
