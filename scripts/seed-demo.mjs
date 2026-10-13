import dotenv from "dotenv";
import mongoose from "mongoose";
import { existsSync } from "node:fs";
import path from "node:path";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing from .env.local");

const image = (name) => `/img/editorial/${name}.webp`;
const dishImage = (name) => `/img/demo-dishes/${name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.webp`;
const dish = (name, description, price, _photo, extra = {}) => ({ name, description, price, images: [dishImage(name)], status: "available", allergens: [], ingredients: [], ...extra });
const category = (name, items, sortOrder = 0) => ({ name, description: "", isActive: true, sortOrder, items });
const section = (name, categories, sortOrder = 0) => ({ name, description: "", isActive: true, sortOrder, categories });
const hours = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => ({ day, open: "09:00", close: "22:00", isClosed: false }));

const venues = [
  {
    name: "Atelier Verde Demo", slug: "atelier-verde-demo", description: "A contemporary bistro built around seasonal produce and generous hospitality.", cuisineType: ["European", "Italian"], city: "Bucharest", street: "Demo Street 12", image: "bistro-table",
    menus: [
      { name: "Spring Menu", slug: "spring-menu", oldSlug: "lunch", description: "Fresh greens, gentle flavours and dishes for longer afternoons.", sections: [
        section("Food", [category("Vegetables", [dish("Roasted seasonal vegetables", "Whipped ricotta, herbs and toasted seeds.", 9, "vegetables", { isVegetarian: true, allergens: ["Dairy"] })]), category("Pasta", [dish("Mushroom tagliatelle", "Fresh pasta, wild mushrooms and parmesan.", 15, "bistro-table", { allergens: ["Gluten", "Dairy"], isPopular: true })], 1), category("Dessert", [dish("Lemon meringue tart", "Bright lemon curd and toasted meringue.", 8, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })], 2)]),
        section("Drinks", [category("Wine", [dish("House red", "A soft, fruit-led red by the glass.", 7, "wine-board", { containsAlcohol: true })])], 1),
      ] },
      { name: "Summer Menu", slug: "summer-menu", oldSlug: "dinner", description: "Bright plates and relaxed evenings at the table.", sections: [
        section("Food", [category("To share", [dish("Cheese & charcuterie", "A selection to share with bread and olives.", 17, "wine-board", { allergens: ["Dairy", "Gluten"] })]), category("Pizza", [dish("Margherita pizza", "Tomato, fresh basil and mozzarella.", 14, "pizza", { allergens: ["Gluten", "Dairy"] })], 1), category("Pasta", [dish("Mushroom tagliatelle", "Wild mushrooms, pasta and parmesan.", 16, "bistro-table", { allergens: ["Gluten", "Dairy"] })], 2)]),
        section("Drinks", [category("Wine", [dish("House red", "A smooth red served by the glass.", 7, "wine-board", { containsAlcohol: true })])], 1),
      ] },
    ],
  },
  {
    name: "Morning Theory Demo", slug: "morning-theory-demo", description: "A neighbourhood café for slow mornings, good coffee and thoughtful baking.", cuisineType: ["Cafe", "Bakery"], city: "Bucharest", street: "Demo Lane 8", image: "croissant",
    menus: [
      { name: "Spring Breakfast", slug: "spring-breakfast", oldSlug: "breakfast", description: "The best of the morning, with a little colour from the season.", sections: [
        section("Food", [category("Pastries", [dish("Butter croissant", "Baked fresh every morning.", 4, "croissant", { allergens: ["Gluten", "Dairy"] }), dish("Lemon meringue tart", "Lemon curd with toasted meringue.", 7, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })]), category("Brunch plates", [dish("Seasonal vegetable brunch", "Roasted vegetables, soft cheese and herbs.", 12, "vegetables", { isVegetarian: true, allergens: ["Dairy"] })], 1)]),
        section("Drinks", [category("Coffee", [dish("Cappuccino", "Double espresso and textured milk.", 5, "croissant", { allergens: ["Dairy"] })])], 1),
      ] },
      { name: "Weekend Specials", slug: "weekend-specials", oldSlug: "coffee-and-sweets", description: "A small collection for unhurried Saturdays and Sundays.", sections: [
        section("Food", [category("Bakery", [dish("Butter croissant", "Warm, flaky and made with butter.", 4, "croissant", { allergens: ["Gluten", "Dairy"] })]), category("Cake counter", [dish("Lemon meringue tart", "Crisp pastry and lemon curd.", 7, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })], 1)]),
        section("Drinks", [category("Coffee", [dish("Cappuccino", "A balanced double shot with steamed milk.", 5, "croissant", { allergens: ["Dairy"] })])], 1),
      ] },
    ],
  },
  {
    name: "Vesper Wine Bar Demo", slug: "vesper-wine-bar-demo", description: "A wine bar built around small plates, conversation and another glass.", cuisineType: ["Bar", "European"], city: "Bucharest", street: "Demo Avenue 21", image: "wine-board",
    menus: [
      { name: "Autumn Tasting", slug: "autumn-tasting", oldSlug: "small-plates", description: "A considered collection to share as the evenings grow longer.", sections: [
        section("Food", [category("Boards", [dish("Cheese & charcuterie board", "Artisan cheeses, cured meats, grapes and olives.", 19, "wine-board", { allergens: ["Dairy", "Nuts"], isRecommended: true })]), category("Warm plates", [dish("Roasted seasonal vegetables", "Herbs, ricotta and toasted seeds.", 10, "vegetables", { isVegetarian: true, allergens: ["Dairy"] }), dish("Mushroom tagliatelle", "Wild mushrooms and aged parmesan.", 16, "bistro-table", { allergens: ["Gluten", "Dairy"] })], 1)]),
        section("Drinks", [category("By the glass", [dish("House red", "A soft, fruit-led red by the glass.", 8, "wine-board", { containsAlcohol: true })])], 1),
      ] },
      { name: "Summer Evenings", slug: "summer-evenings", oldSlug: "drinks", description: "A lighter selection for warm nights and good company.", sections: [
        section("Food", [category("To share", [dish("Cheese & charcuterie board", "Artisan cheeses, cured meats, grapes and olives.", 19, "wine-board", { allergens: ["Dairy", "Nuts"] })]), category("From the kitchen", [dish("Margherita pizza", "Tomato, mozzarella and fresh basil.", 14, "pizza", { allergens: ["Gluten", "Dairy"] })], 1)]),
        section("Drinks", [category("Wine", [dish("House red", "A smooth red poured by the glass.", 8, "wine-board", { containsAlcohol: true })])], 1),
      ] },
    ],
  },
];

// Keep the demo collections substantial enough to exercise the guest menu layout.
const additions = {
  "spring-menu": [
    ["Food", "Vegetables", dish("Whipped ricotta & greens", "Warm seasonal vegetables, whipped ricotta and herbs.", 11, "vegetables", { isVegetarian: true, allergens: ["Dairy"] })],
    ["Food", "Vegetables", dish("Garden plate", "Roasted roots, leafy greens and toasted seeds.", 10, "vegetables", { isVegan: true })],
    ["Food", "Pasta", dish("Wild mushroom pappardelle", "Slow-cooked mushrooms and aged parmesan.", 17, "bistro-table", { allergens: ["Gluten", "Dairy"] })],
    ["Food", "Pasta", dish("Herb butter tagliatelle", "Fresh ribbons of pasta, herbs and parmesan.", 14, "bistro-table", { allergens: ["Gluten", "Dairy"], isVegetarian: true })],
    ["Food", "Dessert", dish("Lemon tart slice", "Crisp pastry, lemon curd and soft meringue.", 8, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })],
    ["Drinks", "Wine", dish("House white", "A crisp, citrus-led white by the glass.", 7, "wine-board", { containsAlcohol: true })],
    ["Drinks", "Coffee", dish("Espresso", "A rich, short coffee.", 3, "croissant")],
    ["Drinks", "Coffee", dish("Cappuccino", "Espresso with silky steamed milk.", 5, "croissant", { allergens: ["Dairy"] })],
  ],
  "summer-menu": [
    ["Food", "To share", dish("Artisan cheese board", "A selection of cheeses with grapes and olives.", 16, "wine-board", { allergens: ["Dairy"] })],
    ["Food", "To share", dish("Warm vegetable platter", "Seasonal vegetables with herbed ricotta.", 12, "vegetables", { isVegetarian: true, allergens: ["Dairy"] })],
    ["Food", "Pizza", dish("Garden pizza", "Tomato, mozzarella and roasted vegetables.", 16, "pizza", { isVegetarian: true, allergens: ["Gluten", "Dairy"] })],
    ["Food", "Pizza", dish("Basil & mozzarella pizza", "Slow tomato sauce, basil and fresh mozzarella.", 15, "pizza", { isVegetarian: true, allergens: ["Gluten", "Dairy"] })],
    ["Food", "Pasta", dish("Parmesan mushroom pasta", "Fresh pasta in a creamy mushroom sauce.", 17, "bistro-table", { allergens: ["Gluten", "Dairy"] })],
    ["Food", "Dessert", dish("Lemon meringue tart", "A bright finish with toasted meringue.", 8, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })],
    ["Drinks", "Wine", dish("House white", "Fresh and dry, served by the glass.", 7, "wine-board", { containsAlcohol: true })],
    ["Drinks", "Coffee", dish("Cappuccino", "Double espresso and steamed milk.", 5, "croissant", { allergens: ["Dairy"] })],
  ],
  "spring-breakfast": [
    ["Food", "Pastries", dish("Almond croissant", "A flaky morning pastry with almond filling.", 5, "croissant", { allergens: ["Gluten", "Dairy", "Nuts"] })],
    ["Food", "Pastries", dish("Warm pastry basket", "A selection of freshly baked croissants.", 10, "croissant", { allergens: ["Gluten", "Dairy"] })],
    ["Food", "Brunch plates", dish("Roasted garden plate", "Vegetables, herbs and a spoon of ricotta.", 13, "vegetables", { isVegetarian: true, allergens: ["Dairy"] })],
    ["Food", "Brunch plates", dish("Mushroom brunch pasta", "Fresh pasta with mushrooms and parmesan.", 15, "bistro-table", { allergens: ["Gluten", "Dairy"] })],
    ["Food", "Sweet counter", dish("Lemon tart slice", "Lemon curd and toasted meringue.", 7, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })],
    ["Drinks", "Coffee", dish("Espresso", "A short, balanced coffee.", 3, "croissant")],
    ["Drinks", "Coffee", dish("Flat white", "Double espresso with textured milk.", 5, "croissant", { allergens: ["Dairy"] })],
    ["Drinks", "Coffee", dish("Latte", "Espresso with steamed milk.", 5, "croissant", { allergens: ["Dairy"] })],
  ],
  "weekend-specials": [
    ["Food", "Bakery", dish("Almond croissant", "A crisp pastry with almond filling.", 5, "croissant", { allergens: ["Gluten", "Dairy", "Nuts"] })],
    ["Food", "Bakery", dish("Croissant basket", "Three warm, butter-rich pastries to share.", 11, "croissant", { allergens: ["Gluten", "Dairy"] })],
    ["Food", "Cake counter", dish("Lemon tart slice", "A smaller slice for the afternoon.", 6, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })],
    ["Food", "Brunch plates", dish("Ricotta & roasted vegetables", "A colourful plate with fresh herbs.", 13, "vegetables", { isVegetarian: true, allergens: ["Dairy"] })],
    ["Food", "Brunch plates", dish("Mushroom tagliatelle", "Fresh pasta, mushrooms and parmesan.", 15, "bistro-table", { allergens: ["Gluten", "Dairy"] })],
    ["Drinks", "Coffee", dish("Espresso", "Our short house coffee.", 3, "croissant")],
    ["Drinks", "Coffee", dish("Flat white", "Double espresso and silky milk.", 5, "croissant", { allergens: ["Dairy"] })],
    ["Drinks", "Coffee", dish("Latte", "A gentle milk coffee.", 5, "croissant", { allergens: ["Dairy"] })],
  ],
  "autumn-tasting": [
    ["Food", "Boards", dish("Artisan cheese selection", "Three cheeses, fruit and crisp bread.", 16, "wine-board", { allergens: ["Dairy", "Gluten"] })],
    ["Food", "Boards", dish("Cured meats & olives", "A generous plate for the table.", 17, "wine-board")],
    ["Food", "Warm plates", dish("Parmesan mushroom pasta", "Fresh pasta with mushrooms and aged cheese.", 17, "bistro-table", { allergens: ["Gluten", "Dairy"] })],
    ["Food", "Warm plates", dish("Garden vegetable plate", "Warm roots, herbs and toasted seeds.", 11, "vegetables", { isVegan: true })],
    ["Food", "Dessert", dish("Lemon meringue tart", "Bright citrus and crisp pastry.", 8, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })],
    ["Drinks", "By the glass", dish("House white", "A lively, dry white wine.", 8, "wine-board", { containsAlcohol: true })],
    ["Drinks", "By the glass", dish("House rosé", "Light and fruit-forward.", 8, "wine-board", { containsAlcohol: true })],
    ["Drinks", "Coffee", dish("Espresso", "A short coffee after dinner.", 3, "croissant")],
  ],
  "summer-evenings": [
    ["Food", "To share", dish("Cheese selection", "Artisan cheeses with fruit and olives.", 16, "wine-board", { allergens: ["Dairy"] })],
    ["Food", "To share", dish("Roasted vegetable board", "Warm vegetables and herbed ricotta.", 12, "vegetables", { isVegetarian: true, allergens: ["Dairy"] })],
    ["Food", "From the kitchen", dish("Garden pizza", "Mozzarella, basil and roasted vegetables.", 16, "pizza", { allergens: ["Gluten", "Dairy"], isVegetarian: true })],
    ["Food", "From the kitchen", dish("Mushroom tagliatelle", "Wild mushrooms and parmesan.", 17, "bistro-table", { allergens: ["Gluten", "Dairy"] })],
    ["Food", "Dessert", dish("Lemon tart", "Crisp pastry with lemon and meringue.", 8, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })],
    ["Drinks", "Wine", dish("House white", "A crisp white by the glass.", 8, "wine-board", { containsAlcohol: true })],
    ["Drinks", "Wine", dish("House rosé", "A light, refreshing rosé.", 8, "wine-board", { containsAlcohol: true })],
    ["Drinks", "Coffee", dish("Espresso", "A short coffee to finish.", 3, "croissant")],
  ],
};

for (const venue of venues) {
  for (const menu of venue.menus) {
    for (const [sectionName, categoryName, item] of additions[menu.slug] || []) {
      const targetSection = menu.sections.find((entry) => entry.name === sectionName);
      let targetCategory = targetSection.categories.find((entry) => entry.name === categoryName);
      if (!targetCategory) {
        targetCategory = category(categoryName, [], targetSection.categories.length);
        targetSection.categories.push(targetCategory);
      }
      targetCategory.items.push(item);
    }
  }
}

for (const venue of venues) {
  for (const menu of venue.menus) {
    for (const menuSection of menu.sections) {
      for (const menuCategory of menuSection.categories) {
        for (const menuDish of menuCategory.items) {
          const filePath = path.join(process.cwd(), "public", menuDish.images[0].slice(1));
          if (!existsSync(filePath)) throw new Error(`Missing generated image for ${menuDish.name}: ${filePath}`);
        }
      }
    }
  }
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  const db = mongoose.connection.db;
  const refresh = process.argv.includes("--refresh");
  const emailArg = process.argv.find((arg) => arg.startsWith("--owner="))?.slice(8);
  const owners = await db.collection("users").find(emailArg ? { role: "RESTAURANT_OWNER", email: emailArg } : { role: "RESTAURANT_OWNER" }).toArray();
  if (owners.length !== 1) throw new Error("Specify exactly one existing owner with --owner=email@example.com");
  let createdRestaurants = 0;
  let createdMenus = 0;
  for (const venue of venues) {
    const { menus, city, street, image: venueImage, ...venueFields } = venue;
    const restaurant = { ...venueFields, owner: owners[0]._id, status: "active", address: { street, city, country: "Romania" }, contact: {}, workingHours: hours, priceRange: { min: 4, max: 19, currency: "EUR" }, features: ["WiFi"], images: [image(venueImage)], createdAt: new Date(), updatedAt: new Date() };
    const restaurantFilter = { slug: venue.slug, owner: owners[0]._id };
    const upsert = await db.collection("restaurants").updateOne(restaurantFilter, { $setOnInsert: restaurant }, { upsert: true });
    if (upsert.upsertedCount) createdRestaurants++;
    if (refresh) await db.collection("restaurants").updateOne(restaurantFilter, { $set: { description: venue.description, priceRange: restaurant.priceRange, images: restaurant.images } });
    const saved = await db.collection("restaurants").findOne(restaurantFilter, { projection: { _id: 1 } });
    await db.collection("users").updateOne({ _id: owners[0]._id }, { $addToSet: { restaurants: saved._id } });
    for (const menu of menus) {
      const { oldSlug, ...menuFields } = menu;
      const filter = { restaurant: saved._id, slug: refresh ? { $in: [oldSlug, menu.slug] } : menu.slug };
      const coverImages = { "spring-menu": "vegetables", "summer-menu": "pizza", "spring-breakfast": "croissant", "weekend-specials": "tart", "autumn-tasting": "wine-board", "summer-evenings": "wine-board" };
      const values = { ...menuFields, restaurant: saved._id, coverImage: image(coverImages[menu.slug] || venueImage), currency: "EUR", isActive: true, lastUpdated: new Date(), updatedAt: new Date() };
      const result = await db.collection("menus").updateOne(filter, refresh ? { $set: values, $setOnInsert: { createdAt: new Date() } } : { $setOnInsert: { ...values, createdAt: new Date() } }, { upsert: true });
      if (result.upsertedCount) createdMenus++;
    }
  }
  console.log(`Demo data ready: ${createdRestaurants} restaurants and ${createdMenus} menus created${refresh ? " or refreshed" : ""}.`);
} finally { await mongoose.disconnect(); }
