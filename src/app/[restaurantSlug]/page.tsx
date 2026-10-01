"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Clock3, MapPin, Phone } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Restaurant = { _id: string; name: string; slug: string; description?: string; address?: { street?: string; city?: string; country?: string }; contact?: { phone?: string; email?: string; website?: string }; cuisineType?: string[]; workingHours?: Array<{ day: string; open: string; close: string; isClosed: boolean }>; images?: string[]; status: string };
type Menu = { _id: string; name: string; slug: string; description?: string; currency: string; isActive: boolean };

export default function RestaurantPage() {
  const slug = useParams().restaurantSlug as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const response = await fetch(`/api/restaurants/slug/${slug}`);
        if (!response.ok) throw new Error("This restaurant could not be found.");
        const data = await response.json();
        if (data.restaurant.status !== "active") throw new Error("This restaurant is not currently available.");
        setRestaurant(data.restaurant);
        const menuResponse = await fetch(`/api/menu?restaurant=${data.restaurant._id}`);
        if (menuResponse.ok) { const result = await menuResponse.json(); setMenus((result.menus || []).filter((menu: Menu) => menu.isActive)); }
      } catch (err) { setError(err instanceof Error ? err.message : "Could not load restaurant."); }
      finally { setLoading(false); }
    })();
  }, [slug]);
  if (loading) return <LoadingSpinner fullScreen text="Loading restaurant..." />;
  if (error || !restaurant) return <div className="venue-page__error"><h1>Restaurant unavailable</h1><p>{error}</p><Link href="/">Back to FoodMenu</Link></div>;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const hours = restaurant.workingHours?.find((item) => item.day.toLowerCase() === today);
  const address = [restaurant.address?.street, restaurant.address?.city].filter(Boolean).join(", ");
  const hero = restaurant.images?.[0] || "/img/editorial/bistro-table.webp";
  const menuImages = ["/img/editorial/vegetables.webp", "/img/editorial/tart.webp", "/img/editorial/wine-board.webp", "/img/editorial/pizza.webp"];
  return <main className="venue-page"><header className="venue-page__top"><div className="container"><Link href="/" className="venue-page__brand">food<span>menu</span></Link><span>THE RESTAURANT COLLECTION</span></div></header><section className="venue-page__hero"><div className="venue-page__hero-image"><Image src={hero} alt={`${restaurant.name} restaurant`} fill priority sizes="(max-width: 900px) 100vw, 55vw" /></div><div className="venue-page__hero-copy"><div><Link href="/" className="venue-page__back"><ArrowLeft size={16} /> Back to FoodMenu</Link><span className="venue-page__eyebrow">A PLACE TO DISCOVER</span><h1>{restaurant.name}</h1><p>{restaurant.description || "Explore our menus, made with care for every visit."}</p><div className="venue-page__tags">{restaurant.cuisineType?.map((item) => <span key={item}>{item}</span>)}</div><a className="venue-page__explore" href="#menus">Explore the menus <span aria-hidden="true">↓</span></a></div><span className="venue-page__hero-index">FOODMENU / RESTAURANT</span></div></section><section className="venue-page__intro container"><div><span className="venue-page__eyebrow">WELCOME IN</span><h2>A menu for <em>every moment.</em></h2></div><p>Choose a collection below to discover the dishes and drinks that are on the table today.</p></section><section className="venue-page__menus" id="menus"><div className="container"><div className="venue-page__section-heading"><span className="venue-page__eyebrow">THE COLLECTION</span><h2>Explore our menus</h2><span>{String(menus.length).padStart(2, "0")} menus</span></div>{menus.length ? <div className="venue-page__menu-grid">{menus.map((menu, index) => <Link href={`/${slug}/${menu.slug}`} className="venue-page__menu-card" key={menu._id}><div className="venue-page__menu-image"><Image src={menuImages[index % menuImages.length]} alt="Restaurant menu photography" fill sizes="(max-width: 750px) 100vw, 45vw" /></div><div className="venue-page__menu-copy"><span>{String(index + 1).padStart(2, "0")} / {menu.currency}</span><h3>{menu.name}</h3><p>{menu.description || "A selection to enjoy at your own pace."}</p><strong>View menu <ArrowUpRight size={18} /></strong></div></Link>)}</div> : <p className="venue-page__empty">Menus will be available here soon.</p>}</div></section><section className="venue-page__visit"><div className="container venue-page__visit-inner"><div><span className="venue-page__eyebrow">FIND US</span><h2>We look forward <em>to seeing you.</em></h2></div><div className="venue-page__visit-details">{address && <p><MapPin size={20} /> {address}</p>}{hours && <p><Clock3 size={20} /> {hours.isClosed ? "Closed today" : `Today ${hours.open}–${hours.close}`}</p>}{restaurant.contact?.phone && <a href={`tel:${restaurant.contact.phone}`}><Phone size={20} /> {restaurant.contact.phone}</a>}</div></div></section><footer className="venue-page__footer"><div className="container"><Link href="/" className="venue-page__brand">food<span>menu</span></Link><span>© {new Date().getFullYear()} {restaurant.name}</span></div></footer></main>;
}
