'use client';

import { useState } from 'react';
import { CuisineType } from '@/lib/types';

interface CreateRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (restaurantData: RestaurantFormData) => Promise<void>;
}

export interface RestaurantFormData {
  name: string;
  description: string;
  cuisineType: CuisineType[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  workingHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  features: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
}

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const CUISINE_OPTIONS = Object.values(CuisineType);

const FEATURE_OPTIONS = [
  'WiFi', 'Parking', 'Delivery', 'Takeout', 'Outdoor Seating', 
  'Live Music', 'Pet Friendly', 'Wheelchair Accessible', 'Air Conditioning'
];

export default function CreateRestaurantModal({ isOpen, onClose, onSubmit }: CreateRestaurantModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    description: '',
    cuisineType: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Germany'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    workingHours: DAYS_OF_WEEK.map(day => ({
      day,
      open: '09:00',
      close: '22:00',
      isClosed: false
    })),
    features: [],
    priceRange: {
      min: 10,
      max: 50,
      currency: 'EUR'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        cuisineType: [],
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Germany'
        },
        contact: {
          phone: '',
          email: '',
          website: ''
        },
        workingHours: DAYS_OF_WEEK.map(day => ({
          day,
          open: '09:00',
          close: '22:00',
          isClosed: false
        })),
        features: [],
        priceRange: {
          min: 10,
          max: 50,
          currency: 'EUR'
        }
      });
    } catch (error) {
      console.error('Error creating restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCuisineChange = (cuisine: CuisineType) => {
    setFormData(prev => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(cuisine)
        ? prev.cuisineType.filter(c => c !== cuisine)
        : [...prev.cuisineType, cuisine]
    }));
  };

  const handleFeatureChange = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleWorkingHoursChange = (dayIndex: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((wh, index) => 
        index === dayIndex ? { ...wh, [field]: value } : wh
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="create-restaurant-modal">
      <div className="create-restaurant-modal__overlay" onClick={onClose} />
      <div className="create-restaurant-modal__content">
        <div className="create-restaurant-modal__header">
          <h2>Create New Restaurant</h2>
          <button 
            className="create-restaurant-modal__close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-restaurant-modal__form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Restaurant Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={1000}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Cuisine Types *</label>
              <div className="checkbox-grid">
                {CUISINE_OPTIONS.map(cuisine => (
                  <label key={cuisine} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.cuisineType.includes(cuisine)}
                      onChange={() => handleCuisineChange(cuisine)}
                    />
                    <span>{cuisine}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="form-section">
            <h3>Address</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>State/Region</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, state: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ZIP/Postal Code</label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                />
              </div>
              
              <div className="form-group">
                <label>Country *</label>
                <select
                  value={formData.address.country}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, country: e.target.value }
                  }))}
                  required
                >
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Austria">Austria</option>
                  <option value="Switzerland">Switzerland</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.contact.website}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact: { ...prev.contact, website: e.target.value }
                }))}
              />
            </div>
          </div>

          {/* Working Hours */}
          <div className="form-section">
            <h3>Working Hours</h3>
            <div className="working-hours-grid">
              {formData.workingHours.map((wh, index) => (
                <div key={wh.day} className={`working-hours-day ${wh.isClosed ? 'is-closed' : ''}`}>
                  <div className="day-label">{wh.day}</div>
                  <input
                    type="time"
                    value={wh.open}
                    onChange={(e) => handleWorkingHoursChange(index, 'open', e.target.value)}
                    disabled={wh.isClosed}
                  />
                  <input
                    type="time"
                    value={wh.close}
                    onChange={(e) => handleWorkingHoursChange(index, 'close', e.target.value)}
                    disabled={wh.isClosed}
                  />
                  <div className="closed-checkbox">
                    <input
                      type="checkbox"
                      id={`closed-${wh.day}`}
                      checked={wh.isClosed}
                      onChange={(e) => handleWorkingHoursChange(index, 'isClosed', e.target.checked)}
                    />
                    <label htmlFor={`closed-${wh.day}`}>Closed</label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="form-section">
            <h3>Price Range</h3>
            <div className="price-range-inputs">
              <div className="form-group">
                <label>Minimum Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceRange.min}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="form-group">
                <label>Maximum Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceRange.max}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select
                  className="currency-select"
                  value={formData.priceRange.currency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, currency: e.target.value }
                  }))}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="form-section">
            <h3>Features</h3>
            <div className="checkbox-grid">
              {FEATURE_OPTIONS.map(feature => (
                <label key={feature} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureChange(feature)}
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="create-restaurant-modal__actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !formData.name || formData.cuisineType.length === 0}
            >
              {loading ? 'Creating...' : 'Create Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
