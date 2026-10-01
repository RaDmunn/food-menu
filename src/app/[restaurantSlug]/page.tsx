"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Utensils,
  Wifi,
  Car,
  Truck,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  cuisineType: string[];
  workingHours?: Array<{
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }>;
  averageRating?: number;
  totalReviews?: number;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  features?: string[];
  images?: string[];
  status: string;
}

interface Menu {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  currency: string;
  isActive: boolean;
}

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restaurantSlug = params.restaurantSlug as string;

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);

        // Получаем ресторан по slug
        const restaurantResponse = await fetch(
          `/api/restaurants/slug/${restaurantSlug}`
        );
        if (!restaurantResponse.ok) {
          throw new Error("Restaurant not found");
        }
        const restaurantData = await restaurantResponse.json();

        // Проверяем статус ресторана - показываем только активные
        if (restaurantData.restaurant.status !== "active") {
          throw new Error("Restaurant not available");
        }

        setRestaurant(restaurantData.restaurant);

        // Получаем меню ресторана
        const menusResponse = await fetch(
          `/api/menu?restaurant=${restaurantData.restaurant._id}`
        );
        if (menusResponse.ok) {
          const menusData = await menusResponse.json();
          setMenus(menusData.menus || []);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load restaurant"
        );
      } finally {
        setLoading(false);
      }
    };

    if (restaurantSlug) {
      fetchRestaurant();
    }
  }, [restaurantSlug]);

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case "wifi":
        return <Wifi size={20} />;
      case "parking":
        return <Car size={20} />;
      case "delivery":
        return <Truck size={20} />;
      default:
        return <Utensils size={20} />;
    }
  };

  const formatWorkingHours = (hours: Restaurant["workingHours"]) => {
    if (!hours || hours.length === 0) return "Hours not specified";

    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const todayHours = hours.find((h) => h.day.toLowerCase() === today);

    if (todayHours?.isClosed) {
      return "Closed today";
    }

    if (todayHours) {
      return `Today: ${todayHours.open} - ${todayHours.close}`;
    }

    return "Hours available";
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading restaurant..." />;
  }

  if (error || !restaurant) {
    return (
      <div className="restaurant-error">
        <div className="container">
          <h1>Restaurant Not Found</h1>
          <p>{error || "The restaurant you're looking for doesn't exist."}</p>
          <button onClick={() => router.push("/")} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-page">
      {/* Hero Section */}
      <section className="restaurant-hero">
        <div className="restaurant-hero__bg">
          {restaurant.images && restaurant.images[0] && (
            <img src={restaurant.images[0]} alt={restaurant.name} />
          )}
        </div>
        <div className="restaurant-hero__content">
          <div className="container">
            <div className="restaurant-hero__info">
              <h1 className="restaurant-hero__title">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="restaurant-hero__description">
                  {restaurant.description}
                </p>
              )}

              <div className="restaurant-hero__meta">
                <div className="restaurant-meta">
                  <div className="restaurant-meta__item">
                    <MapPin size={18} />
                    <span>
                      {restaurant.address.street}, {restaurant.address.city}
                    </span>
                  </div>

                  {restaurant.contact.phone && (
                    <div className="restaurant-meta__item">
                      <Phone size={18} />
                      <span>{restaurant.contact.phone}</span>
                    </div>
                  )}

                  <div className="restaurant-meta__item">
                    <Clock size={18} />
                    <span>{formatWorkingHours(restaurant.workingHours)}</span>
                  </div>

                  {restaurant.averageRating !== undefined && restaurant.averageRating > 0 && (
                    <div className="restaurant-meta__item">
                      <Star size={18} />
                      <span>
                        {restaurant.averageRating.toFixed(1)} (
                        {restaurant.totalReviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="restaurant-hero__cuisine">
                {restaurant.cuisineType.map((cuisine, index) => (
                  <span key={index} className="cuisine-tag">
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Details */}

      {restaurant.features && restaurant.features.length > 0 && (
        <section className="restaurant-details">
          <div className="container">
            <div className="restaurant-details__grid">
              {/* Features */}
              <div className="restaurant-features">
                <h3>Features</h3>
                <div className="features-list">
                  {restaurant.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      {getFeatureIcon(feature)}
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Menus Section */}
      {menus.length > 0 && (
        <section className="restaurant-menus">
          <div className="container">
            <h2 className="section-title">Our Menus</h2>
            <div className="menus-grid">
              {menus
                .filter((menu) => menu.isActive)
                .map((menu) => (
                  <Link
                    key={menu._id}
                    className="menu-card"
                    href={`/${restaurantSlug}/${menu.slug}`}
                  >
                    <div className="menu-card__content">
                      <h3 className="menu-card__title">{menu.name}</h3>
                      {menu.description && (
                        <p className="menu-card__description">
                          {menu.description}
                        </p>
                      )}
                      <div className="menu-card__footer">
                        <span className="menu-card__currency">
                          Prices in {menu.currency}
                        </span>
                        <span className="menu-card__cta">View Menu →</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
