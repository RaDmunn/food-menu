"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Restaurant = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  address?: { street?: string; city?: string; country?: string };
  contact?: { phone?: string; email?: string; website?: string };
  cuisineType?: string[];
  workingHours?: Array<{ day: string; open: string; close: string; isClosed: boolean }>;
  images?: string[];
  status: string;
};
type Menu = { _id: string; name: string; slug: string; description?: string; coverImage?: string; isActive: boolean };

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
        if (menuResponse.ok) {
          const result = await menuResponse.json();
          setMenus((result.menus || []).filter((menu: Menu) => menu.isActive));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load restaurant.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <LoadingSpinner fullScreen text="Loading restaurant..." />;
  if (error || !restaurant) return <div className="venue-page__error"><h1>Restaurant unavailable</h1><p>{error}</p></div>;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const hours = restaurant.workingHours?.find((item) => item.day.toLowerCase() === today);
  const address = [restaurant.address?.street, restaurant.address?.city, restaurant.address?.country].filter(Boolean).join(", ");
  const hero = restaurant.images?.[0];
  const hasVisitDetails = Boolean(address || hours || restaurant.contact?.phone || restaurant.contact?.email || restaurant.contact?.website);

  return <main className="venue-page">
    <section className="venue-page__hero">
      <div className="venue-page__hero-image">{hero && <Image src={hero} alt={restaurant.name} fill priority sizes="(max-width: 900px) 100vw, 55vw" />}</div>
      <div className="venue-page__hero-copy">
        <div>
          <h1>{restaurant.name}</h1>
          {!!restaurant.cuisineType?.length && <div className="venue-page__tags">{restaurant.cuisineType.map((item) => <span key={item}>{item}</span>)}</div>}
          {!!menus.length && <a className="venue-page__explore" href="#menus">View menus <span aria-hidden="true">↓</span></a>}
        </div>
      </div>
    </section>

    {restaurant.description && <section className="venue-page__intro container"><p>{restaurant.description}</p></section>}

    <section className="venue-page__menus" id="menus">
      <div className="container">
        <div className="venue-page__section-heading"><h2>Menus</h2><span>{String(menus.length).padStart(2, "0")} menus</span></div>
        {menus.length ? <div className="venue-page__menu-grid">{menus.map((menu) => <Link href={`/${slug}/${menu.slug}`} className="venue-page__menu-card" key={menu._id}>
          <div className="venue-page__menu-image">{(menu.coverImage || hero) && <Image src={menu.coverImage || hero!} alt={menu.name} fill sizes="(max-width: 750px) 100vw, 45vw" />}</div>
          <div className="venue-page__menu-copy"><h3>{menu.name}</h3>{menu.description && <p>{menu.description}</p>}<strong>View menu <ArrowUpRight size={18} /></strong></div>
        </Link>)}</div> : <p className="venue-page__empty">No menus are available.</p>}
      </div>
    </section>

    {hasVisitDetails && <section className="venue-page__visit"><div className="container venue-page__visit-inner">
      <h2>{restaurant.name}</h2>
      <div className="venue-page__visit-details">
        {address && <p><MapPin size={20} /> {address}</p>}
        {hours && <p><Clock3 size={20} /> {hours.isClosed ? "Closed today" : `Today ${hours.open}–${hours.close}`}</p>}
        {restaurant.contact?.phone && <a href={`tel:${restaurant.contact.phone}`}><Phone size={20} /> {restaurant.contact.phone}</a>}
        {restaurant.contact?.email && <a href={`mailto:${restaurant.contact.email}`}><Mail size={20} /> {restaurant.contact.email}</a>}
        {restaurant.contact?.website && <a href={restaurant.contact.website} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={20} /> {restaurant.contact.website}</a>}
      </div>
    </div></section>}
    <footer className="venue-page__footer"><div className="container"><span>{restaurant.name}</span></div></footer>
  </main>;
}
