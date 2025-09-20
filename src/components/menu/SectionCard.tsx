'use client';

import { useState } from 'react';

export interface Section {
  name: string;
  description?: string;
  categories: Category[];
  isActive: boolean;
  sortOrder?: number;
}

export interface Category {
  name: string;
  description?: string;
  items: any[];
  sortOrder?: number;
}

interface SectionCardProps {
  section: Section;
  onEdit: (section: Section) => void;
  onDelete: (sectionName: string) => void;
  onAddCategory: (sectionName: string) => void;
  onEditCategory: (sectionName: string, category: Category) => void;
  onDeleteCategory: (sectionName: string, categoryName: string) => void;
  onAddItem?: (sectionName: string, categoryName: string) => void;
  onEditItem?: (sectionName: string, categoryName: string, item: any) => void;
  onDeleteItem?: (sectionName: string, categoryName: string, itemName: string) => void;
}

export default function SectionCard({
  section,
  onEdit,
  onDelete,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(section.name);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="section-card">
      <div className="section-card__header">
        <div className="section-card__info">
          <div className="section-card__title-row">
            <h3 className="section-card__title">{section.name}</h3>
            <div className="section-card__badges">
              <span className="section-card__badge">
                {section.categories.length} categories
              </span>
              {!section.isActive && (
                <span className="section-card__badge section-card__badge--inactive">
                  Inactive
                </span>
              )}
            </div>
          </div>
          {section.description && (
            <p className="section-card__description">{section.description}</p>
          )}
        </div>

        <div className="section-card__actions">
          <button
            className="section-card__action-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              className={`section-card__expand-icon ${isExpanded ? 'section-card__expand-icon--expanded' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          
          <button
            className="section-card__action-btn"
            onClick={() => onEdit(section)}
            title="Edit section"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>

          <button
            className={`section-card__action-btn ${showDeleteConfirm ? 'section-card__action-btn--danger' : ''}`}
            onClick={handleDelete}
            title={showDeleteConfirm ? "Confirm delete" : "Delete section"}
          >
            {showDeleteConfirm ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
              </svg>
            )}
          </button>

          {showDeleteConfirm && (
            <button
              className="section-card__action-btn section-card__action-btn--cancel"
              onClick={cancelDelete}
              title="Cancel delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="section-card__content">
          <div className="section-card__categories-header">
            <h4>Categories</h4>
            <button
              className="section-card__add-category-btn"
              onClick={() => onAddCategory(section.name)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Category
            </button>
          </div>

          {section.categories.length === 0 ? (
            <div className="section-card__empty">
              <p>No categories yet. Add your first category to get started.</p>
            </div>
          ) : (
            <div className="section-card__categories">
              {section.categories
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((category) => (
                  <div key={category.name} className="section-card__category">
                    <div className="section-card__category-header">
                      <div className="section-card__category-info">
                        <h5 className="section-card__category-name">{category.name}</h5>
                        {category.description && (
                          <p className="section-card__category-description">{category.description}</p>
                        )}
                        <span className="section-card__category-count">
                          {category.items?.length || 0} items
                        </span>
                      </div>
                      <div className="section-card__category-actions">
                        {onAddItem && (
                          <button
                            className="section-card__category-action section-card__category-action--add"
                            onClick={() => onAddItem(section.name, category.name)}
                            title="Add item"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        )}
                        <button
                          className="section-card__category-action"
                          onClick={() => onEditCategory(section.name, category)}
                          title="Edit category"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          className="section-card__category-action section-card__category-action--danger"
                          onClick={() => onDeleteCategory(section.name, category.name)}
                          title="Delete category"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Items in category */}
                    {category.items && category.items.length > 0 && (
                      <div className="section-card__items">
                        {category.items.map((item: any) => (
                          <div key={item.name} className="section-card__item">
                            <div className="section-card__item-info">
                              <h6 className="section-card__item-name">{item.name}</h6>
                              <p className="section-card__item-description">{item.description}</p>
                              <span className="section-card__item-price">${item.price}</span>
                            </div>
                            {(onEditItem || onDeleteItem) && (
                              <div className="section-card__item-actions">
                                {onEditItem && (
                                  <button
                                    className="section-card__item-action"
                                    onClick={() => onEditItem(section.name, category.name, item)}
                                    title="Edit item"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                  </button>
                                )}
                                {onDeleteItem && (
                                  <button
                                    className="section-card__item-action section-card__item-action--danger"
                                    onClick={() => onDeleteItem(section.name, category.name, item.name)}
                                    title="Delete item"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3,6 5,6 21,6"></polyline>
                                      <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
