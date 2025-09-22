# FoodMenu - Документация системы управления ресторанными меню

## Обзор системы

FoodMenu - это веб-приложение для управления ресторанными меню, построенное на Next.js с TypeScript. Система позволяет владельцам ресторанов создавать и управлять своими заведениями и меню, а администраторам - контролировать всю платформу.

## Архитектура

- **Frontend**: Next.js 14 с TypeScript
- **Backend**: Next.js API Routes
- **База данных**: MongoDB с Mongoose ODM
- **Аутентификация**: JWT токены
- **Стили**: SCSS с модульной архитектурой

## Роли пользователей

### ADMIN

- Полный доступ к системе
- Управление всеми ресторанами
- Модерация контента
- Статистика платформы

### RESTAURANT_OWNER

- Управление собственными ресторанами
- Создание и редактирование меню
- Управление категориями и блюдами

## API Маршруты

### Аутентификация

#### POST /api/auth

**Описание**: Аутентификация и регистрация пользователей

**Параметры запроса**:

- `action`: "login" | "register"
- `email`: string (обязательно)
- `password`: string (обязательно)
- `name`: string (для регистрации)
- `phone`: string (опционально)
- `role`: UserRole (опционально, по умолчанию RESTAURANT_OWNER)

**Ответ при успехе**:

```json
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "ADMIN" | "RESTAURANT_OWNER",
    "status": "active" | "inactive" | "suspended"
  },
  "token": "jwt_token"
}
```

**Коды ошибок**:

- 400: Неверные параметры
- 401: Неверные учетные данные
- 409: Пользователь уже существует
- 500: Внутренняя ошибка сервера

### Управление ресторанами

#### GET /api/restaurants

**Описание**: Получение списка ресторанов с фильтрацией

**Query параметры**:

- `city`: string - фильтр по городу
- `cuisine`: string - фильтр по типу кухни
- `status`: RestaurantStatus - фильтр по статусу
- `owner`: string - фильтр по владельцу
- `my`: "true" - получить рестораны текущего пользователя (требует аутентификации)

**Ответ**:

```json
{
  "restaurants": [
    {
      "_id": "string",
      "name": "string",
      "slug": "string",
      "description": "string",
      "owner": {
        "name": "string",
        "email": "string"
      },
      "address": {
        "street": "string",
        "city": "string",
        "country": "string"
      },
      "contact": {
        "phone": "string",
        "email": "string"
      },
      "cuisineType": ["Italian", "Pizza"],
      "status": "active" | "inactive" | "pending" | "suspended",
      "createdAt": "ISO_date",
      "updatedAt": "ISO_date"
    }
  ],
  "count": number
}
```

#### POST /api/restaurants

**Описание**: Создание нового ресторана

**Требования**: Аутентификация (ADMIN или RESTAURANT_OWNER)

**Параметры запроса**:

- `name`: string (обязательно)
- `description`: string
- `address`: IAddress (обязательно)
- `contact`: IContact (обязательно)
- `cuisineType`: CuisineType[] (обязательно)
- `workingHours`: IWorkingHours[]
- `priceRange`: { min: number, max: number, currency: string }
- `features`: string[]

**Ответ при успехе**:

```json
{
  "message": "Restaurant created successfully",
  "restaurant": {
    /* объект ресторана */
  }
}
```

#### GET /api/restaurants/[id]

**Описание**: Получение конкретного ресторана

**Требования**: Аутентификация, доступ только владельцу

**Ответ**: Объект ресторана

#### PUT /api/restaurants/[id]

**Описание**: Обновление ресторана

**Требования**: Аутентификация, доступ только владельцу

**Параметры**: Те же, что при создании

#### DELETE /api/restaurants/[id]

**Описание**: Удаление ресторана

**Требования**: Аутентификация, доступ только владельцу

#### GET /api/restaurants/slug/[slug]

**Описание**: Получение ресторана по slug (URL-friendly идентификатор)

**Параметры URL**:

- `slug`: string - URL-friendly название ресторана

**Ответ**:

```json
{
  "restaurant": {
    "_id": "string",
    "name": "string",
    "slug": "string",
    "description": "string",
    "address": {...},
    "contact": {...},
    "cuisineType": ["string"],
    "status": "string"
  }
}
```

### Управление меню

#### GET /api/menu

**Описание**: Получение меню ресторана или всех меню пользователя

**Query параметры**:

- `restaurant`: string - ID ресторана
- `menu`: string - название конкретного меню
- `category`: string - фильтр по категории
- `search`: string - поиск по названию блюд
- `my`: "true" - получить все меню пользователя (требует аутентификации)

**Ответ**:

```json
{
  "menus": [
    {
      "_id": "string",
      "name": "string",
      "slug": "string",
      "description": "string",
      "currency": "EUR",
      "restaurant": {
        "_id": "string",
        "name": "string",
        "slug": "string"
      },
      "sections": [
        {
          "name": "string",
          "description": "string",
          "categories": [
            {
              "name": "string",
              "description": "string",
              "items": [
                {
                  "name": "string",
                  "description": "string",
                  "price": number,
                  "allergens": ["GLUTEN", "DAIRY"],
                  "isVegetarian": boolean,
                  "isVegan": boolean,
                  "status": "available" | "unavailable" | "out_of_stock"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### GET /api/menu/slug/[restaurantId]/[slug]

**Описание**: Получение меню по slug

**Параметры URL**:

- `restaurantId`: string - ID ресторана
- `slug`: string - URL-friendly название меню

**Ответ**:

```json
{
  "menu": {
    "_id": "string",
    "name": "string",
    "slug": "string",
    "description": "string",
    "currency": "EUR",
    "restaurant": {
      "_id": "string",
      "name": "string",
      "slug": "string"
    },
    "sections": [...]
  }
}
```

#### POST /api/menu

**Описание**: Создание или обновление меню

**Требования**: Аутентификация, доступ к ресторану

**Параметры запроса**:

- `restaurant`: string (обязательно)
- `name`: string (обязательно)
- `description`: string
- `currency`: string
- `sections`: IMenuSection[]

#### POST /api/menu/create

**Описание**: Создание нового пустого меню

**Требования**: Аутентификация, доступ к ресторану

**Параметры запроса**:

- `restaurantId`: string (обязательно)
- `name`: string (обязательно)
- `description`: string
- `currency`: string (по умолчанию "EUR")
- `isActive`: boolean (по умолчанию true)

#### GET /api/menu/[id]

**Описание**: Получение конкретного меню по ID

**Требования**: Аутентификация, доступ только владельцу ресторана

#### GET /api/menu/sections

**Описание**: Получение всех секций меню

**Query параметры**:

- `restaurant`: string (обязательно)
- `menu`: string (обязательно)

#### POST /api/menu/sections

**Описание**: Создание новой секции в меню

**Требования**: Аутентификация, доступ к ресторану

**Параметры запроса**:

- `restaurantId`: string (обязательно)
- `menuName`: string (обязательно)
- `sectionName`: string (обязательно)
- `description`: string
- `sortOrder`: number

#### PUT /api/menu/sections

**Описание**: Обновление секции меню

**Требования**: Аутентификация, доступ к ресторану

**Параметры запроса**:

- `restaurantId`: string (обязательно)
- `menuName`: string (обязательно)
- `sectionName`: string (обязательно)
- `newSectionName`: string
- `description`: string
- `sortOrder`: number
- `isActive`: boolean

#### GET /api/menu/categories

**Описание**: Получение всех категорий в секции

**Query параметры**:

- `restaurant`: string (обязательно)
- `menu`: string (обязательно)
- `section`: string (обязательно)

#### POST /api/menu/categories

**Описание**: Создание новой категории в секции

**Требования**: Аутентификация, доступ к ресторану

**Параметры запроса**:

- `restaurantId`: string (обязательно)
- `menuName`: string (обязательно)
- `sectionName`: string (обязательно)
- `categoryName`: string (обязательно)
- `description`: string
- `sortOrder`: number

#### POST /api/menu/items

**Описание**: Добавление блюда в категорию

**Требования**: Аутентификация, доступ к ресторану

**Параметры запроса**:

- `restaurantId`: string (обязательно)
- `menuName`: string (обязательно)
- `sectionName`: string (обязательно)
- `categoryName`: string (обязательно)
- `name`: string (обязательно)
- `description`: string
- `price`: number (обязательно)
- `allergens`: Allergen[]
- `isVegetarian`: boolean
- `isVegan`: boolean
- `isGlutenFree`: boolean
- `isSpicy`: boolean
- `spicyLevel`: number (1-5)
- `containsAlcohol`: boolean
- `calories`: number
- `preparationTime`: number (в минутах)
- `ingredients`: string[]
- `images`: string[]
- `nutritionalInfo`: object

## Страницы приложения

### Главная страница (/)

**Файл**: `src/app/page.tsx`

**Содержимое**:

- Заголовок сайта с навигацией
- Героическая секция с призывом к действию
- Секция с особенностями платформы
- Повторная героическая секция

**Компоненты**:

- `Header` - навигационная панель
- `Hero` - главный баннер
- `FeaturesSection` - блок с преимуществами

### Страница аутентификации (/auth)

**Файл**: `src/app/auth/page.tsx`

**Функциональность**:

- Переключение между входом и регистрацией
- Форма входа с полями email и password
- Форма регистрации с полями name, email, password, phone, role
- Автоматическое перенаправление после успешной аутентификации:
  - ADMIN → `/admin`
  - RESTAURANT_OWNER → `/user`
- Обработка ошибок и отображение сообщений
- Сохранение токена и данных пользователя в localStorage

**Состояния**:

- `isLogin`: переключение между формами
- `loginForm`: данные формы входа
- `registerForm`: данные формы регистрации
- `loading`: индикатор загрузки
- `error`: сообщения об ошибках

### Панель администратора (/admin)

**Файл**: `src/app/admin/page.tsx`

**Доступ**: Только для пользователей с ролью ADMIN

**Функциональность**:

- Проверка роли пользователя при загрузке
- Автоматическое перенаправление неавторизованных пользователей
- Загрузка списка всех ресторанов в системе
- Отображение статистики платформы

**Вкладки**:

1. **Overview** - общая статистика:

   - Общее количество ресторанов
   - Статистические карточки

2. **Restaurants** - управление ресторанами:

   - Список всех ресторанов с информацией
   - Отображение статуса каждого ресторана
   - Кнопки для просмотра деталей

3. **Users** - управление пользователями:
   - Заглушка для будущего функционала

**Состояния**:

- `user`: данные текущего пользователя
- `restaurants`: список всех ресторанов
- `loading`: индикатор загрузки
- `activeTab`: активная вкладка

### Панель владельца ресторана (/user)

**Файл**: `src/app/user/page.tsx`

**Доступ**: Для аутентифицированных пользователей

**Функциональность**:

- Управление ресторанами пользователя
- Управление меню ресторанов
- Создание новых ресторанов и меню

**Вкладки**:

1. **Restaurants** - управление ресторанами:

   - Список ресторанов пользователя
   - Форма создания нового ресторана
   - Редактирование существующих ресторанов
   - Отображение статуса ресторанов

2. **Menus** - управление меню:
   - Список всех меню пользователя
   - Форма создания нового меню
   - Переход к редактированию меню
   - Отображение статуса меню (активное/неактивное)

**Состояния**:

- `user`: данные пользователя
- `restaurants`: рестораны пользователя
- `menus`: меню пользователя
- `selectedRestaurant`: выбранный ресторан для создания меню
- `activeTab`: активная вкладка
- `showCreateForm`: показ формы создания ресторана
- `showCreateMenuForm`: показ формы создания меню
- `editingRestaurant`: ресторан в режиме редактирования

**Формы**:

- `RestaurantForm` - создание/редактирование ресторана
- `CreateMenuForm` - создание нового меню

### Управление меню (/menu/[id])

**Файл**: `src/app/menu/[id]/page.tsx`

**Доступ**: Только для владельца ресторана

**Функциональность**:

- Детальное управление конкретным меню
- Создание и редактирование секций
- Управление категориями внутри секций
- Добавление и редактирование блюд

**Основные возможности**:

1. **Управление секциями**:

   - Создание новых секций (например, "Кухня", "Бар", "Десерты")
   - Редактирование названий и описаний секций
   - Удаление секций
   - Сортировка секций

2. **Управление категориями**:

   - Добавление категорий в секции
   - Редактирование категорий
   - Удаление категорий

3. **Управление блюдами**:
   - Добавление новых блюд в категории
   - Редактирование информации о блюдах
   - Удаление блюд
   - Управление статусом блюд

**Компоненты**:

- `CreateSectionForm` - форма создания секции
- `CreateCategoryForm` - форма создания категории
- `CreateItemForm` - форма создания блюда
- `SectionCard` - карточка секции с категориями и блюдами

**Состояния**:

- `menu`: данные меню
- `loading`: индикатор загрузки
- `showCreateSectionForm`: показ формы создания секции
- `showCreateCategoryForm`: показ формы создания категории
- `showCreateItemForm`: показ формы создания блюда
- `editingSection`: секция в режиме редактирования
- `editingCategory`: категория в режиме редактирования
- `editingItem`: блюдо в режиме редактирования

## Модели данных

### User (Пользователь)

```typescript
interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  phone?: string;
  role: UserRole; // ADMIN | RESTAURANT_OWNER
  restaurants?: ObjectId[]; // Ссылки на рестораны для владельцев
  status: UserStatus; // active | inactive | suspended
  createdAt: Date;
  updatedAt: Date;
}
```

### Restaurant (Ресторан)

```typescript
interface IRestaurant {
  name: string;
  slug: string; // URL-friendly название для ссылок
  description?: string;
  owner: ObjectId; // Ссылка на пользователя-владельца
  address: IAddress;
  contact: IContact;
  cuisineType: CuisineType[];
  workingHours: IWorkingHours[];
  averageRating?: number;
  totalReviews?: number;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  features?: string[]; // WiFi, Parking, Delivery, etc.
  images?: string[];
  status: RestaurantStatus; // active | inactive | pending | suspended
  createdAt: Date;
  updatedAt: Date;
}
```

### Menu (Меню)

```typescript
interface IMenu {
  restaurant: ObjectId;
  name: string;
  slug: string; // URL-friendly название для ссылок
  description?: string;
  currency: string;
  sections: IMenuSection[];
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IMenuSection {
  name: string;
  description?: string;
  categories: IMenuCategory[];
  isActive: boolean;
  sortOrder?: number;
}

interface IMenuCategory {
  name: string;
  description?: string;
  items: IMenuItem[];
  isActive: boolean;
  sortOrder?: number;
}

interface IMenuItem {
  name: string;
  description?: string;
  price: number;
  sizes?: IMenuItemSize[];
  allergens?: Allergen[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spicyLevel?: number; // 1-5
  containsAlcohol: boolean;
  calories?: number;
  preparationTime?: number; // в минутах
  ingredients?: string[];
  images?: string[];
  nutritionalInfo?: INutritionalInfo;
  status: MenuItemStatus; // available | unavailable | out_of_stock
  sortOrder?: number;
}
```

## Типы и перечисления

### UserRole

```typescript
enum UserRole {
  ADMIN = "ADMIN",
  RESTAURANT_OWNER = "RESTAURANT_OWNER",
}
```

### RestaurantStatus

```typescript
enum RestaurantStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}
```

### CuisineType

```typescript
enum CuisineType {
  ITALIAN = "Italian",
  CHINESE = "Chinese",
  JAPANESE = "Japanese",
  MEXICAN = "Mexican",
  INDIAN = "Indian",
  FRENCH = "French",
  THAI = "Thai",
  GREEK = "Greek",
  AMERICAN = "American",
  MEDITERRANEAN = "Mediterranean",
  KOREAN = "Korean",
  VIETNAMESE = "Vietnamese",
  TURKISH = "Turkish",
  SPANISH = "Spanish",
  GERMAN = "German",
  BRITISH = "British",
  RUSSIAN = "Russian",
  LEBANESE = "Lebanese",
  MOROCCAN = "Moroccan",
  BRAZILIAN = "Brazilian",
  ARGENTINIAN = "Argentinian",
  PERUVIAN = "Peruvian",
  ETHIOPIAN = "Ethiopian",
  PIZZA = "Pizza",
  BURGER = "Burger",
  SEAFOOD = "Seafood",
  STEAKHOUSE = "Steakhouse",
  VEGETARIAN = "Vegetarian",
  VEGAN = "Vegan",
  FAST_FOOD = "Fast Food",
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
```

### MenuItemStatus

```typescript
enum MenuItemStatus {
  AVAILABLE = "available",
  UNAVAILABLE = "unavailable",
  OUT_OF_STOCK = "out_of_stock",
}
```

### Allergen

```typescript
enum Allergen {
  GLUTEN = "GLUTEN",
  DAIRY = "DAIRY",
  EGGS = "EGGS",
  FISH = "FISH",
  SHELLFISH = "SHELLFISH",
  TREE_NUTS = "TREE_NUTS",
  PEANUTS = "PEANUTS",
  SOY = "SOY",
  SESAME = "SESAME",
  SULFITES = "SULFITES",
  MUSTARD = "MUSTARD",
  CELERY = "CELERY",
  LUPIN = "LUPIN",
  MOLLUSCS = "MOLLUSCS",
}
```

## Безопасность и аутентификация

### JWT Токены

- Используются для аутентификации API запросов
- Содержат ID пользователя и роль
- Проверяются middleware функциями

### Middleware функции

- `requireAuth()` - проверка аутентификации
- `requireAdminOrOwner()` - проверка роли администратора или владельца
- `canAccessRestaurant()` - проверка доступа к конкретному ресторану

### Уровни доступа

1. **Публичный доступ**: Просмотр активных ресторанов и меню
2. **Аутентифицированный доступ**: Управление собственными ресторанами
3. **Административный доступ**: Полный контроль над платформой

## Обработка ошибок

### Стандартные коды ошибок

- **400**: Неверные параметры запроса
- **401**: Требуется аутентификация
- **403**: Доступ запрещен
- **404**: Ресурс не найден
- **409**: Конфликт (например, дублирование email)
- **500**: Внутренняя ошибка сервера

### Формат ответов с ошибками

```json
{
  "error": "Описание ошибки"
}
```

## Валидация данных

### На уровне базы данных (Mongoose)

- Обязательные поля
- Ограничения длины строк
- Валидация email и телефонов
- Проверка диапазонов чисел

### На уровне API

- Проверка наличия обязательных параметров
- Валидация прав доступа
- Проверка существования связанных объектов

## Производительность

### Оптимизации запросов

- Использование populate() для связанных данных
- Фильтрация неактивных элементов на уровне базы данных
- Сортировка по sortOrder полям

### Кэширование

- Токены JWT хранятся в localStorage
- Данные пользователя кэшируются в localStorage

## Развертывание и конфигурация

### Переменные окружения

- `MONGODB_URI` - строка подключения к MongoDB
- `JWT_SECRET` - секретный ключ для JWT токенов
- `NODE_ENV` - окружение (development/production)

### Зависимости

- Next.js 14
- React 18
- TypeScript
- Mongoose
- bcryptjs (для хеширования паролей)
- jsonwebtoken (для JWT)

## Компоненты приложения

### Основные компоненты

#### Header

**Файл**: `src/components/Header.tsx`

**Функциональность**:

- Навигационная панель с логотипом "DOMAIN"
- Меню навигации (Home, Features, Pricing, Contact)
- Кнопки действий (Docs, FAQ, Request demo)
- Переключатель языков с поддержкой EN, RU, DE
- Адаптивное мобильное меню
- Sticky позиционирование с blur эффектом

**Состояния**:

- `menuOpen`: управление мобильным меню
- `langOpen`: управление выпадающим списком языков
- `current`: текущий выбранный язык

#### Hero

**Файл**: `src/components/Hero.tsx`

**Функциональность**:

- Главная героическая секция с заголовком "DOMAIN"
- Подзаголовок "Where culinary stories begin"
- Градиентный фон с анимацией появления
- Полноэкранная высота

#### FeaturesSection

**Файл**: `src/components/FeaturesSection.tsx`

**Функциональность**:

- Секция с 4 основными особенностями платформы:
  1. Restaurant Directory - база данных ресторанов
  2. Live Menus - актуальные меню
  3. Authentic Reviews - отзывы клиентов
  4. Real-time Info - информация в реальном времени
- Анимированные подносы с блюдами по бокам
- Использует Framer Motion для анимаций
- Адаптивный дизайн

**Анимации**:

- Подносы выдвигаются при скролле
- Карточки особенностей появляются с задержкой
- Блюда на подносах имеют случайные позиции и вращения

#### LoadingSpinner

**Файл**: `src/components/ui/LoadingSpinner.tsx`

**Функциональность**:

- Индикатор загрузки с настраиваемыми размерами
- Поддержка полноэкранного режима
- Настраиваемый текст загрузки

### Формы управления

#### RestaurantForm

**Файл**: `src/components/RestaurantForm.tsx`

**Функциональность**:

- Создание и редактирование ресторанов
- Поля: название, описание, адрес, контакты, тип кухни, часы работы, ценовой диапазон, особенности
- Валидация обязательных полей
- Поддержка множественного выбора типов кухни

#### CreateMenuForm

**Файл**: `src/components/CreateMenuForm.tsx`

**Функциональность**:

- Создание новых меню для ресторанов
- Поля: название, описание, валюта, статус активности
- Выбор ресторана из списка пользователя

#### CreateSectionForm

**Файл**: `src/components/CreateSectionForm.tsx`

**Функциональность**:

- Создание секций меню (например, "Кухня", "Бар")
- Поля: название, описание, порядок сортировки
- Валидация уникальности названий

#### CreateCategoryForm

**Файл**: `src/components/CreateCategoryForm.tsx`

**Функциональность**:

- Создание категорий внутри секций
- Поля: название, описание, порядок сортировки
- Привязка к конкретной секции

#### CreateItemForm

**Файл**: `src/components/CreateItemForm.tsx`

**Функциональность**:

- Создание блюд в категориях
- Обширная форма с полями:
  - Основная информация: название, описание, цена
  - Диетические ограничения: вегетарианское, веганское, без глютена
  - Аллергены из предопределенного списка
  - Острота блюда (уровень 1-5)
  - Содержание алкоголя
  - Пищевая ценность: калории, время приготовления
  - Ингредиенты и изображения
- Валидация и обработка ошибок

#### SectionCard

**Файл**: `src/components/SectionCard.tsx`

**Функциональность**:

- Отображение секции меню с категориями и блюдами
- Возможности редактирования и удаления
- Добавление новых категорий и блюд
- Сворачивание/разворачивание секций
- Отображение количества элементов

## Утилиты и инфраструктура

### Подключение к базе данных

**Файл**: `src/lib/dbConnect.ts`

**Функциональность**:

- Управление подключением к MongoDB
- Кэширование соединения для предотвращения множественных подключений
- Обработка ошибок подключения
- Оптимизация для development режима

### Аутентификация

**Файл**: `src/lib/auth.ts`

**Функции**:

- `generateToken()` - создание JWT токенов
- `verifyToken()` - проверка токенов
- `hashPassword()` - хеширование паролей с солью
- `verifyPassword()` - проверка паролей
- `createUser()` - создание новых пользователей
- `authenticateUser()` - аутентификация пользователей
- `getUserFromToken()` - получение пользователя по токену

**Middleware функции**:

- `requireAuth()` - проверка аутентификации
- `requireAdmin()` - проверка роли администратора
- `requireRestaurantOwner()` - проверка роли владельца ресторана
- `requireAdminOrOwner()` - проверка роли админа или владельца
- `canAccessRestaurant()` - проверка доступа к ресторану

### Утилиты для slug

**Файл**: `src/lib/utils/slug.ts`

**Функции**:

- `generateSlug(text: string)` - создание URL-friendly slug из текста
  - Конвертирует в нижний регистр
  - Заменяет кириллицу на латиницу
  - Удаляет специальные символы
  - Заменяет пробелы на дефисы
- `generateUniqueSlug(baseSlug: string, existingSlugs: string[])` - создание уникального slug
- `isValidSlug(slug: string)` - валидация формата slug

**Особенности**:

- Поддержка кириллических символов с транслитерацией
- Автоматическая генерация уникальных slug при дублировании
- Валидация формата (только строчные буквы, цифры и дефисы)

### Глобальные типы

**Файл**: `src/types/global.d.ts`

**Содержимое**:

- Расширение глобального объекта для кэширования Mongoose соединения
- TypeScript декларации для глобальных переменных

## Конфигурация проекта

### Next.js конфигурация

**Файл**: `next.config.ts`

**Настройки**:

- Игнорирование ESLint ошибок при сборке
- Строгая проверка TypeScript ошибок
- Оптимизации для production

### TypeScript конфигурация

**Файл**: `tsconfig.json`

**Настройки**:

- Таргет ES2017
- Строгий режим TypeScript
- Алиасы путей (@/_ для src/_)
- Поддержка JSX и Next.js

### ESLint конфигурация

**Файл**: `eslint.config.mjs`

**Настройки**:

- Расширение Next.js правил
- Игнорирование build папок
- TypeScript поддержка

### Зависимости проекта

**Файл**: `package.json`

**Основные зависимости**:

- `next` - Next.js фреймворк
- `react` - React библиотека
- `typescript` - TypeScript поддержка
- `mongoose` - MongoDB ODM
- `bcryptjs` - хеширование паролей
- `jsonwebtoken` - JWT токены
- `framer-motion` - анимации
- `lucide-react` - иконки

**Скрипты**:

- `dev` - запуск development сервера
- `build` - сборка для production
- `start` - запуск production сервера
- `lint` - проверка кода ESLint

## Стилизация

### SCSS архитектура

**Файл**: `src/styles/main.scss`

**Структура**:

- Переменные и миксины
- Сброс стилей
- Компоненты главной страницы (hero, features, header)
- Пользовательские интерфейсы (auth, admin, user)
- Компоненты форм и управления
- Утилитарные классы

**Основные файлы стилей**:

- `_variables.scss` - цветовая палитра, шрифты, размеры
- `_mixins.scss` - переиспользуемые стили
- `_reset.scss` - сброс браузерных стилей
- Компонентные стили для каждого элемента интерфейса

## Особенности реализации

### Безопасность

- Хеширование паролей с уникальной солью для каждого пользователя
- JWT токены с проверкой подписи
- Middleware для проверки прав доступа
- Валидация данных на уровне API и базы данных

### Производительность

- Кэширование подключений к базе данных
- Оптимизация запросов с использованием индексов
- Lazy loading компонентов
- Оптимизация изображений и шрифтов

### Пользовательский опыт

- Адаптивный дизайн для всех устройств
- Анимации и переходы для улучшения восприятия
- Индикаторы загрузки
- Обработка ошибок с понятными сообщениями
- Интуитивная навигация

### Масштабируемость

- Модульная архитектура компонентов
- Разделение логики на слои (API, модели, компоненты)
- Типизация TypeScript для предотвращения ошибок
- Консистентная структура проекта

Эта документация покрывает все основные аспекты системы FoodMenu, включая API маршруты, страницы, компоненты, модели данных, утилиты и архитектурные решения.
