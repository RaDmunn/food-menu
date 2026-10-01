import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing from .env.local");

const image = (name) => `/img/editorial/${name}.webp`;
const dish = (name, description, price, photo, extra = {}) => ({ name, description, price, images: [image(photo)], status: "available", allergens: [], ingredients: [], ...extra });
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
      const values = { ...menuFields, restaurant: saved._id, currency: "EUR", isActive: true, lastUpdated: new Date(), updatedAt: new Date() };
      const result = await db.collection("menus").updateOne(filter, refresh ? { $set: values, $setOnInsert: { createdAt: new Date() } } : { $setOnInsert: { ...values, createdAt: new Date() } }, { upsert: true });
      if (result.upsertedCount) createdMenus++;
    }
  }
  console.log(`Demo data ready: ${createdRestaurants} restaurants and ${createdMenus} menus created${refresh ? " or refreshed" : ""}.`);
} finally { await mongoose.disconnect(); }
