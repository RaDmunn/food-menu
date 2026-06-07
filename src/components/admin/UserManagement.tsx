"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Shield,
  User,
  Mail,
  Phone,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CustomSelect from "@/components/ui/CustomSelect";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "RESTAURANT_OWNER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  restaurants?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phone &&
            user.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();

      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (
    userId: string,
    newStatus: User["status"]
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );

      // Update selected user if it's the one being updated
      if (selectedUser?._id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const getStatusIcon = (status: User["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <CheckCircle className="status-icon status-icon--active" size={16} />
        );
      case "INACTIVE":
        return (
          <Clock className="status-icon status-icon--inactive" size={16} />
        );
      case "SUSPENDED":
        return (
          <XCircle className="status-icon status-icon--suspended" size={16} />
        );
      default:
        return <Clock className="status-icon" size={16} />;
    }
  };

  const getRoleIcon = (role: User["role"]) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="role-icon role-icon--admin" size={16} />;
      case "RESTAURANT_OWNER":
        return <User className="role-icon role-icon--owner" size={16} />;
      default:
        return <User className="role-icon" size={16} />;
    }
  };

  const getStatusText = (status: User["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "INACTIVE":
        return "Inactive";
      case "SUSPENDED":
        return "Suspended";
      default:
        return status;
    }
  };

  const getRoleText = (role: User["role"]) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "RESTAURANT_OWNER":
        return "Restaurant Owner";
      default:
        return role;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading users..." />;
  }

  if (error) {
    return (
      <div className="user-management__error">
        <h2>Error Loading Users</h2>
        <p>{error}</p>
        <button onClick={fetchUsers} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management__header">
        <h1>User Management</h1>
        <p>Manage platform users and their permissions</p>
      </div>

      {/* Filters */}
      <div className="user-management__filters">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CustomSelect
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: "all", label: "All Roles" },
            { value: "ADMIN", label: "Administrators" },
            { value: "RESTAURANT_OWNER", label: "Restaurant Owners" },
          ]}
          placeholder="Filter by role"
        />

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All Status" },
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
            { value: "SUSPENDED", label: "Suspended" },
          ]}
          placeholder="Filter by status"
        />
      </div>

      {/* Statistics */}
      <div className="user-management__stats">
        <div className="stat-card">
          <div className="stat-card__value">{users.length}</div>
          <div className="stat-card__label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">
            {users.filter((u) => u.role === "ADMIN").length}
          </div>
          <div className="stat-card__label">Administrators</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">
            {users.filter((u) => u.role === "RESTAURANT_OWNER").length}
          </div>
          <div className="stat-card__label">Restaurant Owners</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">
            {users.filter((u) => u.status === "ACTIVE").length}
          </div>
          <div className="stat-card__label">Active Users</div>
        </div>
      </div>

      {/* Results */}
      <div className="user-management__results">
        <div className="results-header">
          <h2>
            {filteredUsers.length} User{filteredUsers.length !== 1 ? "s" : ""}{" "}
            Found
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="no-results">
            <Search size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Restaurants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-id">
                            ID: {user._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`role-badge role-badge--${user.role.toLowerCase()}`}
                      >
                        {getRoleIcon(user.role)}
                        <span>{getRoleText(user.role)}</span>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`status-badge status-badge--${user.status.toLowerCase()}`}
                      >
                        {getStatusIcon(user.status)}
                        <span>{getStatusText(user.status)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="restaurants-count">
                        {user.restaurants ? user.restaurants.length : 0}
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetails(true);
                          }}
                          className="action-btn action-btn--view"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {user.status === "ACTIVE" && (
                          <button
                            onClick={() =>
                              updateUserStatus(user._id, "SUSPENDED")
                            }
                            className="action-btn action-btn--suspend"
                            title="Suspend User"
                          >
                            <UserX size={16} />
                          </button>
                        )}

                        {(user.status === "INACTIVE" ||
                          user.status === "SUSPENDED") && (
                          <button
                            onClick={() => updateUserStatus(user._id, "ACTIVE")}
                            className="action-btn action-btn--activate"
                            title="Activate User"
                          >
                            <UserCheck size={16} />
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

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedUser.name}</h2>
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
                    <span>{selectedUser.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedUser.phone}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>User ID:</label>
                    <span>{selectedUser._id}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Account Status</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Role:</label>
                    <div
                      className={`role-badge role-badge--${selectedUser.role.toLowerCase()}`}
                    >
                      {getRoleIcon(selectedUser.role)}
                      <span>{getRoleText(selectedUser.role)}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <div
                      className={`status-badge status-badge--${selectedUser.status.toLowerCase()}`}
                    >
                      {getStatusIcon(selectedUser.status)}
                      <span>{getStatusText(selectedUser.status)}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Restaurants:</label>
                    <span>
                      {selectedUser.restaurants
                        ? selectedUser.restaurants.length
                        : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Activity</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Account Created:</label>
                    <span>{formatDateTime(selectedUser.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{formatDateTime(selectedUser.updatedAt)}</span>
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
