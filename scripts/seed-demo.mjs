import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing from .env.local");

const image = (name) => `/img/editorial/${name}.webp`;
const dish = (name, description, price, photo, extra = {}) => ({ name, description, price, images: photo ? [image(photo)] : [], status: "available", allergens: [], ingredients: [], ...extra });
const category = (name, items, sortOrder = 0) => ({ name, description: "", isActive: true, sortOrder, items });
const section = (name, categories, sortOrder = 0) => ({ name, description: "", isActive: true, sortOrder, categories });
const hours = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => ({ day, open: "09:00", close: "22:00", isClosed: false }));

const venues = [
  {
    name: "Atelier Verde Demo", slug: "atelier-verde-demo", description: "A sample European bistro with seasonal produce and familiar dishes.", cuisineType: ["European", "Italian"], city: "Bucharest", street: "Demo Street 12", image: "bistro-table",
    menus: [
      { name: "Lunch", slug: "lunch", description: "A relaxed menu for the middle of the day.", sections: [
        section("Kitchen", [category("Starters", [dish("Roasted seasonal vegetables", "Whipped ricotta, herbs and toasted seeds.", 28, "vegetables", { isVegetarian: true, allergens: ["Dairy"] }), dish("Olives & warm bread", "Marinated olives with house bread.", 16)]), category("Mains", [dish("Mushroom tagliatelle", "Fresh pasta, wild mushrooms and parmesan.", 48, "bistro-table", { allergens: ["Gluten", "Dairy"], isPopular: true }), dish("Margherita pizza", "Tomato, mozzarella and basil on a slow fermented base.", 42, "pizza", { allergens: ["Gluten", "Dairy"] })], 1)]),
        section("Sweet finish", [category("Desserts", [dish("Lemon meringue tart", "Bright lemon curd and toasted meringue.", 24, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] }), dish("Vanilla panna cotta", "Seasonal berry compote.", 22, null, { allergens: ["Dairy"] })])], 1),
      ] },
      { name: "Dinner", slug: "dinner", description: "Evening dishes and a little time to linger.", sections: [
        section("To begin", [category("Small plates", [dish("Seasonal vegetable plate", "Slow roasted roots, ricotta and herbs.", 34, "vegetables", { isVegetarian: true, allergens: ["Dairy"] }), dish("Cheese & charcuterie", "A selection to share with bread and olives.", 58, "wine-board", { allergens: ["Dairy", "Gluten"] })])]),
        section("From the kitchen", [category("Mains", [dish("Mushroom tagliatelle", "Wild mushrooms, pasta and parmesan.", 54, "bistro-table", { allergens: ["Gluten", "Dairy"] }), dish("Margherita pizza", "Tomato, fresh basil and mozzarella.", 46, "pizza", { allergens: ["Gluten", "Dairy"] })])], 1),
      ] },
    ],
  },
  {
    name: "Morning Theory Demo", slug: "morning-theory-demo", description: "A sample neighbourhood café for slow breakfasts and good coffee.", cuisineType: ["Cafe", "Bakery"], city: "Bucharest", street: "Demo Lane 8", image: "croissant",
    menus: [
      { name: "Breakfast", slug: "breakfast", description: "Freshly baked favourites and morning plates.", sections: [
        section("Bakery", [category("Pastries", [dish("Butter croissant", "Baked fresh every morning.", 14, "croissant", { allergens: ["Gluten", "Dairy"] }), dish("Lemon meringue tart", "Lemon curd with toasted meringue.", 24, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] })])]),
        section("At the table", [category("Breakfast plates", [dish("Seasonal vegetable brunch", "Roasted vegetables, soft cheese and herbs.", 38, "vegetables", { isVegetarian: true, allergens: ["Dairy"] }), dish("Greek yoghurt & berries", "Honey, toasted oats and fresh berries.", 29, null, { isVegetarian: true, allergens: ["Dairy", "Gluten"] })])], 1),
      ] },
      { name: "Coffee & Sweets", slug: "coffee-and-sweets", description: "A short menu for the afternoon.", sections: [
        section("Coffee", [category("Espresso bar", [dish("Cappuccino", "Double espresso and textured milk.", 18, "croissant", { allergens: ["Dairy"] }), dish("Espresso", "A balanced double shot.", 13)])]),
        section("Something sweet", [category("Cake counter", [dish("Lemon meringue tart", "Crisp pastry and lemon curd.", 24, "tart", { allergens: ["Gluten", "Eggs", "Dairy"] }), dish("Daily bake", "Ask our team about today's fresh bake.", 20)])], 1),
      ] },
    ],
  },
  {
    name: "Vesper Wine Bar Demo", slug: "vesper-wine-bar-demo", description: "A sample wine bar built around small plates and conversation.", cuisineType: ["Bar", "European"], city: "Bucharest", street: "Demo Avenue 21", image: "wine-board",
    menus: [
      { name: "Small Plates", slug: "small-plates", description: "Something good to share.", sections: [
        section("For the table", [category("Boards", [dish("Cheese & charcuterie board", "Artisan cheeses, cured meats, grapes and olives.", 68, "wine-board", { allergens: ["Dairy", "Nuts"], isRecommended: true }), dish("Bread & cultured butter", "Warm sourdough and sea salt butter.", 20, null, { allergens: ["Gluten", "Dairy"] })])]),
        section("Warm plates", [category("From the kitchen", [dish("Roasted seasonal vegetables", "Herbs, ricotta and toasted seeds.", 34, "vegetables", { isVegetarian: true, allergens: ["Dairy"] }), dish("Mushroom tagliatelle", "Wild mushrooms and aged parmesan.", 52, "bistro-table", { allergens: ["Gluten", "Dairy"] })])], 1),
      ] },
      { name: "Drinks", slug: "drinks", description: "Wines, aperitifs and alcohol-free choices.", sections: [
        section("Wine", [category("By the glass", [dish("House red", "A soft, fruit-led red by the glass.", 29, "wine-board", { containsAlcohol: true }), dish("House white", "Crisp and fresh by the glass.", 29, null, { containsAlcohol: true })])]),
        section("Without alcohol", [category("Soft drinks", [dish("Sparkling water", "Chilled mineral water, 330 ml.", 12), dish("Citrus spritz", "Orange, lemon and sparkling soda.", 23)])], 1),
      ] },
    ],
  },
];

await mongoose.connect(process.env.MONGODB_URI);
try {
  const db = mongoose.connection.db;
  const emailArg = process.argv.find((arg) => arg.startsWith("--owner="))?.slice(8);
  const owners = await db.collection("users").find(emailArg ? { role: "RESTAURANT_OWNER", email: emailArg } : { role: "RESTAURANT_OWNER" }).toArray();
  if (owners.length !== 1) throw new Error("Specify exactly one existing owner with --owner=email@example.com");
  let createdRestaurants = 0;
  let createdMenus = 0;
  for (const venue of venues) {
    const { menus, city, street, image: venueImage, ...venueFields } = venue;
    const restaurant = {
      ...venueFields, owner: owners[0]._id, status: "active", address: { street, city, country: "Romania" }, contact: {},
      workingHours: hours, priceRange: { min: 12, max: 70, currency: "RON" }, features: ["WiFi"], images: [image(venueImage)], createdAt: new Date(), updatedAt: new Date(),
    };
    const upsert = await db.collection("restaurants").updateOne({ slug: venue.slug, owner: owners[0]._id }, { $setOnInsert: restaurant }, { upsert: true });
    if (upsert.upsertedCount) createdRestaurants++;
    const saved = await db.collection("restaurants").findOne({ slug: venue.slug, owner: owners[0]._id }, { projection: { _id: 1 } });
    await db.collection("users").updateOne({ _id: owners[0]._id }, { $addToSet: { restaurants: saved._id } });
    for (const menu of menus) {
      const result = await db.collection("menus").updateOne({ restaurant: saved._id, slug: menu.slug }, { $setOnInsert: { ...menu, restaurant: saved._id, currency: "RON", isActive: true, lastUpdated: new Date(), createdAt: new Date(), updatedAt: new Date() } }, { upsert: true });
      if (result.upsertedCount) createdMenus++;
    }
  }
  console.log(`Demo data ready: ${createdRestaurants} restaurants and ${createdMenus} menus created.`);
} finally { await mongoose.disconnect(); }
