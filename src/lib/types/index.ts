// Enum для типа кухни
export enum CuisineType {
  ITALIAN = "Italian",
  CHINESE = "Chinese",
  JAPANESE = "Japanese",
  MEXICAN = "Mexican",
  INDIAN = "Indian",
  FRENCH = "French",
  AMERICAN = "American",
  MEDITERRANEAN = "Mediterranean",
  THAI = "Thai",
  KOREAN = "Korean",
  VIETNAMESE = "Vietnamese",
  GREEK = "Greek",
  SPANISH = "Spanish",
  TURKISH = "Turkish",
  LEBANESE = "Lebanese",
  GERMAN = "German",
  BRITISH = "British",
  BRAZILIAN = "Brazilian",
  PERUVIAN = "Peruvian",
  ETHIOPIAN = "Ethiopian",
  MOROCCAN = "Moroccan",
  EUROPEAN = "European",
  ASIAN = "Asian",
  MIDDLE_EASTERN = "Middle Eastern",
  AFRICAN = "African",
  FUSION = "Fusion",
  VEGETARIAN = "Vegetarian",
  VEGAN = "Vegan",
  FAST_FOOD = "Fast Food",
  SEAFOOD = "Seafood",
  STEAKHOUSE = "Steakhouse",
  PIZZA = "Pizza",
  SUSHI = "Sushi",
  BAKERY = "Bakery",
  CAFE = "Cafe",
  BAR = "Bar",
  BUFFET = "Buffet",
  FINE_DINING = "Fine Dining",
  CASUAL_DINING = "Casual Dining",
  FOOD_TRUCK = "Food Truck",
  DELI = "Deli",
  DESSERT = "Dessert",
  OTHER = "Other",
}

// Enum для статуса ресторана
export enum RestaurantStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

// Интерфейс для часов работы
export interface IWorkingHours {
  day: string; // 'monday', 'tuesday', etc.
  open: string; // '09:00'
  close: string; // '22:00'
  isClosed: boolean;
}

// Интерфейс для адреса
export interface IAddress {
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Интерфейс для контактной информации
export interface IContact {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

// Интерфейс для ценового диапазона
export interface IPriceRange {
  min: number;
  max: number;
  currency: string;
}
