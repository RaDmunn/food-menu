'use client';

import { useState } from 'react';

export interface CategoryFormData {
  name: string;
  description: string;
  sortOrder?: number;
}

interface CreateCategoryFormProps {
  restaurantId: string;
  menuName: string;
  sectionName: string;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  editingCategory?: CategoryFormData & { originalName?: string };
}

export default function CreateCategoryForm({
  restaurantId,
  menuName,
  sectionName,
  onSubmit,
  onCancel,
  editingCategory
}: CreateCategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: editingCategory?.name || '',
    description: editingCategory?.description || '',
    sortOrder: editingCategory?.sortOrder || 0,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (formData.sortOrder !== undefined && formData.sortOrder < 0) {
      newErrors.sortOrder = 'Sort order cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting category form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="create-category-form">
      <div className="create-category-form__header">
        <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
        <p>Add a new category to organize your menu items in "{sectionName}" section</p>
      </div>

      <form onSubmit={handleSubmit} className="create-category-form__form">
        <div className="create-category-form__field">
          <label className="create-category-form__label">Category Name *</label>
          <input
            type="text"
            className={`create-category-form__input ${errors.name ? 'create-category-form__input--error' : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Appetizers, Main Courses, Cocktails, Desserts"
            required
          />
          {errors.name && <span className="create-category-form__error">{errors.name}</span>}
        </div>

        <div className="create-category-form__field">
          <label className="create-category-form__label">Description</label>
          <textarea
            className={`create-category-form__input create-category-form__textarea ${errors.description ? 'create-category-form__input--error' : ''}`}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Optional description for this category"
            rows={3}
          />
          {errors.description && <span className="create-category-form__error">{errors.description}</span>}
        </div>

        <div className="create-category-form__field">
          <label className="create-category-form__label">Sort Order</label>
          <input
            type="number"
            className={`create-category-form__input ${errors.sortOrder ? 'create-category-form__input--error' : ''}`}
            value={formData.sortOrder || 0}
            onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
            min="0"
            placeholder="0"
          />
          {errors.sortOrder && <span className="create-category-form__error">{errors.sortOrder}</span>}
          <small className="create-category-form__help">Lower numbers appear first</small>
        </div>

        <div className="create-category-form__actions">
          <button
            type="button"
            className="create-category-form__button create-category-form__button--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-category-form__button create-category-form__button--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  );
}
