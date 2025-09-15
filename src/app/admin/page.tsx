"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Restaurant {
  _id: string;
  name: string;
  owner: string;
  status: string;
  cuisineType: string[];
  createdAt: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "ADMIN") {
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
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading admin dashboard..." fullScreen />;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-dashboard__header">
        <div className="container">
          <div className="admin-dashboard__header-content">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="admin-dashboard__header-actions">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-dashboard__nav">
        <div className="container">
          <div className="admin-dashboard__nav-tabs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`admin-dashboard__nav-tab ${
                activeTab === "overview"
                  ? "admin-dashboard__nav-tab--active"
                  : ""
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`admin-dashboard__nav-tab ${
                activeTab === "restaurants"
                  ? "admin-dashboard__nav-tab--active"
                  : ""
              }`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`admin-dashboard__nav-tab ${
                activeTab === "users" ? "admin-dashboard__nav-tab--active" : ""
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="admin-dashboard__content">
        <div className="container">
          {activeTab === "overview" && (
            <div className="admin-dashboard__stats">
              {/* Stats Cards */}
              <div className="admin-dashboard__stat-card">
                <div className="admin-dashboard__stat-card-header">
                  <div className="admin-dashboard__stat-card-icon admin-dashboard__stat-card-icon--restaurants">
                    R
                  </div>
                  <div className="admin-dashboard__stat-card-content">
                    <dt>Total Restaurants</dt>
                    <dd>{restaurants.length}</dd>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard__stat-card">
                <div className="admin-dashboard__stat-card-header">
                  <div className="admin-dashboard__stat-card-icon admin-dashboard__stat-card-icon--active">
                    A
                  </div>
                  <div className="admin-dashboard__stat-card-content">
                    <dt>Active Restaurants</dt>
                    <dd>
                      {restaurants.filter((r) => r.status === "ACTIVE").length}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard__stat-card">
                <div className="admin-dashboard__stat-card-header">
                  <div className="admin-dashboard__stat-card-icon admin-dashboard__stat-card-icon--pending">
                    P
                  </div>
                  <div className="admin-dashboard__stat-card-content">
                    <dt>Pending Approval</dt>
                    <dd>
                      {restaurants.filter((r) => r.status === "PENDING").length}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "restaurants" && (
            <div className="admin-dashboard__section">
              <div className="admin-dashboard__section-header">
                <h3>Restaurant Management</h3>
                <p>Manage all restaurants in the platform</p>
              </div>
              <div className="admin-dashboard__section-content">
                <div className="admin-dashboard__restaurant-list">
                  {restaurants.map((restaurant) => (
                    <div key={restaurant._id} className="restaurant-item">
                      <div className="restaurant-item-content">
                        <div className="restaurant-item-info">
                          <div className="restaurant-item-avatar">
                            {restaurant.name.charAt(0)}
                          </div>
                          <div className="restaurant-item-details">
                            <h4>{restaurant.name}</h4>
                            <p>{restaurant.cuisineType.join(", ")}</p>
                          </div>
                        </div>
                        <div className="restaurant-item-actions">
                          <span
                            className={`restaurant-item-status restaurant-item-status--${restaurant.status.toLowerCase()}`}
                          >
                            {restaurant.status}
                          </span>
                          <button className="restaurant-item-button">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="admin-dashboard__section">
              <div className="admin-dashboard__section-header">
                <h3>User Management</h3>
                <p>Manage platform users and their permissions</p>
              </div>
              <div className="admin-dashboard__section-content">
                <div className="admin-dashboard__empty">
                  <p>User management features coming soon...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
