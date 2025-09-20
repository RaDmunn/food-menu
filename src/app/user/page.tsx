"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RestaurantForm, {
  RestaurantFormData,
} from "@/components/restaurant/RestaurantForm";
import CreateMenuForm, { MenuFormData } from "@/components/menu/CreateMenuForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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

interface Menu {
  _id: string;
  name: string;
  description: string;
  currency: string;
  isActive: boolean;
  restaurant: {
    _id: string;
    name: string;
  };
  categories: any[];
  createdAt: string;
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
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("restaurants");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateMenuForm, setShowCreateMenuForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
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
    loadMenus();
  }, [router]);

  const loadRestaurants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/restaurants?my=true", {
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
      } else {
        console.error("Failed to load restaurants:", response.status);
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (restaurantData: RestaurantFormData) => {
    try {
      const token = localStorage.getItem("token");

      // Если редактируем ресторан, используем PUT запрос
      const isEditing = !!editingRestaurant;
      const url = isEditing
        ? `/api/restaurants/${editingRestaurant._id}`
        : "/api/restaurants";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(restaurantData),
      });

      if (response.ok) {
        const data = await response.json();

        if (editingRestaurant) {
          // Если редактируем, обновляем существующий ресторан в списке
          setRestaurants((prev) =>
            prev.map((r) =>
              r._id === editingRestaurant._id ? data.restaurant : r
            )
          );
        } else {
          // Если создаем новый, добавляем в список
          setRestaurants((prev) => [...prev, data.restaurant]);
        }

        setShowCreateForm(false);
        setEditingRestaurant(null);

        // Show success message or redirect
        console.log(
          `Restaurant ${
            editingRestaurant ? "updated" : "created"
          } successfully:`,
          data.restaurant
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create restaurant");
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      // You might want to show an error toast here
      alert("Failed to create restaurant. Please try again.");
    }
  };

  const loadMenus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/menu?my=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMenus(data.menus || []);
      }
    } catch (error) {
      console.error("Error loading menus:", error);
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

  const handleCreateMenu = async (
    menuData: MenuFormData & { restaurantId: string }
  ) => {
    try {
      const token = localStorage.getItem("token");

      console.log("Menu data being sent:", menuData);

      // Если редактируем меню, используем PUT запрос
      const isEditing = !!editingMenu;
      const url = isEditing
        ? `/api/menu/${editingMenu._id}`
        : "/api/menu/create";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(menuData),
      });

      if (response.ok) {
        const data = await response.json();

        if (isEditing) {
          // Если редактируем, обновляем существующее меню в списке
          setMenus((prev) =>
            prev.map((m) => (m._id === editingMenu._id ? data.menu : m))
          );
          console.log("Menu updated successfully:", data.menu);
        } else {
          // Если создаем новое, добавляем в список
          setMenus((prev) => [...prev, data.menu]);
          console.log("Menu created successfully:", data.menu);
        }

        setShowCreateMenuForm(false);
        setEditingMenu(null);

        // Show success message (optional)
        // You could add a toast notification here instead of redirect
      } else {
        const errorData = await response.json();
        alert(
          errorData.error || `Failed to ${isEditing ? "update" : "create"} menu`
        );
      }
    } catch (error) {
      console.error(
        `Error ${editingMenu ? "updating" : "creating"} menu:`,
        error
      );
      alert(
        `Failed to ${editingMenu ? "update" : "create"} menu. Please try again.`
      );
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
      <LoadingSpinner size="large" text="Loading dashboard..." fullScreen />
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
                activeTab === "restaurants"
                  ? "user-dashboard__nav-tab--active"
                  : ""
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
                activeTab === "settings"
                  ? "user-dashboard__nav-tab--active"
                  : ""
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
                {!showCreateForm && restaurants.length > 0 && (
                  <button
                    className="add-btn"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Add New Restaurant
                  </button>
                )}
              </div>

              {restaurants.length === 0 ? (
                <div className="user-dashboard__empty">
                  <div className="user-dashboard__empty-icon">R</div>
                  <h3>No restaurants yet</h3>
                  <p>Get started by adding your first restaurant</p>
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
                        <div className="user-dashboard__restaurant-card-info-footer">
                          <span
                            className={`user-dashboard__restaurant-card-status user-dashboard__restaurant-card-status--${restaurant.status.toLowerCase()}`}
                          >
                            {restaurant.status}
                          </span>
                          <span className="user-dashboard__restaurant-card-location">
                            {restaurant.address.city},{" "}
                            {restaurant.address.country}
                          </span>
                        </div>
                        <button
                          className="user-dashboard__restaurant-card-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRestaurant(restaurant);
                            setShowCreateForm(true);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Restaurant Creation Form */}
              {(restaurants.length === 0 || showCreateForm) && (
                <div className="user-dashboard__create-form">
                  <div className="user-dashboard__section-header">
                    <div>
                      <h2>
                        {editingRestaurant
                          ? `Edit ${editingRestaurant.name}`
                          : restaurants.length === 0
                          ? "Create Your First Restaurant"
                          : "Add New Restaurant"}
                      </h2>
                      <p>
                        {editingRestaurant
                          ? "Update your restaurant details below"
                          : `Fill in the details below to ${
                              restaurants.length === 0
                                ? "get started"
                                : "add another restaurant"
                            }`}
                      </p>
                    </div>
                    {showCreateForm && restaurants.length > 0 && (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingRestaurant(null);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <RestaurantForm
                    onSubmit={handleCreateRestaurant}
                    loading={loading}
                    isEditing={!!editingRestaurant}
                    initialData={
                      editingRestaurant
                        ? {
                            name: editingRestaurant.name,
                            description: editingRestaurant.description || "",
                            cuisineType: editingRestaurant.cuisineType as any[],
                            address: {
                              street: editingRestaurant.address.street,
                              city: editingRestaurant.address.city,
                              state:
                                (editingRestaurant.address as any).state || "",
                              zipCode:
                                (editingRestaurant.address as any).zipCode ||
                                "",
                              country: editingRestaurant.address.country,
                            },
                            contact: {
                              phone:
                                (editingRestaurant as any).contact?.phone || "",
                              email:
                                (editingRestaurant as any).contact?.email || "",
                              website:
                                (editingRestaurant as any).contact?.website ||
                                "",
                              socialMedia: {
                                instagram:
                                  (editingRestaurant as any).contact
                                    ?.socialMedia?.instagram || "",
                                facebook:
                                  (editingRestaurant as any).contact
                                    ?.socialMedia?.facebook || "",
                                twitter:
                                  (editingRestaurant as any).contact
                                    ?.socialMedia?.twitter || "",
                              },
                            },
                            workingHours: (editingRestaurant as any)
                              .workingHours || [
                              {
                                day: "monday",
                                open: "09:00",
                                close: "22:00",
                                isClosed: false,
                              },
                              {
                                day: "tuesday",
                                open: "09:00",
                                close: "22:00",
                                isClosed: false,
                              },
                              {
                                day: "wednesday",
                                open: "09:00",
                                close: "22:00",
                                isClosed: false,
                              },
                              {
                                day: "thursday",
                                open: "09:00",
                                close: "22:00",
                                isClosed: false,
                              },
                              {
                                day: "friday",
                                open: "09:00",
                                close: "22:00",
                                isClosed: false,
                              },
                              {
                                day: "saturday",
                                open: "09:00",
                                close: "22:00",
                                isClosed: false,
                              },
                              {
                                day: "sunday",
                                open: "09:00",
                                close: "22:00",
                                isClosed: true,
                              },
                            ],
                            features: (editingRestaurant as any).features || [],
                            priceRange: {
                              min:
                                (editingRestaurant as any).priceRange?.min ||
                                10,
                              max:
                                (editingRestaurant as any).priceRange?.max ||
                                50,
                              currency:
                                (editingRestaurant as any).priceRange
                                  ?.currency || "EUR",
                            },
                          }
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "menu" && (
            <div>
              <div className="user-dashboard__section-header">
                <div>
                  <h2>Menu Management</h2>
                  <p>Manage all your restaurant menus</p>
                </div>
                {!showCreateMenuForm && (
                  <button
                    className="add-btn"
                    onClick={() => {
                      setEditingMenu(null);
                      setShowCreateMenuForm(true);
                    }}
                  >
                    Create New Menu
                  </button>
                )}
              </div>

              {/* Menus List */}
              {menus.length === 0 ? (
                <div className="user-dashboard__empty">
                  <div className="user-dashboard__empty-icon">📋</div>
                  <h3>No menus yet</h3>
                  <p>
                    Create your first menu to start adding categories and items
                  </p>
                  <button
                    className="add-btn"
                    onClick={() => setShowCreateMenuForm(true)}
                  >
                    Create First Menu
                  </button>
                </div>
              ) : (
                <div className="user-dashboard__menu-grid">
                  {menus.map((menu) => (
                    <div key={menu._id} className="user-dashboard__menu-card">
                      <div
                        className="user-dashboard__menu-card-content"
                        onClick={() => router.push(`/menu/${menu._id}`)}
                      >
                        <div className="user-dashboard__menu-card-header">
                          <h3>{menu.name}</h3>
                          <span
                            className={`menu-status ${
                              menu.isActive ? "active" : "inactive"
                            }`}
                          >
                            {menu.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p>{menu.description || "No description"}</p>
                        <div className="user-dashboard__menu-card-footer">
                          <span className="item-count">
                            {menu.categories?.length || 0} categories
                          </span>
                          <span className="currency">{menu.currency}</span>
                          <span className="restaurant-name">
                            {menu.restaurant.name}
                          </span>
                        </div>
                      </div>
                      <button
                        className="user-dashboard__menu-card-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMenu(menu);
                          setShowCreateMenuForm(true);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Menu Creation Form */}
              {showCreateMenuForm && (
                <div className="user-dashboard__create-form">
                  <div className="user-dashboard__section-header">
                    <div>
                      <h2>
                        {editingMenu
                          ? `Edit ${editingMenu.name || "Menu"}`
                          : "Create New Menu"}
                      </h2>
                      <p>
                        {editingMenu
                          ? "Update your menu details below"
                          : "Fill in the details below to create a new menu"}
                      </p>
                    </div>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setShowCreateMenuForm(false);
                        setEditingMenu(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <CreateMenuForm
                    restaurants={restaurants}
                    selectedRestaurantId={selectedRestaurant?._id}
                    editingMenu={editingMenu}
                    onSubmit={handleCreateMenu}
                    onCancel={() => {
                      setShowCreateMenuForm(false);
                      setEditingMenu(null);
                    }}
                    loading={loading}
                  />
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
                  <input type="text" value={user?.name || ""} disabled />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user?.email || ""} disabled />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value="Restaurant Owner" disabled />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
