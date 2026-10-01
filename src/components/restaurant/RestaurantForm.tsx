"use client";

import { useState, useRef, useEffect } from "react";
import { CuisineType } from "@/lib/types";

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
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
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

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  searchable?: boolean;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = searchable
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, searchable]);

  return (
    <div className="restaurant-form__custom-select" ref={selectRef}>
      <button
        type="button"
        className="restaurant-form__custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <svg
          className={`restaurant-form__custom-select-arrow ${
            isOpen ? "restaurant-form__custom-select-arrow--open" : ""
          }`}
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

      {isOpen && (
        <div className="restaurant-form__custom-select-dropdown">
          {searchable && (
            <div className="restaurant-form__custom-select-search">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="restaurant-form__custom-select-search-input"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="restaurant-form__custom-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`restaurant-form__custom-select-option ${
                    value === option.value
                      ? "restaurant-form__custom-select-option--selected"
                      : ""
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="restaurant-form__custom-select-no-results">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface RestaurantFormProps {
  onSubmit: (data: RestaurantFormData) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<RestaurantFormData>;
  isEditing?: boolean;
}

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const CUISINE_OPTIONS = Object.values(CuisineType);

const FEATURE_OPTIONS = [
  "WiFi",
  "Parking",
  "Delivery",
  "Takeout",
  "Outdoor Seating",
  "Live Music",
  "Pet Friendly",
  "Wheelchair Accessible",
  "Air Conditioning",
  "Reservations",
  "Credit Cards",
  "Cash Only",
  "Private Dining",
  "Catering",
  "Happy Hour",
  "Brunch",
  "Late Night",
  "Kids Menu",
  "Vegan Options",
  "Gluten Free Options",
  "Halal",
  "Kosher",
];

const COUNTRY_OPTIONS = [
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Italy", label: "Italy" },
  { value: "Spain", label: "Spain" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Belgium", label: "Belgium" },
  { value: "Austria", label: "Austria" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Ireland", label: "Ireland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Greece", label: "Greece" },
  { value: "Poland", label: "Poland" },
  { value: "Czech Republic", label: "Czech Republic" },
  { value: "Hungary", label: "Hungary" },
  { value: "Slovakia", label: "Slovakia" },
  { value: "Slovenia", label: "Slovenia" },
  { value: "Croatia", label: "Croatia" },
  { value: "Romania", label: "Romania" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Denmark", label: "Denmark" },
  { value: "Sweden", label: "Sweden" },
  { value: "Norway", label: "Norway" },
  { value: "Finland", label: "Finland" },
  { value: "Estonia", label: "Estonia" },
  { value: "Latvia", label: "Latvia" },
  { value: "Lithuania", label: "Lithuania" },
  { value: "Luxembourg", label: "Luxembourg" },
  { value: "Malta", label: "Malta" },
  { value: "Cyprus", label: "Cyprus" },
  { value: "Iceland", label: "Iceland" },
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Japan", label: "Japan" },
  { value: "South Korea", label: "South Korea" },
  { value: "Singapore", label: "Singapore" },
];

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "GBP", label: "GBP (£) - British Pound" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "PLN", label: "PLN - Polish Złoty" },
  { value: "CZK", label: "CZK - Czech Koruna" },
  { value: "HUF", label: "HUF - Hungarian Forint" },
  { value: "RON", label: "RON - Romanian Leu" },
  { value: "BGN", label: "BGN - Bulgarian Lev" },
  { value: "HRK", label: "HRK - Croatian Kuna" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "NZD", label: "NZD - New Zealand Dollar" },
  { value: "JPY", label: "JPY (¥) - Japanese Yen" },
  { value: "KRW", label: "KRW - South Korean Won" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
];

export default function RestaurantForm({
  onSubmit,
  loading = false,
  initialData,
  isEditing = false,
}: RestaurantFormProps) {
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    cuisineType: initialData?.cuisineType || [],
    address: {
      street: initialData?.address?.street || "",
      city: initialData?.address?.city || "",
      state: initialData?.address?.state || "",
      zipCode: initialData?.address?.zipCode || "",
      country: initialData?.address?.country || "",
    },
    contact: {
      phone: initialData?.contact?.phone || "",
      email: initialData?.contact?.email || "",
      website: initialData?.contact?.website || "",
      socialMedia: {
        instagram: initialData?.contact?.socialMedia?.instagram || "",
        facebook: initialData?.contact?.socialMedia?.facebook || "",
        twitter: initialData?.contact?.socialMedia?.twitter || "",
      },
    },
    workingHours:
      initialData?.workingHours ||
      DAYS_OF_WEEK.map((day) => ({
        day,
        open: "09:00",
        close: "22:00",
        isClosed: false,
      })),
    features: initialData?.features || [],
    priceRange: {
      min: initialData?.priceRange?.min || 10,
      max: initialData?.priceRange?.max || 50,
      currency: initialData?.priceRange?.currency || "EUR",
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Restaurant name is required";
    }

    if (formData.cuisineType.length === 0) {
      newErrors.cuisineType = "At least one cuisine type is required";
    }

    if (!formData.address.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.address.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector(
        ".restaurant-form__input--error, .restaurant-form__checkbox-grid--error"
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting restaurant form:", error);
    }
  };

  const handleCuisineChange = (cuisine: CuisineType) => {
    setFormData((prev) => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(cuisine)
        ? prev.cuisineType.filter((c) => c !== cuisine)
        : [...prev.cuisineType, cuisine],
    }));
  };

  const handleFeatureChange = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleWorkingHoursChange = (
    dayIndex: number,
    field: keyof (typeof formData.workingHours)[0],
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((day, index) =>
        index === dayIndex ? { ...day, [field]: value } : day
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="restaurant-form">
      {/* Basic Information */}
      <div className="restaurant-form__section">
        <h3 className="restaurant-form__section-title">Basic Information</h3>

        <div className="restaurant-form__field">
          <label className="restaurant-form__label">Restaurant Name *</label>
          <input
            type="text"
            className={`restaurant-form__input ${
              errors.name ? "restaurant-form__input--error" : ""
            }`}
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: "" }));
              }
            }}
            required
            placeholder="Enter restaurant name"
          />
          {errors.name && (
            <span className="restaurant-form__error">{errors.name}</span>
          )}
        </div>

        <div className="restaurant-form__field">
          <label className="restaurant-form__label">Description</label>
          <textarea
            className="restaurant-form__textarea"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Describe your restaurant"
            rows={3}
          />
        </div>

        <div className="restaurant-form__field">
          <label className="restaurant-form__label">Cuisine Types *</label>
          <div
            className={`restaurant-form__checkbox-grid ${
              errors.cuisineType ? "restaurant-form__checkbox-grid--error" : ""
            }`}
          >
            {CUISINE_OPTIONS.map((cuisine) => (
              <label key={cuisine} className="restaurant-form__checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.cuisineType.includes(cuisine)}
                  onChange={() => {
                    handleCuisineChange(cuisine);
                    if (errors.cuisineType) {
                      setErrors((prev) => ({ ...prev, cuisineType: "" }));
                    }
                  }}
                />
                <span className="restaurant-form__checkbox-label">
                  {cuisine}
                </span>
              </label>
            ))}
          </div>
          {errors.cuisineType && (
            <span className="restaurant-form__error">{errors.cuisineType}</span>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="restaurant-form__section">
        <h3 className="restaurant-form__section-title">Address</h3>

        <div className="restaurant-form__field">
          <label className="restaurant-form__label">Street Address *</label>
          <input
            type="text"
            className={`restaurant-form__input ${
              errors.street ? "restaurant-form__input--error" : ""
            }`}
            value={formData.address.street}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                address: { ...prev.address, street: e.target.value },
              }));
              if (errors.street) {
                setErrors((prev) => ({ ...prev, street: "" }));
              }
            }}
            required
            placeholder="Enter street address"
          />
          {errors.street && (
            <span className="restaurant-form__error">{errors.street}</span>
          )}
        </div>

        <div className="restaurant-form__row">
          <div className="restaurant-form__field">
            <label className="restaurant-form__label">City *</label>
            <input
              type="text"
              className={`restaurant-form__input ${
                errors.city ? "restaurant-form__input--error" : ""
              }`}
              value={formData.address.city}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value },
                }));
                if (errors.city) {
                  setErrors((prev) => ({ ...prev, city: "" }));
                }
              }}
              required
              placeholder="Enter city"
            />
            {errors.city && (
              <span className="restaurant-form__error">{errors.city}</span>
            )}
          </div>

          <div className="restaurant-form__field">
            <label className="restaurant-form__label">State/Province</label>
            <input
              type="text"
              className="restaurant-form__input"
              value={formData.address.state}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value },
                }))
              }
              placeholder="Enter state/province"
            />
          </div>
        </div>

        <div className="restaurant-form__row">
          <div className="restaurant-form__field">
            <label className="restaurant-form__label">ZIP Code</label>
            <input
              type="text"
              className="restaurant-form__input"
              value={formData.address.zipCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address: { ...prev.address, zipCode: e.target.value },
                }))
              }
              placeholder="Enter ZIP code"
            />
          </div>

          <div className="restaurant-form__field">
            <label className="restaurant-form__label">Country *</label>
            <CustomSelect
              value={formData.address.country}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  address: { ...prev.address, country: value },
                }))
              }
              options={COUNTRY_OPTIONS}
              placeholder="Select country"
              searchable={true}
            />
          </div>
        </div>
      </div>

      <details className="restaurant-form__optional" open={isEditing}>
        <summary>More details <span>Contact, opening hours and amenities</span></summary>
      {/* Contact Information */}
      <div className="restaurant-form__section">
        <h3 className="restaurant-form__section-title">Contact Information</h3>

        <div className="restaurant-form__row">
          <div className="restaurant-form__field">
            <label className="restaurant-form__label">Phone</label>
            <input
              type="tel"
              className="restaurant-form__input"
              value={formData.contact.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value },
                }))
              }
              placeholder="Enter phone number"
            />
          </div>

          <div className="restaurant-form__field">
            <label className="restaurant-form__label">Email</label>
            <input
              type="email"
              className="restaurant-form__input"
              value={formData.contact.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value },
                }))
              }
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div className="restaurant-form__field">
          <label className="restaurant-form__label">Website</label>
          <input
            type="url"
            className="restaurant-form__input"
            value={formData.contact.website}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                contact: { ...prev.contact, website: e.target.value },
              }))
            }
            placeholder="https://your-restaurant.com"
          />
        </div>

        <div className="restaurant-form__subsection">
          <h4 className="restaurant-form__subsection-title">
            Social Media (Optional)
          </h4>

          <div className="restaurant-form__row">
            <div className="restaurant-form__field">
              <label className="restaurant-form__label">Instagram</label>
              <input
                type="text"
                className="restaurant-form__input"
                value={formData.contact.socialMedia?.instagram || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      socialMedia: {
                        ...prev.contact.socialMedia,
                        instagram: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="@your_restaurant"
              />
            </div>

            <div className="restaurant-form__field">
              <label className="restaurant-form__label">Facebook</label>
              <input
                type="text"
                className="restaurant-form__input"
                value={formData.contact.socialMedia?.facebook || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      socialMedia: {
                        ...prev.contact.socialMedia,
                        facebook: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="Your Restaurant Page"
              />
            </div>
          </div>

          <div className="restaurant-form__field">
            <label className="restaurant-form__label">Twitter</label>
            <input
              type="text"
              className="restaurant-form__input"
              value={formData.contact.socialMedia?.twitter || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact: {
                    ...prev.contact,
                    socialMedia: {
                      ...prev.contact.socialMedia,
                      twitter: e.target.value,
                    },
                  },
                }))
              }
              placeholder="@your_restaurant"
            />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="restaurant-form__section">
        <h3 className="restaurant-form__section-title">Working Hours</h3>

        <div className="restaurant-form__working-hours">
          {formData.workingHours.map((dayHours, index) => (
            <div key={dayHours.day} className="restaurant-form__working-day">
              <div className="restaurant-form__day-header">
                <label className="restaurant-form__day-label">
                  {dayHours.day.charAt(0).toUpperCase() + dayHours.day.slice(1)}
                </label>
                <label className="restaurant-form__checkbox-item">
                  <input
                    type="checkbox"
                    checked={dayHours.isClosed}
                    onChange={(e) =>
                      handleWorkingHoursChange(
                        index,
                        "isClosed",
                        e.target.checked
                      )
                    }
                  />
                  <span className="restaurant-form__checkbox-label">
                    Closed
                  </span>
                </label>
              </div>

              {!dayHours.isClosed && (
                <div className="restaurant-form__time-inputs">
                  <div className="restaurant-form__time-field">
                    <label className="restaurant-form__time-label">Open</label>
                    <input
                      type="time"
                      className="restaurant-form__time-input"
                      value={dayHours.open}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, "open", e.target.value)
                      }
                    />
                  </div>
                  <div className="restaurant-form__time-field">
                    <label className="restaurant-form__time-label">Close</label>
                    <input
                      type="time"
                      className="restaurant-form__time-input"
                      value={dayHours.close}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, "close", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="restaurant-form__section">
        <h3 className="restaurant-form__section-title">Price Range</h3>

        <div className="restaurant-form__row">
          <div className="restaurant-form__field">
            <label className="restaurant-form__label">Minimum Price</label>
            <input
              type="number"
              className="restaurant-form__input"
              value={formData.priceRange.min}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priceRange: {
                    ...prev.priceRange,
                    min: Number(e.target.value),
                  },
                }))
              }
              min="0"
              step="0.01"
            />
          </div>

          <div className="restaurant-form__field">
            <label className="restaurant-form__label">Maximum Price</label>
            <input
              type="number"
              className="restaurant-form__input"
              value={formData.priceRange.max}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priceRange: {
                    ...prev.priceRange,
                    max: Number(e.target.value),
                  },
                }))
              }
              min="0"
              step="0.01"
            />
          </div>

          <div className="restaurant-form__field">
            <label className="restaurant-form__label">Currency</label>
            <CustomSelect
              value={formData.priceRange.currency}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  priceRange: { ...prev.priceRange, currency: value },
                }))
              }
              options={CURRENCY_OPTIONS}
              placeholder="Select currency"
              searchable={true}
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="restaurant-form__section">
        <h3 className="restaurant-form__section-title">Features & Amenities</h3>

        <div className="restaurant-form__checkbox-grid">
          {FEATURE_OPTIONS.map((feature) => (
            <label key={feature} className="restaurant-form__checkbox-item">
              <input
                type="checkbox"
                checked={formData.features.includes(feature)}
                onChange={() => handleFeatureChange(feature)}
              />
              <span className="restaurant-form__checkbox-label">{feature}</span>
            </label>
          ))}
        </div>
      </div>
      </details>

      <div className="restaurant-form__actions">
        <button
          type="submit"
          className="restaurant-form__submit-btn"
          disabled={
            loading || !formData.name || formData.cuisineType.length === 0
          }
        >
          {loading
            ? isEditing
              ? "Updating Restaurant..."
              : "Creating Restaurant..."
            : isEditing
            ? "Update Restaurant"
            : "Create Restaurant"}
        </button>
      </div>
    </form>
  );
}
