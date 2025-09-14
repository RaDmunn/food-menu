"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  restaurants?: string[];
}

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  status: string;
  cuisineType: string[];
  address: {
    street: string;
    city: string;
    country: string;
  };
}

interface MenuCategory {
  name: string;
  description: string;
  itemCount: number;
  sortOrder: number;
}

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("restaurants");
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is restaurant owner
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "RESTAURANT_OWNER") {
      router.push("/auth");
      return;
    }

    setUser(parsedUser);
    loadRestaurants();
  }, [router]);

  const loadRestaurants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/restaurants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.restaurants || []);
        if (data.restaurants && data.restaurants.length > 0) {
          setSelectedRestaurant(data.restaurants[0]);
          loadMenuCategories(data.restaurants[0]._id);
        }
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuCategories = async (restaurantId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/menu/categories?restaurant=${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMenuCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error loading menu categories:", error);
    }
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    loadMenuCategories(restaurant._id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Header */}
      <header className="user-dashboard__header">
        <div className="container">
          <div className="user-dashboard__header-content">
            <h1>Restaurant Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="user-dashboard__header-actions">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="user-dashboard__nav">
        <div className="container">
          <div className="user-dashboard__nav-tabs">
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`user-dashboard__nav-tab ${
                activeTab === "restaurants" ? "user-dashboard__nav-tab--active" : ""
              }`}
            >
              My Restaurants
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`user-dashboard__nav-tab ${
                activeTab === "menu" ? "user-dashboard__nav-tab--active" : ""
              }`}
              disabled={!selectedRestaurant}
            >
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`user-dashboard__nav-tab ${
                activeTab === "settings" ? "user-dashboard__nav-tab--active" : ""
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="user-dashboard__content">
        <div className="container">
          {activeTab === "restaurants" && (
            <div>
              <div className="user-dashboard__section-header">
                <div>
                  <h2>Your Restaurants</h2>
                  <p>Manage your restaurant locations and details</p>
                </div>
                <button className="add-btn">
                  Add New Restaurant
                </button>
              </div>

              {restaurants.length === 0 ? (
                <div className="user-dashboard__empty">
                  <div className="user-dashboard__empty-icon">
                    R
                  </div>
                  <h3>No restaurants yet</h3>
                  <p>Get started by adding your first restaurant</p>
                  <button className="add-btn">
                    Add Restaurant
                  </button>
                </div>
              ) : (
                <div className="user-dashboard__restaurant-grid">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant._id}
                      className={`user-dashboard__restaurant-card ${
                        selectedRestaurant?._id === restaurant._id
                          ? "user-dashboard__restaurant-card--selected"
                          : ""
                      }`}
                      onClick={() => handleRestaurantSelect(restaurant)}
                    >
                      <div className="user-dashboard__restaurant-card-header">
                        <div className="user-dashboard__restaurant-card-avatar">
                          {restaurant.name.charAt(0)}
                        </div>
                        <div className="user-dashboard__restaurant-card-info">
                          <h3>{restaurant.name}</h3>
                          <p>{restaurant.cuisineType.join(", ")}</p>
                        </div>
                      </div>
                      <div className="user-dashboard__restaurant-card-content">
                        <p>{restaurant.description}</p>
                      </div>
                      <div className="user-dashboard__restaurant-card-footer">
                        <span
                          className={`user-dashboard__restaurant-card-status user-dashboard__restaurant-card-status--${restaurant.status.toLowerCase()}`}
                        >
                          {restaurant.status}
                        </span>
                        <span className="user-dashboard__restaurant-card-location">
                          {restaurant.address.city}, {restaurant.address.country}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </div>
        )}

          {activeTab === "menu" && selectedRestaurant && (
            <div>
              <div className="user-dashboard__section-header">
                <div>
                  <h2>Menu Management</h2>
                  <p>Managing menu for {selectedRestaurant.name}</p>
                </div>
                <button className="add-btn">
                  Add Category
                </button>
              </div>

              {menuCategories.length === 0 ? (
                <div className="user-dashboard__empty">
                  <div className="user-dashboard__empty-icon">
                    M
                  </div>
                  <h3>No menu categories yet</h3>
                  <p>Start building your menu by adding categories</p>
                  <button className="add-btn">
                    Add First Category
                  </button>
                </div>
              ) : (
                <div className="user-dashboard__menu-grid">
                  {menuCategories.map((category, index) => (
                    <div key={index} className="user-dashboard__menu-card">
                      <h3>{category.name}</h3>
                      <p>{category.description || "No description"}</p>
                      <div className="user-dashboard__menu-card-footer">
                        <span className="item-count">
                          {category.itemCount} items
                        </span>
                        <div className="actions">
                          <button>Edit</button>
                          <button>Add Items</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </div>
        )}

          {activeTab === "settings" && (
            <div className="user-dashboard__settings">
              <div className="user-dashboard__settings-header">
                <h3>Account Settings</h3>
                <p>Manage your account preferences and settings</p>
              </div>
              <div className="user-dashboard__settings-content">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value="Restaurant Owner"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
