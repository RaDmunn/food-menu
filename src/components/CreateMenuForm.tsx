'use client';

import { useState } from 'react';

export interface MenuFormData {
  name: string;
  description: string;
  currency: string;
  isActive: boolean;
}

interface Restaurant {
  _id: string;
  name: string;
}

interface CreateMenuFormProps {
  restaurants: Restaurant[];
  selectedRestaurantId?: string;
  onSubmit: (data: MenuFormData & { restaurantId: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  editingMenu?: Menu | null;
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
}

const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'SEK', label: 'SEK - Swedish Krona' },
  { value: 'NOK', label: 'NOK - Norwegian Krone' },
  { value: 'DKK', label: 'DKK - Danish Krone' },
  { value: 'PLN', label: 'PLN - Polish Złoty' },
  { value: 'CZK', label: 'CZK - Czech Koruna' },
];

export default function CreateMenuForm({
  restaurants,
  selectedRestaurantId,
  onSubmit,
  onCancel,
  loading = false,
  editingMenu = null
}: CreateMenuFormProps) {
  const [formData, setFormData] = useState<MenuFormData>({
    name: editingMenu?.name || '',
    description: editingMenu?.description || '',
    currency: editingMenu?.currency || 'EUR',
    isActive: editingMenu?.isActive ?? true
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(
    editingMenu?.restaurant._id || selectedRestaurantId || (restaurants.length > 0 ? restaurants[0]._id : '')
  );

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Menu name is required';
    }

    if (!selectedRestaurant) {
      newErrors.restaurant = 'Restaurant is required';
    }

    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.create-menu-form__input--error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      await onSubmit({ ...formData, restaurantId: selectedRestaurant });
    } catch (error) {
      console.error('Error submitting menu form:', error);
    }
  };

  return (
    <div className="create-menu-form">
      <form onSubmit={handleSubmit} className="create-menu-form__form">
        <div className="create-menu-form__field">
          <label className="create-menu-form__label">Restaurant *</label>
          <select
            className={`create-menu-form__select ${errors.restaurant ? 'create-menu-form__input--error' : ''}`}
            value={selectedRestaurant}
            onChange={(e) => {
              setSelectedRestaurant(e.target.value);
              if (errors.restaurant) {
                setErrors(prev => ({ ...prev, restaurant: '' }));
              }
            }}
            required
          >
            <option value="">Select a restaurant</option>
            {restaurants.map(restaurant => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
          {errors.restaurant && <span className="create-menu-form__error">{errors.restaurant}</span>}
        </div>

        <div className="create-menu-form__field">
          <label className="create-menu-form__label">Menu Name *</label>
          <input
            type="text"
            className={`create-menu-form__input ${errors.name ? 'create-menu-form__input--error' : ''}`}
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: '' }));
              }
            }}
            placeholder="e.g., Main Menu, Lunch Menu, Dinner Menu"
            required
          />
          {errors.name && <span className="create-menu-form__error">{errors.name}</span>}
        </div>

        <div className="create-menu-form__field">
          <label className="create-menu-form__label">Description</label>
          <textarea
            className="create-menu-form__textarea"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of this menu (optional)"
            rows={3}
          />
        </div>

        <div className="create-menu-form__field">
          <label className="create-menu-form__label">Currency *</label>
          <select
            className={`create-menu-form__select ${errors.currency ? 'create-menu-form__input--error' : ''}`}
            value={formData.currency}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, currency: e.target.value }));
              if (errors.currency) {
                setErrors(prev => ({ ...prev, currency: '' }));
              }
            }}
            required
          >
            {CURRENCY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.currency && <span className="create-menu-form__error">{errors.currency}</span>}
        </div>

        <div className="create-menu-form__field">
          <label className="create-menu-form__checkbox-item">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            />
            <span className="create-menu-form__checkbox-label">Make this menu active immediately</span>
          </label>
        </div>

        <div className="create-menu-form__actions">
          <button
            type="submit"
            className="create-menu-form__submit-btn"
            disabled={loading || !formData.name.trim() || !selectedRestaurant}
          >
            {loading ? (editingMenu ? 'Updating Menu...' : 'Creating Menu...') : (editingMenu ? 'Update Menu' : 'Create Menu')}
          </button>
        </div>
      </form>
    </div>
  );
}
