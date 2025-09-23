"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RestaurantManagement from "@/components/admin/RestaurantManagement";
import UserManagement from "@/components/admin/UserManagement";
import AdminOverview from "@/components/admin/AdminOverview";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
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
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  if (loading) {
    return (
      <LoadingSpinner
        size="large"
        text="Loading admin dashboard..."
        fullScreen
      />
    );
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
              Restaurant Management
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
          {activeTab === "overview" && <AdminOverview />}

          {activeTab === "restaurants" && <RestaurantManagement />}

          {activeTab === "users" && <UserManagement />}
        </div>
      </div>
    </div>
  );
}
