import Image from "next/image";
import Link from "next/link";
import Header from "@/components/main-page/Header";
import Footer from "@/components/main-page/Footer";

const chapters = [
  { number: "01", eyebrow: "FOR YOUR RESTAURANT", title: "A menu for every moment.", text: "Create a summer collection, a spring selection or a short special menu. Inside each one, guide guests through food, drinks and the categories that make sense for your kitchen.", image: "/img/editorial/bistro-table.webp", alt: "Seasonal pasta on a restaurant table" },
  { number: "02", eyebrow: "FOR YOUR TEAM", title: "Changes without friction.", text: "Keep venues, menus, categories and dishes in one clear workspace. Adjust availability, details and prices when service calls for it.", image: "/img/editorial/vegetables.webp", alt: "Seasonal roasted vegetables" },
  { number: "03", eyebrow: "FOR YOUR GUESTS", title: "The pleasure is in the details.", text: "Photography, descriptions, allergens and clear prices give every dish the space it deserves. Guests open a shareable menu directly on their phone.", image: "/img/editorial/tart.webp", alt: "Lemon tart and coffee" },
];

export default function FeaturesPage() {
  return <><Header /><main className="editorial-page editorial-page--features"><div className="container editorial-page__intro"><span className="site-eyebrow">The platform</span><h1>From the first scan to <em>the last course.</em></h1><p>A calmer way to present what your restaurant makes — and a clearer way to manage it.</p></div><div className="editorial-features">{chapters.map((chapter) => <section className="editorial-feature" key={chapter.number}><div className="container editorial-feature__inner"><div className="editorial-feature__image"><Image src={chapter.image} alt={chapter.alt} fill sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="editorial-feature__copy"><span className="editorial-page__index">{chapter.number} / {chapter.eyebrow}</span><h2>{chapter.title}</h2><p>{chapter.text}</p><Link href="/contact">Talk to us <span aria-hidden="true">↗</span></Link></div></div></section>)}</div></main><Footer /></>;
}
