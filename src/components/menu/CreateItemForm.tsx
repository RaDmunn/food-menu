'use client';

import { useState } from 'react';

export interface ItemSizeData {
  name: string;
  price: number;
  weight?: number;
  volume?: number;
  description?: string;
}

export interface ItemFormData {
  name: string;
  description: string;
  price: number;

  // Размеры порций
  sizes?: ItemSizeData[];
  defaultSize?: string;
  servingSize?: string;

  allergens?: string[];

  // Базовые диетические ограничения
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;

  // Расширенные диетические метки
  isKeto?: boolean;
  isPaleo?: boolean;
  isLowCarb?: boolean;
  isLowFat?: boolean;
  isLowSodium?: boolean;
  isOrganic?: boolean;
  isLocallySourced?: boolean;
  isHalal?: boolean;
  isKosher?: boolean;

  isSpicy?: boolean;
  spicyLevel?: number;
  containsAlcohol?: boolean;
  calories?: number;
  preparationTime?: number;
  ingredients?: string[];
  images?: string[];
  status?: string;

  // Маркетинговые теги
  isNewItem?: boolean;
  isLimitedTime?: boolean;
  tags?: string[];

  // Расширенная пищевая ценность
  nutritionalInfo?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    saturatedFat?: number;
    transFat?: number;
    vitaminC?: number;
    calcium?: number;
    iron?: number;
  };
}

interface CreateItemFormProps {
  restaurantId: string;
  menuName: string;
  sectionName: string;
  categoryName: string;
  onSubmit: (data: ItemFormData) => Promise<void>;
  onCancel: () => void;
  editingItem?: ItemFormData & { originalName?: string };
}

export default function CreateItemForm({
  restaurantId,
  menuName,
  sectionName,
  categoryName,
  onSubmit,
  onCancel,
  editingItem
}: CreateItemFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: editingItem?.name || '',
    description: editingItem?.description || '',
    price: editingItem?.price || 0,

    // Размеры порций
    sizes: editingItem?.sizes || [],
    defaultSize: editingItem?.defaultSize || '',
    servingSize: editingItem?.servingSize || '',

    allergens: editingItem?.allergens || [],

    // Базовые диетические ограничения
    isVegetarian: editingItem?.isVegetarian || false,
    isVegan: editingItem?.isVegan || false,
    isGlutenFree: editingItem?.isGlutenFree || false,

    // Расширенные диетические метки
    isKeto: editingItem?.isKeto || false,
    isPaleo: editingItem?.isPaleo || false,
    isLowCarb: editingItem?.isLowCarb || false,
    isLowFat: editingItem?.isLowFat || false,
    isLowSodium: editingItem?.isLowSodium || false,
    isOrganic: editingItem?.isOrganic || false,
    isLocallySourced: editingItem?.isLocallySourced || false,
    isHalal: editingItem?.isHalal || false,
    isKosher: editingItem?.isKosher || false,

    isSpicy: editingItem?.isSpicy || false,
    spicyLevel: editingItem?.spicyLevel || 0,
    containsAlcohol: editingItem?.containsAlcohol || false,
    calories: editingItem?.calories || undefined,
    preparationTime: editingItem?.preparationTime || undefined,
    ingredients: editingItem?.ingredients || [],
    images: editingItem?.images || [],
    status: editingItem?.status || 'available',

    // Маркетинговые теги
    isNewItem: editingItem?.isNewItem || false,
    isLimitedTime: editingItem?.isLimitedTime || false,
    tags: editingItem?.tags || [],

    // Расширенная пищевая ценность
    nutritionalInfo: editingItem?.nutritionalInfo || {},
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showSizes, setShowSizes] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.spicyLevel !== undefined && (formData.spicyLevel < 0 || formData.spicyLevel > 5)) {
      newErrors.spicyLevel = 'Spicy level must be between 0 and 5';
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
      console.error('Error submitting item form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim() && !formData.ingredients?.includes(ingredientInput.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), ingredientInput.trim()]
      }));
      setIngredientInput('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter(ing => ing !== ingredient) || []
    }));
  };

  const addAllergen = () => {
    if (allergenInput.trim() && !formData.allergens?.includes(allergenInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergens: [...(prev.allergens || []), allergenInput.trim()]
      }));
      setAllergenInput('');
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens?.filter(all => all !== allergen) || []
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('restaurantId', restaurantId);

        const response = await fetch('/api/uploads/menu-item-image', {
          method: 'POST',
          body: uploadData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }

        uploadedUrls.push(data.url);
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const removeImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter(url => url !== imageUrl) || [],
    }));
  };

  return (
    <div className="create-item-form">
      <div className="create-item-form__header">
        <h3>{editingItem ? 'Edit Item' : 'Create New Item'}</h3>
        <p>Add a new item to "{categoryName}" category in "{sectionName}" section</p>
      </div>

      <form onSubmit={handleSubmit} className="create-item-form__form">
        {/* Basic Information */}
        <div className="create-item-form__section">
          <h4>Basic Information</h4>
          
          <div className="create-item-form__field">
            <label className="create-item-form__label">Item Name *</label>
            <input
              type="text"
              className={`create-item-form__input ${errors.name ? 'create-item-form__input--error' : ''}`}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Margherita Pizza, Caesar Salad, Mojito"
              required
            />
            {errors.name && <span className="create-item-form__error">{errors.name}</span>}
          </div>

          <div className="create-item-form__field">
            <label className="create-item-form__label">Description *</label>
            <textarea
              className={`create-item-form__input create-item-form__textarea ${errors.description ? 'create-item-form__input--error' : ''}`}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the item, its ingredients, and what makes it special"
              rows={3}
              required
            />
            {errors.description && <span className="create-item-form__error">{errors.description}</span>}
          </div>

          <div className="create-item-form__field">
            <label className="create-item-form__label">Price *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`create-item-form__input ${errors.price ? 'create-item-form__input--error' : ''}`}
              value={formData.price || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
            />
            {errors.price && <span className="create-item-form__error">{errors.price}</span>}
          </div>

          <div className="create-item-form__field">
            <label className="create-item-form__label">Item Images</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="create-item-form__file-input"
              onChange={handleImageUpload}
              disabled={isUploadingImage}
            />
            <small className="create-item-form__help">
              JPG, PNG, WEBP or GIF. Max 5MB per image.
            </small>
            {isUploadingImage && (
              <span className="create-item-form__help">Uploading image...</span>
            )}
            {uploadError && (
              <span className="create-item-form__error">{uploadError}</span>
            )}
            {(formData.images || []).length > 0 && (
              <div className="create-item-form__image-list">
                {(formData.images || []).map((imageUrl) => (
                  <div key={imageUrl} className="create-item-form__image-preview">
                    <img src={imageUrl} alt={`${formData.name || 'Menu item'} preview`} />
                    <button type="button" onClick={() => removeImage(imageUrl)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sizes and Portions */}
        <div className="create-item-form__section">
          <div className="create-item-form__section-header">
            <h4>Sizes & Portions</h4>
            <button
              type="button"
              className="create-item-form__toggle-btn"
              onClick={() => setShowSizes(!showSizes)}
            >
              {showSizes ? '▼' : '▶'} {showSizes ? 'Hide' : 'Show'} Size Options
            </button>
          </div>

          {showSizes && (
            <>
              <div className="create-item-form__row">
                <div className="create-item-form__field">
                  <label className="create-item-form__label">Default Size</label>
                  <input
                    type="text"
                    className="create-item-form__input"
                    value={formData.defaultSize || ''}
                    onChange={(e) => handleInputChange('defaultSize', e.target.value)}
                    placeholder="e.g., Medium"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Serving Size</label>
                  <input
                    type="text"
                    className="create-item-form__input"
                    value={formData.servingSize || ''}
                    onChange={(e) => handleInputChange('servingSize', e.target.value)}
                    placeholder="e.g., Serves 2-3 people"
                  />
                </div>
              </div>

              <div className="create-item-form__field">
                <label className="create-item-form__label">Available Sizes</label>
                <div className="create-item-form__sizes-list">
                  {(formData.sizes || []).map((size, index) => (
                    <div key={index} className="create-item-form__size-item">
                      <input
                        type="text"
                        placeholder="Size name"
                        value={size.name}
                        onChange={(e) => {
                          const newSizes = [...(formData.sizes || [])];
                          newSizes[index] = { ...size, name: e.target.value };
                          handleInputChange('sizes', newSizes);
                        }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={size.price || ''}
                        onChange={(e) => {
                          const newSizes = [...(formData.sizes || [])];
                          newSizes[index] = { ...size, price: parseFloat(e.target.value) || 0 };
                          handleInputChange('sizes', newSizes);
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Weight (g)"
                        value={size.weight || ''}
                        onChange={(e) => {
                          const newSizes = [...(formData.sizes || [])];
                          newSizes[index] = { ...size, weight: parseInt(e.target.value) || undefined };
                          handleInputChange('sizes', newSizes);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSizes = (formData.sizes || []).filter((_, i) => i !== index);
                          handleInputChange('sizes', newSizes);
                        }}
                        className="create-item-form__remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newSizes = [...(formData.sizes || []), { name: '', price: 0 }];
                      handleInputChange('sizes', newSizes);
                    }}
                    className="create-item-form__add-btn"
                  >
                    + Add Size
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dietary Information */}
        <div className="create-item-form__section">
          <h4>Dietary Information</h4>
          
          <div className="create-item-form__checkboxes">
            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isVegetarian || false}
                onChange={(e) => handleInputChange('isVegetarian', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Vegetarian</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isVegan || false}
                onChange={(e) => handleInputChange('isVegan', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Vegan</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isGlutenFree || false}
                onChange={(e) => handleInputChange('isGlutenFree', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Gluten Free</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.containsAlcohol || false}
                onChange={(e) => handleInputChange('containsAlcohol', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Contains Alcohol</span>
            </label>
          </div>

          <div className="create-item-form__field">
            <label className="create-item-form__checkbox">
              <input
                type="checkbox"
                checked={formData.isSpicy || false}
                onChange={(e) => handleInputChange('isSpicy', e.target.checked)}
              />
              <span>Spicy</span>
            </label>
            
            {formData.isSpicy && (
              <div className="create-item-form__spicy-level">
                <label className="create-item-form__label">Spicy Level (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className={`create-item-form__input ${errors.spicyLevel ? 'create-item-form__input--error' : ''}`}
                  value={formData.spicyLevel || 1}
                  onChange={(e) => handleInputChange('spicyLevel', parseInt(e.target.value) || 1)}
                />
                {errors.spicyLevel && <span className="create-item-form__error">{errors.spicyLevel}</span>}
              </div>
            )}
          </div>

          {/* Extended Dietary Information */}
          <h5>Extended Dietary Options</h5>
          <div className="create-item-form__checkboxes">
            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isKeto || false}
                onChange={(e) => handleInputChange('isKeto', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Keto</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isPaleo || false}
                onChange={(e) => handleInputChange('isPaleo', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Paleo</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isLowCarb || false}
                onChange={(e) => handleInputChange('isLowCarb', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Low Carb</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isLowFat || false}
                onChange={(e) => handleInputChange('isLowFat', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Low Fat</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isLowSodium || false}
                onChange={(e) => handleInputChange('isLowSodium', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Low Sodium</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isOrganic || false}
                onChange={(e) => handleInputChange('isOrganic', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Organic</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isLocallySourced || false}
                onChange={(e) => handleInputChange('isLocallySourced', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Locally Sourced</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isHalal || false}
                onChange={(e) => handleInputChange('isHalal', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Halal</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isKosher || false}
                onChange={(e) => handleInputChange('isKosher', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Kosher</span>
            </label>
          </div>
        </div>

        {/* Marketing Tags */}
        <div className="create-item-form__section">
          <h4>Marketing & Tags</h4>

          <div className="create-item-form__checkboxes">
            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isNewItem || false}
                onChange={(e) => handleInputChange('isNewItem', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">New Item</span>
            </label>

            <label className="create-item-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.isLimitedTime || false}
                onChange={(e) => handleInputChange('isLimitedTime', e.target.checked)}
              />
              <span className="create-item-form__checkbox-label">Limited Time</span>
            </label>
          </div>

          <div className="create-item-form__field">
            <label className="create-item-form__label">Tags</label>
            <div className="create-item-form__tags-input">
              <input
                type="text"
                className="create-item-form__input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag (e.g., Bestseller, Chef's Choice)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (tagInput.trim()) {
                      const newTags = [...(formData.tags || []), tagInput.trim()];
                      handleInputChange('tags', newTags);
                      setTagInput('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (tagInput.trim()) {
                    const newTags = [...(formData.tags || []), tagInput.trim()];
                    handleInputChange('tags', newTags);
                    setTagInput('');
                  }
                }}
                className="create-item-form__add-btn"
              >
                Add Tag
              </button>
            </div>
            <div className="create-item-form__tags">
              {(formData.tags || []).map((tag, index) => (
                <span key={index} className="create-item-form__tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = (formData.tags || []).filter((_, i) => i !== index);
                      handleInputChange('tags', newTags);
                    }}
                    className="create-item-form__tag-remove"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Extended Nutritional Information */}
        <div className="create-item-form__section">
          <div className="create-item-form__section-header">
            <h4>Nutritional Information</h4>
            <button
              type="button"
              className="create-item-form__toggle-btn"
              onClick={() => setShowNutrition(!showNutrition)}
            >
              {showNutrition ? '▼' : '▶'} {showNutrition ? 'Hide' : 'Show'} Nutrition Details
            </button>
          </div>

          {showNutrition && (
            <>
              <div className="create-item-form__row">
                <div className="create-item-form__field">
                  <label className="create-item-form__label">Calories</label>
                  <input
                    type="number"
                    min="0"
                    className="create-item-form__input"
                    value={formData.calories || ''}
                    onChange={(e) => handleInputChange('calories', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Preparation Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    className="create-item-form__input"
                    value={formData.preparationTime || ''}
                    onChange={(e) => handleInputChange('preparationTime', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                  />
                </div>
              </div>

              <h5>Macronutrients (grams)</h5>
              <div className="create-item-form__nutrition-grid">
                <div className="create-item-form__field">
                  <label className="create-item-form__label">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.protein || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      protein: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.carbs || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      carbs: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.fat || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      fat: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.fiber || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      fiber: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Sugar (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.sugar || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      sugar: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Saturated Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.saturatedFat || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      saturatedFat: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <h5>Minerals & Vitamins (mg)</h5>
              <div className="create-item-form__nutrition-grid">
                <div className="create-item-form__field">
                  <label className="create-item-form__label">Sodium (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.sodium || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      sodium: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Cholesterol (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.cholesterol || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      cholesterol: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Vitamin C (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.vitaminC || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      vitaminC: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Calcium (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.calcium || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      calcium: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>

                <div className="create-item-form__field">
                  <label className="create-item-form__label">Iron (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="create-item-form__input"
                    value={formData.nutritionalInfo?.iron || ''}
                    onChange={(e) => handleInputChange('nutritionalInfo', {
                      ...formData.nutritionalInfo,
                      iron: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="create-item-form__actions">
          <button
            type="button"
            className="create-item-form__button create-item-form__button--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-item-form__button create-item-form__button--primary"
            disabled={isSubmitting || isUploadingImage}
          >
            {isSubmitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
          </button>
        </div>
      </form>
    </div>
  );
}
