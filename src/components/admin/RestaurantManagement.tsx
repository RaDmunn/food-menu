"use client";

import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, Clock, MapPin } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CustomSelect from "@/components/ui/CustomSelect";

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  cuisineType: string[];
  status: "pending" | "active" | "inactive" | "suspended";
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export default function RestaurantManagement() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    let filtered = restaurants;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.owner.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          restaurant.owner.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          restaurant.address.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (restaurant) => restaurant.status === statusFilter
      );
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, statusFilter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/restaurants", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      const data = await response.json();
      setRestaurants(data.restaurants || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load restaurants"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurantStatus = async (
    restaurantId: string,
    newStatus: Restaurant["status"]
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/restaurants/${restaurantId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update restaurant status");
      }

      // Update local state
      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant._id === restaurantId
            ? { ...restaurant, status: newStatus }
            : restaurant
        )
      );

      // Update selected restaurant if it's the one being updated
      if (selectedRestaurant?._id === restaurantId) {
        setSelectedRestaurant((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const getStatusIcon = (status: Restaurant["status"]) => {
    switch (status) {
      case "active":
        return (
          <CheckCircle className="status-icon status-icon--active" size={16} />
        );
      case "pending":
        return <Clock className="status-icon status-icon--pending" size={16} />;
      case "inactive":
        return (
          <XCircle className="status-icon status-icon--inactive" size={16} />
        );
      case "suspended":
        return (
          <XCircle className="status-icon status-icon--suspended" size={16} />
        );
      default:
        return <Clock className="status-icon" size={16} />;
    }
  };

  const getStatusText = (status: Restaurant["status"]) => {
    switch (status) {
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "inactive":
        return "Inactive";
      case "suspended":
        return "Suspended";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading restaurants..." />;
  }

  if (error) {
    return (
      <div className="restaurant-management__error">
        <h2>Error Loading Restaurants</h2>
        <p>{error}</p>
        <button onClick={fetchRestaurants} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="restaurant-management">
      <div className="restaurant-management__header">
        <h1>Restaurant Management</h1>
        <p>Manage restaurant applications and status</p>
      </div>

      {/* Filters */}
      <div className="restaurant-management__filters">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search restaurants, owners, or cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "suspended", label: "Suspended" },
          ]}
          placeholder="Filter by status"
        />
      </div>

      {/* Statistics */}
      <div className="restaurant-management__stats">
        <div className="stat-card">
          <div className="stat-card__value">{restaurants.length}</div>
          <div className="stat-card__label">Total Restaurants</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">
            {restaurants.filter((r) => r.status === "pending").length}
          </div>
          <div className="stat-card__label">Pending Approval</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">
            {restaurants.filter((r) => r.status === "active").length}
          </div>
          <div className="stat-card__label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">
            {restaurants.filter((r) => r.status === "inactive").length}
          </div>
          <div className="stat-card__label">Inactive</div>
        </div>
      </div>

      {/* Results */}
      <div className="restaurant-management__results">
        <div className="results-header">
          <h2>
            {filteredRestaurants.length} Restaurant
            {filteredRestaurants.length !== 1 ? "s" : ""} Found
          </h2>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="no-results">
            <Search size={48} />
            <h3>No restaurants found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="restaurants-table">
            <table>
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Owner</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant._id}>
                    <td>
                      <div className="restaurant-info">
                        <div className="restaurant-avatar">
                          {restaurant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="restaurant-name">
                            {restaurant.name}
                          </div>
                          <div className="restaurant-cuisine">
                            {restaurant.cuisineType.slice(0, 2).join(", ")}
                            {restaurant.cuisineType.length > 2 &&
                              ` +${restaurant.cuisineType.length - 2}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="owner-info">
                        <div className="owner-name">
                          {restaurant.owner.name}
                        </div>
                        <div className="owner-email">
                          {restaurant.owner.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="location-info">
                        <MapPin size={14} />
                        <span>
                          {restaurant.address.city},{" "}
                          {restaurant.address.country}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`status-badge status-badge--${restaurant.status}`}
                      >
                        {getStatusIcon(restaurant.status)}
                        <span>{getStatusText(restaurant.status)}</span>
                      </div>
                    </td>
                    <td>{formatDate(restaurant.createdAt)}</td>
                    <td>
                      <div className="actions">
                        <button
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setShowDetails(true);
                          }}
                          className="action-btn action-btn--view"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {restaurant.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateRestaurantStatus(restaurant._id, "active")
                              }
                              className="action-btn action-btn--approve"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() =>
                                updateRestaurantStatus(
                                  restaurant._id,
                                  "inactive"
                                )
                              }
                              className="action-btn action-btn--reject"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {restaurant.status === "active" && (
                          <button
                            onClick={() =>
                              updateRestaurantStatus(
                                restaurant._id,
                                "suspended"
                              )
                            }
                            className="action-btn action-btn--suspend"
                            title="Suspend"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        {(restaurant.status === "inactive" ||
                          restaurant.status === "suspended") && (
                          <button
                            onClick={() =>
                              updateRestaurantStatus(restaurant._id, "active")
                            }
                            className="action-btn action-btn--activate"
                            title="Activate"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restaurant Details Modal */}
      {showDetails && selectedRestaurant && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRestaurant.name}</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedRestaurant.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Slug:</label>
                    <span>{selectedRestaurant.slug}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <div
                      className={`status-badge status-badge--${selectedRestaurant.status}`}
                    >
                      {getStatusIcon(selectedRestaurant.status)}
                      <span>{getStatusText(selectedRestaurant.status)}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Cuisine Types:</label>
                    <span>{selectedRestaurant.cuisineType.join(", ")}</span>
                  </div>
                </div>

                {selectedRestaurant.description && (
                  <div className="detail-item">
                    <label>Description:</label>
                    <p>{selectedRestaurant.description}</p>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Owner Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedRestaurant.owner.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedRestaurant.owner.email}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Address</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Street:</label>
                    <span>{selectedRestaurant.address.street}</span>
                  </div>
                  <div className="detail-item">
                    <label>City:</label>
                    <span>{selectedRestaurant.address.city}</span>
                  </div>
                  {selectedRestaurant.address.state && (
                    <div className="detail-item">
                      <label>State:</label>
                      <span>{selectedRestaurant.address.state}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Country:</label>
                    <span>{selectedRestaurant.address.country}</span>
                  </div>
                  {selectedRestaurant.address.zipCode && (
                    <div className="detail-item">
                      <label>ZIP Code:</label>
                      <span>{selectedRestaurant.address.zipCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-grid">
                  {selectedRestaurant.contact.phone && (
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedRestaurant.contact.phone}</span>
                    </div>
                  )}
                  {selectedRestaurant.contact.email && (
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedRestaurant.contact.email}</span>
                    </div>
                  )}
                  {selectedRestaurant.contact.website && (
                    <div className="detail-item">
                      <label>Website:</label>
                      <a
                        href={selectedRestaurant.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {selectedRestaurant.contact.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Dates</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedRestaurant.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{formatDate(selectedRestaurant.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
