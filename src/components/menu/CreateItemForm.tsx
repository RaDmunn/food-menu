"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

export interface ItemFormData {
  name: string;
  description: string;
  price: number;
  images?: string[];
  status?: string;
  allergens?: string[];
  ingredients?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  spicyLevel?: number;
  containsAlcohol?: boolean;
  calories?: number;
  preparationTime?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  isNewItem?: boolean;
  tags?: string[];
  [key: string]: unknown;
}

const ALLERGENS = ["Gluten", "Dairy", "Eggs", "Nuts", "Peanuts", "Shellfish", "Fish", "Soy", "Sesame", "Sulfites", "Celery", "Mustard", "Lupin", "Molluscs"];

export default function CreateItemForm({ restaurantId, onSubmit, onCancel, editingItem }: {
  restaurantId: string;
  menuName: string;
  sectionName: string;
  categoryName: string;
  onSubmit: (data: ItemFormData) => Promise<void>;
  onCancel: () => void;
  editingItem?: ItemFormData & { originalName?: string };
}) {
  const [data, setData] = useState<ItemFormData>({ name: "", description: "", price: 0, status: "available", images: [], allergens: [], ingredients: [], ...editingItem });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof ItemFormData>(key: K, value: ItemFormData[K]) => setData((previous) => ({ ...previous, [key]: value }));
  const toggleAllergen = (name: string) => update("allergens", data.allergens?.includes(name) ? data.allergens.filter((value) => value !== name) : [...(data.allergens || []), name]);

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const body = new FormData(); body.append("file", file); body.append("restaurantId", restaurantId);
      const response = await fetch("/api/uploads/menu-item-image", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      update("images", [result.url, ...(data.images || []).filter((image) => image !== result.url)]);
    } catch (err) { setError(err instanceof Error ? err.message : "Image upload failed."); }
    finally { setUploading(false); event.target.value = ""; }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!data.name.trim() || !data.description.trim() || data.price <= 0) { setError("Add a name, description and price above zero."); return; }
    setSaving(true); setError("");
    try { await onSubmit(data); } catch (err) { setError(err instanceof Error ? err.message : "Could not save dish."); }
    finally { setSaving(false); }
  };

  return <form className="dish-form" onSubmit={submit}>
    {error && <p className="dish-form__error" role="alert">{error}</p>}
    <div className="dish-form__row"><label>Dish name <span>*</span><input value={data.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Roasted seasonal vegetables" required /></label><label>Price <span>*</span><input type="number" step="0.01" min="0.01" value={data.price || ""} onChange={(event) => update("price", Number(event.target.value))} placeholder="0.00" required /></label></div>
    <label>Description <span>*</span><textarea value={data.description} onChange={(event) => update("description", event.target.value)} rows={3} placeholder="A short, helpful description for guests" required /></label>
    <div className="dish-form__row"><label>Availability<select value={data.status || "available"} onChange={(event) => update("status", event.target.value)}><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="seasonal">Seasonal</option></select></label><label>Preparation time (minutes)<input type="number" min="0" value={data.preparationTime ?? ""} onChange={(event) => update("preparationTime", event.target.value ? Number(event.target.value) : undefined)} placeholder="Optional" /></label></div>
    <div className="dish-form__photo"><div><strong>Dish photo</strong><p>Use a clear photo of the real dish. JPG, PNG or WEBP, up to 5 MB.</p></div><div className="dish-form__photo-content">{data.images?.[0] ? <div className="dish-form__preview"><Image src={data.images[0]} alt="Dish preview" fill unoptimized sizes="100px" /><button type="button" onClick={() => update("images", [])} aria-label="Remove photo"><X size={15} /></button></div> : <div className="dish-form__placeholder"><ImagePlus size={23} /></div>}<label className="dish-form__upload">{uploading ? "Uploading…" : data.images?.[0] ? "Change photo" : "Upload photo"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadImage} disabled={uploading} hidden /></label></div></div>
    <details className="dish-form__details"><summary>Dietary details and allergens</summary><div className="dish-form__details-body"><div className="dish-form__checks">{([ ["isVegetarian", "Vegetarian"], ["isVegan", "Vegan"], ["isGlutenFree", "Gluten free"], ["isSpicy", "Spicy"], ["containsAlcohol", "Contains alcohol"] ] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={!!data[key]} onChange={(event) => update(key, event.target.checked)} />{label}</label>)}</div>{data.isSpicy && <label>Spice level<select value={data.spicyLevel || 1} onChange={(event) => update("spicyLevel", Number(event.target.value))}>{[1,2,3,4,5].map((level) => <option key={level} value={level}>{level}</option>)}</select></label>}<strong>Allergens</strong><div className="dish-form__checks">{ALLERGENS.map((name) => <label key={name}><input type="checkbox" checked={!!data.allergens?.includes(name)} onChange={() => toggleAllergen(name)} />{name}</label>)}</div></div></details>
    <details className="dish-form__details"><summary>Additional information</summary><div className="dish-form__details-body"><label>Ingredients <small>Separate with commas</small><input value={(data.ingredients || []).join(", ")} onChange={(event) => update("ingredients", event.target.value.split(",").map((part) => part.trim()).filter(Boolean))} placeholder="Tomato, basil, olive oil" /></label><label>Calories<input type="number" min="0" value={data.calories ?? ""} onChange={(event) => update("calories", event.target.value ? Number(event.target.value) : undefined)} placeholder="Optional" /></label><label>Tags <small>Separate with commas</small><input value={(data.tags || []).join(", ")} onChange={(event) => update("tags", event.target.value.split(",").map((part) => part.trim()).filter(Boolean))} placeholder="Chef's choice, Bestseller" /></label><div className="dish-form__checks">{([ ["isPopular", "Popular"], ["isRecommended", "Recommended"], ["isNewItem", "New"] ] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={!!data[key]} onChange={(event) => update(key, event.target.checked)} />{label}</label>)}</div></div></details>
    <div className="dish-form__actions"><button type="button" onClick={onCancel}>Cancel</button><button type="submit" disabled={saving || uploading}>{saving ? "Saving…" : editingItem ? "Save changes" : "Add dish"}</button></div>
  </form>;
}
