"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import Header from "@/components/main-page/Header";
import Footer from "@/components/main-page/Footer";

type Restaurant = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  cuisineType?: string[];
  address?: { city?: string };
  images?: string[];
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/restaurants")
      .then(async (response) => {
        if (!response.ok) throw new Error("Restaurants could not be loaded.");
        const data = await response.json();
        setRestaurants((data.restaurants || []).sort((a: Restaurant, b: Restaurant) => Number(a.slug.endsWith("-demo")) - Number(b.slug.endsWith("-demo"))));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Restaurants could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  return <><Header /><main className="restaurant-directory">
    <div className="container restaurant-directory__intro">
      <span className="site-eyebrow">Restaurants on FoodMenu</span>
      <h1>Discover the <em>restaurants.</em></h1>
      <p>Open a restaurant to explore its current menus and dishes.</p>
    </div>
    <div className="container restaurant-directory__content">
      {loading && <p className="restaurant-directory__message">Loading restaurants…</p>}
      {error && <p className="restaurant-directory__message" role="alert">{error}</p>}
      {!loading && !error && !restaurants.length && <p className="restaurant-directory__message">No restaurants are available yet.</p>}
      {!!restaurants.length && <div className="restaurant-directory__grid">{restaurants.map((restaurant) => <Link key={restaurant._id} href={`/${restaurant.slug}`} className="restaurant-directory__card">
        <div className="restaurant-directory__image"><Image src={restaurant.images?.[0] || "/img/editorial/bistro-table.webp"} alt={restaurant.images?.[0] ? restaurant.name : ""} fill sizes="(max-width: 750px) 100vw, 45vw" /></div>
        <div className="restaurant-directory__card-body">
          <div className="restaurant-directory__meta"><span>{restaurant.cuisineType?.slice(0, 2).join(" · ") || "Restaurant"}</span>{restaurant.slug.endsWith("-demo") && <span>Demo</span>}</div>
          <h2>{restaurant.name}</h2>
          {restaurant.description && <p>{restaurant.description}</p>}
          <div className="restaurant-directory__card-bottom">{restaurant.address?.city && <span><MapPin size={15} />{restaurant.address.city}</span>}<strong>View restaurant <ArrowUpRight size={17} /></strong></div>
        </div>
      </Link>)}</div>}
    </div>
  </main><Footer /></>;
}
