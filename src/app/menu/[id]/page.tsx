"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Copy, ImageIcon, Pencil, Plus, QrCode as QrIcon, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import QrCode from "@/components/ui/QrCode";
import CreateSectionForm, { type SectionFormData } from "@/components/menu/CreateSectionForm";
import CreateCategoryForm, { type CategoryFormData } from "@/components/menu/CreateCategoryForm";
import CreateItemForm, { type ItemFormData } from "@/components/menu/CreateItemForm";

interface Dish extends ItemFormData { status: string; }
interface Category { name: string; description?: string; sortOrder?: number; items: Dish[]; }
interface Section { name: string; description?: string; sortOrder?: number; categories: Category[]; }
interface MenuData { _id: string; name: string; slug: string; description?: string; currency: string; isActive: boolean; restaurant: { _id: string; name: string; slug: string }; sections: Section[]; }
type Dialog = "section" | "category" | "dish" | null;

export default function MenuManagementPage() {
  const router = useRouter();
  const menuId = useParams().id as string;
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [sectionName, setSectionName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/auth"); return; }
    try { if (JSON.parse(raw).role !== "RESTAURANT_OWNER") { router.replace("/auth"); return; } }
    catch { router.replace("/auth"); return; }
    fetch(`/api/menu/${menuId}`).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load menu.");
      setMenu(result.menu);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [menuId, router]);

  const refresh = async () => {
    const response = await fetch(`/api/menu/${menuId}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not refresh menu.");
    setMenu(result.menu);
  };
  const request = async (path: string, method: string, body?: object) => {
    setError("");
    const response = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Could not save changes."); throw new Error(result.error || "Could not save changes."); }
    await refresh();
    return result;
  };
  const context = { restaurantId: menu?.restaurant._id || "", menuName: menu?.name || "" };
  const close = () => { setDialog(null); setEditingSection(null); setEditingCategory(null); setEditingDish(null); setError(""); };

  const saveSection = async (data: SectionFormData) => {
    await request("/api/menu/sections", editingSection ? "PUT" : "POST", editingSection
      ? { ...context, sectionName: editingSection.name, newSectionName: data.name, description: data.description, sortOrder: data.sortOrder }
      : { ...context, sectionName: data.name, description: data.description, sortOrder: data.sortOrder });
    setSectionName(data.name); setCategoryName(""); close();
  };
  const saveCategory = async (data: CategoryFormData) => {
    await request("/api/menu/categories", editingCategory ? "PUT" : "POST", editingCategory
      ? { ...context, sectionName: activeSection.name, categoryName: editingCategory.name, newCategoryName: data.name, description: data.description, sortOrder: data.sortOrder }
      : { ...context, sectionName: activeSection.name, categoryName: data.name, description: data.description, sortOrder: data.sortOrder });
    setCategoryName(data.name); close();
  };
  const saveDish = async (data: ItemFormData) => {
    await request("/api/menu/items", editingDish ? "PUT" : "POST", editingDish
      ? { ...context, sectionName: activeSection.name, categoryName: activeCategory.name, itemName: editingDish.name, updates: data }
      : { ...context, sectionName: activeSection.name, categoryName: activeCategory.name, ...data });
    close();
  };
  const remove = async (kind: "section" | "category" | "dish", name: string) => {
    const message = kind === "section" ? `Delete “${name}” and all its categories and dishes?` : kind === "category" ? `Delete “${name}” and all its dishes?` : `Delete “${name}”?`;
    if (!window.confirm(message)) return;
    const path = kind === "section" ? "sections" : kind === "category" ? "categories" : "items";
    const search = new URLSearchParams({ restaurant: context.restaurantId, menu: context.menuName, ...(kind !== "section" ? { section: activeSection.name } : { section: name }), ...(kind === "category" ? { category: name } : {}), ...(kind === "dish" ? { category: activeCategory.name, item: name } : {}) });
    try { await request(`/api/menu/${path}?${search}`, "DELETE"); if (kind === "section") { setSectionName(""); setCategoryName(""); } if (kind === "category") setCategoryName(""); }
    catch { /* Error is shown above the workspace. */ }
  };
  const openSection = (section: Section | null = null) => { setEditingSection(section); setDialog("section"); setError(""); };
  const openCategory = (category: Category | null = null) => { setEditingCategory(category); setDialog("category"); setError(""); };
  const openDish = (dish: Dish | null = null) => { setEditingDish(dish); setDialog("dish"); setError(""); };

  if (loading) return <LoadingSpinner size="large" text="Loading menu..." fullScreen />;
  if (!menu) return <div className="menu-editor__failure"><h1>Menu unavailable</h1><p>{error || "Menu not found."}</p><Link href="/user">Back to dashboard</Link></div>;

  const sections = [...menu.sections].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const activeSection = sections.find((section) => section.name === sectionName) || sections[0];
  const categories = activeSection ? [...activeSection.categories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : [];
  const activeCategory = categories.find((category) => category.name === categoryName) || categories[0];
  const totalDishes = menu.sections.reduce((sum, section) => sum + section.categories.reduce((count, category) => count + category.items.length, 0), 0);
  const publicUrl = origin && menu.restaurant.slug && menu.slug ? `${origin}/${menu.restaurant.slug}/${menu.slug}` : "";

  return <div className="menu-editor">
    <div className="menu-editor__topbar"><div className="container"><Link href="/user"><ArrowLeft size={17} /> Dashboard</Link><span>MENU EDITOR</span></div></div>
    <div className="container menu-editor__shell">
      <div className="menu-editor__heading"><div><span className="menu-editor__eyebrow">{menu.restaurant.name} <ArrowRight size={13} /> Menu</span><h1>{menu.name}</h1><p>{menu.description || "Organize sections, categories and dishes in one place."}</p><div className="menu-editor__meta"><span className={menu.isActive ? "is-live" : ""}>{menu.isActive ? "Published" : "Draft"}</span><span>{menu.currency}</span><span>{sections.length} sections</span><span>{totalDishes} dishes</span></div></div>{publicUrl && <a className="menu-editor__preview" href={publicUrl} target="_blank" rel="noopener noreferrer">Preview menu <ArrowUpRight size={17} /></a>}</div>
      {error && <div className="menu-editor__error" role="alert">{error}</div>}
      <div className="menu-editor__workspace">
        <aside className="menu-editor__sections"><div className="menu-editor__aside-heading"><div><span>STEP 1</span><h2>Sections</h2></div><button type="button" onClick={() => openSection()} aria-label="Add section"><Plus size={18} /></button></div><p>Separate food and drinks within this menu.</p><div className="menu-editor__section-list">{sections.map((section) => <button type="button" className={activeSection?.name === section.name ? "is-active" : ""} key={section.name} onClick={() => { setSectionName(section.name); setCategoryName(""); }}><BookOpen size={18} /><span>{section.name}</span><small>{section.categories.length}</small></button>)}</div>{!sections.length && <div className="menu-editor__aside-empty">No sections yet.<button type="button" onClick={() => openSection()}><Plus size={15} /> Add first section</button></div>}</aside>
        <div className="menu-editor__main">{activeSection ? <><div className="menu-editor__main-head"><div><span className="menu-editor__step">STEP 2 · SECTION</span><h2>{activeSection.name}</h2><p>{activeSection.description || "Choose a category to manage its dishes."}</p></div><div className="menu-editor__icon-actions"><button type="button" onClick={() => openSection(activeSection)} title="Edit section" aria-label="Edit section"><Pencil size={17} /></button><button type="button" onClick={() => remove("section", activeSection.name)} title="Delete section" aria-label="Delete section"><Trash2 size={17} /></button></div></div><div className="menu-editor__category-heading"><div><span className="menu-editor__step">STEP 3</span><h3>Categories</h3></div><button type="button" onClick={() => openCategory()}><Plus size={16} /> Add category</button></div>{categories.length ? <div className="menu-editor__category-tabs" role="tablist" aria-label="Categories">{categories.map((category) => <button type="button" role="tab" aria-selected={activeCategory?.name === category.name} className={activeCategory?.name === category.name ? "is-active" : ""} key={category.name} onClick={() => setCategoryName(category.name)}>{category.name}<span>{category.items.length}</span></button>)}</div> : <div className="menu-editor__inline-empty"><p>No categories in this section yet.</p><button type="button" onClick={() => openCategory()}><Plus size={16} /> Add category</button></div>}{activeCategory && <><div className="menu-editor__dishes-heading"><div><span className="menu-editor__step">STEP 4 · DISHES</span><h3>{activeCategory.name}</h3>{activeCategory.description && <p>{activeCategory.description}</p>}</div><div className="menu-editor__dishes-actions"><button type="button" onClick={() => openCategory(activeCategory)} title="Edit category" aria-label="Edit category"><Pencil size={17} /></button><button type="button" onClick={() => remove("category", activeCategory.name)} title="Delete category" aria-label="Delete category"><Trash2 size={17} /></button><button type="button" className="menu-editor__add-dish" onClick={() => openDish()}><Plus size={17} /> Add dish</button></div></div>{activeCategory.items.length ? <div className="menu-editor__dish-list">{activeCategory.items.map((dish) => <article className="menu-editor__dish" key={dish.name}><div className="menu-editor__dish-photo">{dish.images?.[0] ? <Image src={dish.images[0]} alt={dish.name} fill unoptimized sizes="70px" /> : <ImageIcon size={22} />}</div><div className="menu-editor__dish-info"><h4>{dish.name}</h4><p>{dish.description}</p><span className={dish.status === "available" ? "is-available" : ""}>{dish.status}</span></div><strong>{dish.price.toFixed(2)} {menu.currency}</strong><div className="menu-editor__icon-actions"><button type="button" onClick={() => openDish(dish)} title={`Edit ${dish.name}`} aria-label={`Edit ${dish.name}`}><Pencil size={17} /></button><button type="button" onClick={() => remove("dish", dish.name)} title={`Delete ${dish.name}`} aria-label={`Delete ${dish.name}`}><Trash2 size={17} /></button></div></article>)}</div> : <div className="menu-editor__inline-empty"><p>No dishes in this category yet.</p><button type="button" onClick={() => openDish()}><Plus size={16} /> Add first dish</button></div>}</>}</> : <div className="menu-editor__welcome"><BookOpen size={36} /><h2>Start with a section</h2><p>Sections hold categories, and categories hold dishes. Create the first section to begin.</p><button type="button" onClick={() => openSection()}><Plus size={17} /> Add section</button></div>}</div>
      </div>
      {publicUrl && <div className="menu-editor__share"><div><QrIcon size={23} /><div><h3>Share this menu</h3><p>Print the QR code or share the public link with guests.</p><a href={publicUrl} target="_blank" rel="noopener noreferrer">{publicUrl}</a></div></div><div className="menu-editor__share-actions"><button type="button" onClick={async () => { await navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 1600); }}><Copy size={16} /> {copied ? "Copied" : "Copy link"}</button><div className="menu-editor__qr"><QrCode value={publicUrl} size={86} /></div></div></div>}
    </div>
    {dialog === "section" && <Modal title={editingSection ? "Edit section" : "Add section"} subtitle="Use sections for Food and Drinks; add Pasta, Pizza or Cocktails as categories." onClose={close} error={error}><CreateSectionForm key={editingSection?.name || "new"} restaurantId={context.restaurantId} menuName={context.menuName} onSubmit={saveSection} onCancel={close} editingSection={editingSection ? { name: editingSection.name, description: editingSection.description || "", sortOrder: editingSection.sortOrder } : undefined} /></Modal>}
    {dialog === "category" && <Modal title={editingCategory ? "Edit category" : "Add category"} subtitle={`Organize dishes inside ${activeSection?.name}.`} onClose={close} error={error}><CreateCategoryForm key={editingCategory?.name || "new"} restaurantId={context.restaurantId} menuName={context.menuName} sectionName={activeSection.name} onSubmit={saveCategory} onCancel={close} editingCategory={editingCategory ? { name: editingCategory.name, description: editingCategory.description || "", sortOrder: editingCategory.sortOrder } : undefined} /></Modal>}
    {dialog === "dish" && <Modal title={editingDish ? "Edit dish" : "Add dish"} subtitle={`${activeSection.name} / ${activeCategory.name}`} onClose={close} error={error} wide><CreateItemForm key={editingDish?.name || "new"} restaurantId={context.restaurantId} menuName={context.menuName} sectionName={activeSection.name} categoryName={activeCategory.name} onSubmit={saveDish} onCancel={close} editingItem={editingDish || undefined} /></Modal>}
  </div>;
}
