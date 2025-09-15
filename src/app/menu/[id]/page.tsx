"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CreateSectionForm, { SectionFormData } from "@/components/CreateSectionForm";
import CreateCategoryForm, { CategoryFormData } from "@/components/CreateCategoryForm";
import CreateItemForm, { ItemFormData } from "@/components/CreateItemForm";
import SectionCard, { Section, Category } from "@/components/SectionCard";

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
  sections: Section[];
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
  const [showCreateSectionForm, setShowCreateSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentSectionForCategory, setCurrentSectionForCategory] = useState<string>('');
  const [showCreateItemForm, setShowCreateItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentSectionForItem, setCurrentSectionForItem] = useState<string>('');
  const [currentCategoryForItem, setCurrentCategoryForItem] = useState<string>('');

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

  // Section management functions
  const handleCreateSection = async (data: SectionFormData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/menu/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: menu?.restaurant._id,
          menuName: menu?.name,
          sectionName: data.name,
          description: data.description,
          sortOrder: data.sortOrder,
        }),
      });

      if (response.ok) {
        await loadMenu(); // Reload menu to get updated sections
        setShowCreateSectionForm(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to create section: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating section:", error);
      alert("Failed to create section. Please try again.");
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setShowCreateSectionForm(true);
  };

  const handleUpdateSection = async (data: SectionFormData) => {
    if (!editingSection) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/menu/sections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: menu?.restaurant._id,
          menuName: menu?.name,
          sectionName: editingSection.name,
          newSectionName: data.name,
          description: data.description,
          sortOrder: data.sortOrder,
        }),
      });

      if (response.ok) {
        await loadMenu();
        setShowCreateSectionForm(false);
        setEditingSection(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to update section: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating section:", error);
      alert("Failed to update section. Please try again.");
    }
  };

  const handleDeleteSection = async (sectionName: string) => {
    if (!confirm(`Are you sure you want to delete the section "${sectionName}"? This will also delete all categories and items within it.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/menu/sections?restaurant=${menu?.restaurant._id}&menu=${menu?.name}&section=${sectionName}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadMenu();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete section: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section. Please try again.");
    }
  };

  const handleAddCategory = (sectionName: string) => {
    setCurrentSectionForCategory(sectionName);
    setEditingCategory(null);
    setShowCreateCategoryForm(true);
  };

  const handleEditCategory = (sectionName: string, category: Category) => {
    setCurrentSectionForCategory(sectionName);
    setEditingCategory(category);
    setShowCreateCategoryForm(true);
  };

  const handleDeleteCategory = async (sectionName: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This will also delete all items within it.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/menu/categories?restaurant=${menu?.restaurant._id}&menu=${menu?.name}&section=${sectionName}&category=${categoryName}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadMenu();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete category: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    }
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/menu/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: menu?.restaurant._id,
          menuName: menu?.name,
          sectionName: currentSectionForCategory,
          categoryName: data.name,
          description: data.description,
          sortOrder: data.sortOrder,
        }),
      });

      if (response.ok) {
        await loadMenu();
        setShowCreateCategoryForm(false);
        setCurrentSectionForCategory('');
      } else {
        const errorData = await response.json();
        alert(`Failed to create category: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category. Please try again.");
    }
  };

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/menu/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: menu?.restaurant._id,
          menuName: menu?.name,
          sectionName: currentSectionForCategory,
          categoryName: editingCategory.name,
          newCategoryName: data.name,
          description: data.description,
          sortOrder: data.sortOrder,
        }),
      });

      if (response.ok) {
        await loadMenu();
        setShowCreateCategoryForm(false);
        setEditingCategory(null);
        setCurrentSectionForCategory('');
      } else {
        const errorData = await response.json();
        alert(`Failed to update category: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category. Please try again.");
    }
  };

  // Item management functions
  const handleAddItem = (sectionName: string, categoryName: string) => {
    setCurrentSectionForItem(sectionName);
    setCurrentCategoryForItem(categoryName);
    setEditingItem(null);
    setShowCreateItemForm(true);
  };

  const handleEditItem = (sectionName: string, categoryName: string, item: any) => {
    setCurrentSectionForItem(sectionName);
    setCurrentCategoryForItem(categoryName);
    setEditingItem(item);
    setShowCreateItemForm(true);
  };

  const handleDeleteItem = async (sectionName: string, categoryName: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete the item "${itemName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/menu/items?restaurant=${menu?.restaurant._id}&menu=${menu?.name}&section=${sectionName}&category=${categoryName}&item=${itemName}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadMenu();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete item: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleCreateItem = async (data: ItemFormData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/menu/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: menu?.restaurant._id,
          menuName: menu?.name,
          sectionName: currentSectionForItem,
          categoryName: currentCategoryForItem,
          ...data,
        }),
      });

      if (response.ok) {
        await loadMenu();
        setShowCreateItemForm(false);
        setCurrentSectionForItem('');
        setCurrentCategoryForItem('');
      } else {
        const errorData = await response.json();
        alert(`Failed to create item: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating item:", error);
      alert("Failed to create item. Please try again.");
    }
  };

  const handleUpdateItem = async (data: ItemFormData) => {
    if (!editingItem) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/menu/items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: menu?.restaurant._id,
          menuName: menu?.name,
          sectionName: currentSectionForItem,
          categoryName: currentCategoryForItem,
          itemName: editingItem.name,
          updates: data,
        }),
      });

      if (response.ok) {
        await loadMenu();
        setShowCreateItemForm(false);
        setEditingItem(null);
        setCurrentSectionForItem('');
        setCurrentCategoryForItem('');
      } else {
        const errorData = await response.json();
        alert(`Failed to update item: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item. Please try again.");
    }
  };

  const handleFormCancel = () => {
    setShowCreateSectionForm(false);
    setEditingSection(null);
    setShowCreateCategoryForm(false);
    setEditingCategory(null);
    setCurrentSectionForCategory('');
    setShowCreateItemForm(false);
    setEditingItem(null);
    setCurrentSectionForItem('');
    setCurrentCategoryForItem('');
  };

  const handleCategoryFormCancel = () => {
    setShowCreateCategoryForm(false);
    setEditingCategory(null);
    setCurrentSectionForCategory('');
  };

  const handleItemFormCancel = () => {
    setShowCreateItemForm(false);
    setEditingItem(null);
    setCurrentSectionForItem('');
    setCurrentCategoryForItem('');
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
          {showCreateSectionForm ? (
            <CreateSectionForm
              restaurantId={menu.restaurant._id}
              menuName={menu.name}
              onSubmit={editingSection ? handleUpdateSection : handleCreateSection}
              onCancel={handleFormCancel}
              editingSection={editingSection ? {
                name: editingSection.name,
                description: editingSection.description || '',
                sortOrder: editingSection.sortOrder,
                originalName: editingSection.name
              } : undefined}
            />
          ) : showCreateCategoryForm ? (
            <CreateCategoryForm
              restaurantId={menu.restaurant._id}
              menuName={menu.name}
              sectionName={currentSectionForCategory}
              onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
              onCancel={handleCategoryFormCancel}
              editingCategory={editingCategory ? {
                name: editingCategory.name,
                description: editingCategory.description || '',
                sortOrder: editingCategory.sortOrder,
                originalName: editingCategory.name
              } : undefined}
            />
          ) : showCreateItemForm ? (
            <CreateItemForm
              restaurantId={menu.restaurant._id}
              menuName={menu.name}
              sectionName={currentSectionForItem}
              categoryName={currentCategoryForItem}
              onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
              onCancel={handleItemFormCancel}
              editingItem={editingItem ? {
                ...editingItem,
                originalName: editingItem.name
              } : undefined}
            />
          ) : (
            <div className="menu-management__section">
              <div className="menu-management__section-header">
                <h2>Menu Sections</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateSectionForm(true)}
                >
                  Add Section
                </button>
              </div>

              {menu.sections.length === 0 ? (
                <div className="menu-management__empty">
                  <div className="menu-management__empty-icon">🏗️</div>
                  <h3>No sections yet</h3>
                  <p>
                    Start organizing your menu by adding sections like
                    "Kitchen", "Bar", "Desserts", "Lunch Menu", etc.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => setShowCreateSectionForm(true)}
                  >
                    Add First Section
                  </button>
                </div>
              ) : (
                <div className="menu-management__sections">
                  {menu.sections
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((section) => (
                      <SectionCard
                        key={section.name}
                        section={section}
                        onEdit={handleEditSection}
                        onDelete={handleDeleteSection}
                        onAddCategory={handleAddCategory}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onAddItem={handleAddItem}
                        onEditItem={handleEditItem}
                        onDeleteItem={handleDeleteItem}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
