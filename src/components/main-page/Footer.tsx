import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return <footer className="site-footer-new"><div className="container"><div className="site-footer-new__top"><div><span className="site-eyebrow">Made for memorable places</span><h2>Good food deserves<br /><em>a good first impression.</em></h2></div><Link href="/contact" className="site-button site-button--orange">Start a conversation <ArrowUpRight size={19} /></Link></div><div className="site-footer-new__bottom"><Link href="/" className="site-footer-new__brand">food<span>menu</span></Link><nav aria-label="Footer navigation"><Link href="/features">Features</Link><Link href="/contact">Contact</Link></nav><small>© {new Date().getFullYear()} FoodMenu</small></div></div></footer>;
}
