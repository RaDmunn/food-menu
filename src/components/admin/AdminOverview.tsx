"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Store,
  Menu,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Activity,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface OverviewStats {
  users: {
    total: number;
    active: number;
    admins: number;
    owners: number;
    newThisMonth: number;
  };
  restaurants: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    newThisMonth: number;
  };
  menus: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  recentActivity: {
    newUsers: any[];
    newRestaurants: any[];
    pendingApprovals: any[];
  };
}

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch overview stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load overview");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading overview..." />;
  }

  if (error) {
    return (
      <div className="admin-overview__error">
        <h2>Error Loading Overview</h2>
        <p>{error}</p>
        <button onClick={fetchOverviewStats} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div>No data available</div>;
  }

  return (
    <div className="admin-overview">
      <div className="admin-overview__header">
        <h1>Dashboard Overview</h1>
        <p>Platform statistics and recent activity</p>
      </div>

      {/* Main Stats Grid */}
      <div className="admin-overview__main-stats">
        {/* Users Stats */}
        <div className="stat-card stat-card--users">
          <div className="stat-card__header">
            <div className="stat-card__icon">
              <Users size={24} />
            </div>
            <div className="stat-card__title">Users</div>
          </div>
          <div className="stat-card__content">
            <div className="stat-card__main-number">{stats.users.total}</div>
            <div className="stat-card__subtitle">Total Users</div>
            <div className="stat-card__details">
              <div className="stat-detail">
                <CheckCircle size={16} />
                <span>{stats.users.active} Active</span>
              </div>
              <div className="stat-detail">
                <TrendingUp size={16} />
                <span>+{stats.users.newThisMonth} this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurants Stats */}
        <div className="stat-card stat-card--restaurants">
          <div className="stat-card__header">
            <div className="stat-card__icon">
              <Store size={24} />
            </div>
            <div className="stat-card__title">Restaurants</div>
          </div>
          <div className="stat-card__content">
            <div className="stat-card__main-number">
              {stats.restaurants.total}
            </div>
            <div className="stat-card__subtitle">Total Restaurants</div>
            <div className="stat-card__details">
              <div className="stat-detail">
                <CheckCircle size={16} />
                <span>{stats.restaurants.active} Active</span>
              </div>
              <div className="stat-detail">
                <Clock size={16} />
                <span>{stats.restaurants.pending} Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menus Stats */}
        <div className="stat-card stat-card--menus">
          <div className="stat-card__header">
            <div className="stat-card__icon">
              <Menu size={24} />
            </div>
            <div className="stat-card__title">Menus</div>
          </div>
          <div className="stat-card__content">
            <div className="stat-card__main-number">{stats.menus.total}</div>
            <div className="stat-card__subtitle">Total Menus</div>
            <div className="stat-card__details">
              <div className="stat-detail">
                <CheckCircle size={16} />
                <span>{stats.menus.active} Active</span>
              </div>
              <div className="stat-detail">
                <TrendingUp size={16} />
                <span>+{stats.menus.newThisMonth} this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="stat-card stat-card--pending">
          <div className="stat-card__header">
            <div className="stat-card__icon">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-card__title">Pending</div>
          </div>
          <div className="stat-card__content">
            <div className="stat-card__main-number">
              {stats.restaurants.pending}
            </div>
            <div className="stat-card__subtitle">Awaiting Approval</div>
            <div className="stat-card__details">
              <div className="stat-detail">
                <Clock size={16} />
                <span>Restaurants to review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="admin-overview__secondary-stats">
        <div className="secondary-stat">
          <div className="secondary-stat__label">Administrators</div>
          <div className="secondary-stat__value">{stats.users.admins}</div>
        </div>
        <div className="secondary-stat">
          <div className="secondary-stat__label">Restaurant Owners</div>
          <div className="secondary-stat__value">{stats.users.owners}</div>
        </div>
        <div className="secondary-stat">
          <div className="secondary-stat__label">Suspended Restaurants</div>
          <div className="secondary-stat__value">
            {stats.restaurants.suspended}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-overview__activity">
        <div className="activity-section">
          <div className="activity-section__header">
            <Activity size={20} />
            <h3>Recent Activity</h3>
          </div>

          <div className="activity-grid">
            {/* New Users */}
            <div className="activity-card">
              <div className="activity-card__header">
                <Users size={18} />
                <h4>New Users</h4>
              </div>
              <div className="activity-card__content">
                {stats.recentActivity.newUsers.length > 0 ? (
                  stats.recentActivity.newUsers.slice(0, 5).map((user: any) => (
                    <div key={user._id} className="activity-item">
                      <div className="activity-item__avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="activity-item__content">
                        <div className="activity-item__title">{user.name}</div>
                        <div className="activity-item__subtitle">
                          {user.role === "ADMIN"
                            ? "Administrator"
                            : "Restaurant Owner"}
                        </div>
                      </div>
                      <div className="activity-item__time">
                        <Calendar size={12} />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-empty">No new users recently</div>
                )}
              </div>
            </div>

            {/* New Restaurants */}
            <div className="activity-card">
              <div className="activity-card__header">
                <Store size={18} />
                <h4>New Restaurants</h4>
              </div>
              <div className="activity-card__content">
                {stats.recentActivity.newRestaurants.length > 0 ? (
                  stats.recentActivity.newRestaurants
                    .slice(0, 5)
                    .map((restaurant: any) => (
                      <div key={restaurant._id} className="activity-item">
                        <div className="activity-item__avatar">
                          {restaurant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="activity-item__content">
                          <div className="activity-item__title">
                            {restaurant.name}
                          </div>
                          <div className="activity-item__subtitle">
                            {restaurant.cuisineType?.slice(0, 2).join(", ")}
                          </div>
                        </div>
                        <div className="activity-item__time">
                          <Calendar size={12} />
                          <span>{formatDate(restaurant.createdAt)}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="activity-empty">
                    No new restaurants recently
                  </div>
                )}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="activity-card">
              <div className="activity-card__header">
                <AlertTriangle size={18} />
                <h4>Pending Approvals</h4>
              </div>
              <div className="activity-card__content">
                {stats.recentActivity.pendingApprovals.length > 0 ? (
                  stats.recentActivity.pendingApprovals
                    .slice(0, 5)
                    .map((restaurant: any) => (
                      <div key={restaurant._id} className="activity-item">
                        <div className="activity-item__avatar activity-item__avatar--pending">
                          {restaurant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="activity-item__content">
                          <div className="activity-item__title">
                            {restaurant.name}
                          </div>
                          <div className="activity-item__subtitle">
                            Awaiting approval
                          </div>
                        </div>
                        <div className="activity-item__time">
                          <Clock size={12} />
                          <span>{formatDate(restaurant.createdAt)}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="activity-empty">No pending approvals</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
