'use client';

import { useState } from 'react';

export interface AvailabilityScheduleData {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "14:00"
}

export interface SectionFormData {
  name: string;
  description: string;
  sortOrder?: number;

  // Время доступности для секций
  availabilitySchedule?: AvailabilityScheduleData[];
  seasonalAvailability?: {
    startMonth: number; // 1-12
    endMonth: number; // 1-12
  };
}

interface CreateSectionFormProps {
  restaurantId: string;
  menuName: string;
  onSubmit: (data: SectionFormData) => Promise<void>;
  onCancel: () => void;
  editingSection?: SectionFormData & { originalName?: string };
}

export default function CreateSectionForm({
  restaurantId,
  menuName,
  onSubmit,
  onCancel,
  editingSection
}: CreateSectionFormProps) {
  const [formData, setFormData] = useState<SectionFormData>({
    name: editingSection?.name || '',
    description: editingSection?.description || '',
    sortOrder: editingSection?.sortOrder || 0,
    availabilitySchedule: editingSection?.availabilitySchedule || [],
    seasonalAvailability: editingSection?.seasonalAvailability || undefined,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Section name is required';
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
      console.error('Error submitting section form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SectionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="create-section-form">
      <div className="create-section-form__header">
        <h3>{editingSection ? 'Edit Section' : 'Create New Section'}</h3>
        <p>Add a new section to organize your menu categories</p>
      </div>

      <form onSubmit={handleSubmit} className="create-section-form__form">
        <div className="create-section-form__field">
          <label className="create-section-form__label">Section Name *</label>
          <input
            type="text"
            className={`create-section-form__input ${errors.name ? 'create-section-form__input--error' : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Kitchen, Bar, Desserts, Lunch"
            required
          />
          {errors.name && <span className="create-section-form__error">{errors.name}</span>}
        </div>

        <div className="create-section-form__field">
          <label className="create-section-form__label">Description</label>
          <textarea
            className={`create-section-form__input create-section-form__textarea ${errors.description ? 'create-section-form__input--error' : ''}`}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Optional description for this section"
            rows={3}
          />
          {errors.description && <span className="create-section-form__error">{errors.description}</span>}
        </div>

        <div className="create-section-form__field">
          <label className="create-section-form__label">Sort Order</label>
          <input
            type="number"
            className={`create-section-form__input ${errors.sortOrder ? 'create-section-form__input--error' : ''}`}
            value={formData.sortOrder || 0}
            onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
            min="0"
            placeholder="0"
          />
          {errors.sortOrder && <span className="create-section-form__error">{errors.sortOrder}</span>}
          <small className="create-section-form__help">Lower numbers appear first</small>
        </div>

        {/* Availability Schedule */}
        <div className="create-section-form__section">
          <div className="create-section-form__section-header">
            <h4>Availability Schedule</h4>
            <button
              type="button"
              className="create-section-form__toggle-btn"
              onClick={() => setShowAvailability(!showAvailability)}
            >
              {showAvailability ? '▼' : '▶'} {showAvailability ? 'Hide' : 'Show'} Schedule
            </button>
          </div>

          {showAvailability && (
            <>
              <div className="create-section-form__field">
                <label className="create-section-form__label">Weekly Schedule</label>
                <div className="create-section-form__schedule-list">
                  {(formData.availabilitySchedule || []).map((schedule, index) => (
                    <div key={index} className="create-section-form__schedule-item">
                      <select
                        value={schedule.dayOfWeek}
                        onChange={(e) => {
                          const newSchedule = [...(formData.availabilitySchedule || [])];
                          newSchedule[index] = { ...schedule, dayOfWeek: parseInt(e.target.value) };
                          setFormData(prev => ({ ...prev, availabilitySchedule: newSchedule }));
                        }}
                      >
                        <option value={0}>Sunday</option>
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                      </select>
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => {
                          const newSchedule = [...(formData.availabilitySchedule || [])];
                          newSchedule[index] = { ...schedule, startTime: e.target.value };
                          setFormData(prev => ({ ...prev, availabilitySchedule: newSchedule }));
                        }}
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => {
                          const newSchedule = [...(formData.availabilitySchedule || [])];
                          newSchedule[index] = { ...schedule, endTime: e.target.value };
                          setFormData(prev => ({ ...prev, availabilitySchedule: newSchedule }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSchedule = (formData.availabilitySchedule || []).filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, availabilitySchedule: newSchedule }));
                        }}
                        className="create-section-form__remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newSchedule = [...(formData.availabilitySchedule || []), {
                        dayOfWeek: 1,
                        startTime: '09:00',
                        endTime: '17:00'
                      }];
                      setFormData(prev => ({ ...prev, availabilitySchedule: newSchedule }));
                    }}
                    className="create-section-form__add-btn"
                  >
                    + Add Schedule
                  </button>
                </div>
              </div>

              <div className="create-section-form__field">
                <label className="create-section-form__label">Seasonal Availability</label>
                <div className="create-section-form__row">
                  <div className="create-section-form__field">
                    <label className="create-section-form__label">Start Month</label>
                    <select
                      value={formData.seasonalAvailability?.startMonth || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          seasonalAvailability: value ? {
                            ...prev.seasonalAvailability,
                            startMonth: value,
                            endMonth: prev.seasonalAvailability?.endMonth || value
                          } : undefined
                        }));
                      }}
                    >
                      <option value="">No seasonal restriction</option>
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March</option>
                      <option value={4}>April</option>
                      <option value={5}>May</option>
                      <option value={6}>June</option>
                      <option value={7}>July</option>
                      <option value={8}>August</option>
                      <option value={9}>September</option>
                      <option value={10}>October</option>
                      <option value={11}>November</option>
                      <option value={12}>December</option>
                    </select>
                  </div>

                  <div className="create-section-form__field">
                    <label className="create-section-form__label">End Month</label>
                    <select
                      value={formData.seasonalAvailability?.endMonth || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          seasonalAvailability: value ? {
                            ...prev.seasonalAvailability,
                            startMonth: prev.seasonalAvailability?.startMonth || value,
                            endMonth: value
                          } : undefined
                        }));
                      }}
                      disabled={!formData.seasonalAvailability?.startMonth}
                    >
                      <option value="">Select end month</option>
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March</option>
                      <option value={4}>April</option>
                      <option value={5}>May</option>
                      <option value={6}>June</option>
                      <option value={7}>July</option>
                      <option value={8}>August</option>
                      <option value={9}>September</option>
                      <option value={10}>October</option>
                      <option value={11}>November</option>
                      <option value={12}>December</option>
                    </select>
                  </div>
                </div>
                <small className="create-section-form__help">
                  Set seasonal availability (e.g., Summer menu from June to August)
                </small>
              </div>
            </>
          )}
        </div>

        <div className="create-section-form__actions">
          <button
            type="button"
            className="create-section-form__button create-section-form__button--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-section-form__button create-section-form__button--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (editingSection ? 'Update Section' : 'Create Section')}
          </button>
        </div>
      </form>
    </div>
  );
}
