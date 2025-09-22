"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Flame,
  Leaf,
  Award,
  AlertTriangle,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface MenuItem {
  name: string;
  description?: string;
  price: number;
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  spicyLevel?: number;
  containsAlcohol?: boolean;
  calories?: number;
  preparationTime?: number;
  ingredients?: string[];
  images?: string[];
  status: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  isNewItem?: boolean;
  tags?: string[];
}

interface MenuCategory {
  name: string;
  description?: string;
  items: MenuItem[];
  isActive: boolean;
  sortOrder?: number;
}

interface MenuSection {
  name: string;
  description?: string;
  categories: MenuCategory[];
  isActive: boolean;
  sortOrder?: number;
}

interface Menu {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  currency: string;
  restaurant: {
    _id: string;
    name: string;
    slug: string;
  };
  sections: MenuSection[];
  isActive: boolean;
}

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");

  const restaurantSlug = params.restaurantSlug as string;
  const menuSlug = params.menuSlug as string;

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);

        // Сначала получаем ресторан по slug
        const restaurantResponse = await fetch(
          `/api/restaurants/slug/${restaurantSlug}`
        );
        if (!restaurantResponse.ok) {
          throw new Error("Restaurant not found");
        }
        const restaurantData = await restaurantResponse.json();

        // Затем получаем меню по slug
        const menuResponse = await fetch(
          `/api/menu/slug/${restaurantData.restaurant._id}/${menuSlug}`
        );
        if (!menuResponse.ok) {
          throw new Error("Menu not found");
        }
        const menuData = await menuResponse.json();
        setMenu(menuData.menu);

        // Устанавливаем первую активную секцию
        const firstActiveSection = menuData.menu.sections.find(
          (section: MenuSection) => section.isActive
        );
        if (firstActiveSection) {
          setActiveSection(firstActiveSection.name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load menu");
      } finally {
        setLoading(false);
      }
    };

    if (restaurantSlug && menuSlug) {
      fetchMenu();
    }
  }, [restaurantSlug, menuSlug]);

  const getDietaryIcons = (item: MenuItem) => {
    const icons = [];
    if (item.isVegan) {
      icons.push(
        <span key="vegan" className="dietary-icon vegan" title="Vegan">
          <Leaf />
        </span>
      );
    } else if (item.isVegetarian) {
      icons.push(
        <span
          key="vegetarian"
          className="dietary-icon vegetarian"
          title="Vegetarian"
        >
          <Leaf />
        </span>
      );
    }
    if (item.isSpicy) {
      icons.push(
        <span
          key="spicy"
          className="dietary-icon spicy"
          title={`Spicy Level ${item.spicyLevel || 1}`}
        >
          <Flame />
        </span>
      );
    }
    if (item.isGlutenFree) {
      icons.push(
        <span
          key="gluten-free"
          className="dietary-icon gluten-free"
          title="Gluten Free"
        >
          <Award />
        </span>
      );
    }
    if (item.containsAlcohol) {
      icons.push(
        <span
          key="alcohol"
          className="dietary-icon alcohol"
          title="Contains Alcohol"
        >
          <AlertTriangle />
        </span>
      );
    }
    return icons;
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price} ${currency}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading menu..." />;
  }

  if (error || !menu) {
    return (
      <div className="menu-error">
        <div className="container">
          <h1>Menu Not Found</h1>
          <p>{error || "The menu you're looking for doesn't exist."}</p>
          <button
            onClick={() => router.push(`/${restaurantSlug}`)}
            className="btn-primary"
          >
            Back to Restaurant
          </button>
        </div>
      </div>
    );
  }

  const activeSections = menu.sections
    .filter((section) => section.isActive)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="menu-page">
      {/* Header */}
      <header className="menu-header">
        <div className="container">
          <button
            className="back-button"
            onClick={() => router.push(`/${restaurantSlug}`)}
          >
            <ArrowLeft size={20} />
            Back to {menu.restaurant.name}
          </button>

          <div className="menu-header__content">
            <h1 className="menu-header__title">{menu.name}</h1>
            {menu.description && (
              <p className="menu-header__description">{menu.description}</p>
            )}
            <div className="menu-header__meta">
              <span className="restaurant-name">{menu.restaurant.name}</span>
              <span className="currency-info">
                All prices in {menu.currency}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {activeSections.length > 1 && (
        <nav className="menu-nav">
          <div className="container">
            <div className="menu-nav__list">
              {activeSections.map((section) => (
                <button
                  key={section.name}
                  className={`menu-nav__item ${
                    activeSection === section.name ? "active" : ""
                  }`}
                  onClick={() => setActiveSection(section.name)}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Menu Content */}
      <main className="menu-content">
        <div className="container">
          {activeSections.map((section) => (
            <section
              key={section.name}
              className={`menu-section ${
                activeSection === section.name ? "active" : ""
              }`}
            >
              <div className="menu-section__header">
                <h2 className="menu-section__title">{section.name}</h2>
                {section.description && (
                  <p className="menu-section__description">
                    {section.description}
                  </p>
                )}
              </div>

              {section.categories
                .filter((category) => category.isActive)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((category) => (
                  <div key={category.name} className="menu-category">
                    <div className="menu-category__header">
                      <h3 className="menu-category__title">{category.name}</h3>
                      {category.description && (
                        <p className="menu-category__description">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="menu-items">
                      {category.items
                        .filter((item) => item.status === "available")
                        .map((item, index) => (
                          <div key={index} className="menu-item">
                            <div className="menu-item__content">
                              <div className="menu-item__header">
                                <h4 className="menu-item__name">
                                  {item.name}
                                  {item.isPopular && (
                                    <span className="item-badge popular">
                                      Popular
                                    </span>
                                  )}
                                  {item.isRecommended && (
                                    <span className="item-badge recommended">
                                      Chef's Choice
                                    </span>
                                  )}
                                  {item.isNewItem && (
                                    <span className="item-badge new">New</span>
                                  )}
                                </h4>
                                <div className="menu-item__price">
                                  {formatPrice(item.price, menu.currency)}
                                </div>
                              </div>

                              {item.description && (
                                <p className="menu-item__description">
                                  {item.description}
                                </p>
                              )}

                              <div className="menu-item__meta">
                                <div className="dietary-icons">
                                  {getDietaryIcons(item)}
                                </div>

                                <div className="item-details">
                                  {item.preparationTime && (
                                    <span className="prep-time">
                                      <Clock size={14} />
                                      {item.preparationTime}min
                                    </span>
                                  )}
                                  {item.calories && (
                                    <span className="calories">
                                      {item.calories} cal
                                    </span>
                                  )}
                                </div>
                              </div>

                              {item.allergens && item.allergens.length > 0 && (
                                <div className="allergens">
                                  <span className="allergens-label">
                                    Contains:
                                  </span>
                                  <span className="allergens-list">
                                    {item.allergens.join(", ")}
                                  </span>
                                </div>
                              )}

                              {item.tags && item.tags.length > 0 && (
                                <div className="item-tags">
                                  {item.tags.map((tag, tagIndex) => (
                                    <span key={tagIndex} className="item-tag">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {item.images && item.images[0] && (
                              <div className="menu-item__image">
                                <img src={item.images[0]} alt={item.name} />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
