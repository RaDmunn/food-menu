"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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
  updatedAt: string;
}

export default function MenuManagementPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params.id as string;

  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
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

    loadMenu();
  }, [menuId, router]);

  const loadMenu = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/menu/${menuId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMenu(data.menu);
      } else if (response.status === 404) {
        setError("Menu not found");
      } else {
        setError("Failed to load menu");
      }
    } catch (error) {
      console.error("Error loading menu:", error);
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading menu..." fullScreen />;
  }

  if (error || !menu) {
    return (
      <div className="menu-management">
        <div className="container">
          <div className="menu-management__error">
            <h2>Error</h2>
            <p>{error || "Menu not found"}</p>
            <button
              className="btn-primary"
              onClick={() => router.push("/user")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-management">
      <div className="container">
        {/* Header */}
        <div className="menu-management__header">
          <div className="menu-management__breadcrumb">
            <button
              className="menu-management__back-btn"
              onClick={() => router.push("/user")}
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="menu-management__title-section">
            <h1>{menu.name}</h1>
            <p className="menu-management__restaurant-name">
              {menu.restaurant.name}
            </p>
            {menu.description && (
              <p className="menu-management__description">{menu.description}</p>
            )}
          </div>

          <div className="menu-management__meta">
            <span
              className={`menu-management__status ${
                menu.isActive ? "active" : "inactive"
              }`}
            >
              {menu.isActive ? "Active" : "Inactive"}
            </span>
            <span className="menu-management__currency">
              Currency: {menu.currency}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="menu-management__content">
          <div className="menu-management__section">
            <div className="menu-management__section-header">
              <h2>Menu Categories</h2>
              <button className="btn-primary">Add Category</button>
            </div>

            {menu.categories.length === 0 ? (
              <div className="menu-management__empty">
                <div className="menu-management__empty-icon">📋</div>
                <h3>No categories yet</h3>
                <p>
                  Start building your menu by adding categories like
                  "Appetizers", "Main Courses", "Desserts", etc.
                </p>
                <button className="btn-primary">Add First Category</button>
              </div>
            ) : (
              <div className="menu-management__categories">
                {menu.categories.map((category, index) => (
                  <div key={index} className="menu-management__category-card">
                    <h3>{category.name}</h3>
                    <p>{category.description || "No description"}</p>
                    <div className="menu-management__category-footer">
                      <span className="item-count">
                        {category.items?.length || 0} items
                      </span>
                      <div className="actions">
                        <button className="btn-secondary">Edit</button>
                        <button className="btn-danger">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
