"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, BookOpen, Building2, CirclePlus, LayoutDashboard, LogOut, MapPin, Pencil, Plus, Settings2 } from "lucide-react";
import RestaurantForm, { type RestaurantFormData } from "@/components/restaurant/RestaurantForm";
import CreateMenuForm, { type MenuFormData } from "@/components/menu/CreateMenuForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";

interface Restaurant extends Partial<RestaurantFormData> {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  cuisineType: RestaurantFormData["cuisineType"];
  address: RestaurantFormData["address"];
}
interface Menu {
  _id: string;
  name: string;
  description: string;
  currency: string;
  isActive: boolean;
  restaurant: { _id: string; name: string };
  sections: Array<{ categories: Array<{ items: unknown[] }> }>;
}
type View = "overview" | "restaurants" | "menus" | "account";

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("all");
  const [view, setView] = useState<View>("overview");
  const [modal, setModal] = useState<"restaurant" | "menu" | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/auth"); return; }
    try {
      const account = JSON.parse(raw);
      if (account.role !== "RESTAURANT_OWNER") { router.replace("/auth"); return; }
      setUser(account);
    } catch { router.replace("/auth"); return; }
    Promise.all([fetch("/api/restaurants?my=true"), fetch("/api/menu?my=true")])
      .then(async ([restaurantResponse, menuResponse]) => {
        if (!restaurantResponse.ok || !menuResponse.ok) throw new Error("Could not load your workspace.");
        const [restaurantData, menuData] = await Promise.all([restaurantResponse.json(), menuResponse.json()]);
        setRestaurants(restaurantData.restaurants || []);
        setMenus(menuData.menus || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredMenus = useMemo(() => selectedRestaurantId === "all" ? menus : menus.filter((menu) => menu.restaurant?._id === selectedRestaurantId), [menus, selectedRestaurantId]);
  const menuCount = (restaurantId: string) => menus.filter((menu) => menu.restaurant?._id === restaurantId).length;
  const itemCount = (menu: Menu) => (menu.sections || []).reduce((sum, section) => sum + (section.categories || []).reduce((total, category) => total + (category.items?.length || 0), 0), 0);
  const closeModal = () => { setModal(null); setEditingRestaurant(null); setEditingMenu(null); setError(""); };
  const openRestaurant = (restaurant: Restaurant | null = null) => { setEditingRestaurant(restaurant); setModal("restaurant"); setError(""); };
  const openMenu = (menu: Menu | null = null, restaurantId?: string) => { setEditingMenu(menu); if (restaurantId) setSelectedRestaurantId(restaurantId); setModal("menu"); setError(""); };

  const saveRestaurant = async (data: RestaurantFormData) => {
    setBusy(true); setError("");
    try {
      const response = await fetch(editingRestaurant ? `/api/restaurants/${editingRestaurant._id}` : "/api/restaurants", { method: editingRestaurant ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save restaurant.");
      setRestaurants((previous) => editingRestaurant ? previous.map((restaurant) => restaurant._id === editingRestaurant._id ? result.restaurant : restaurant) : [result.restaurant, ...previous]);
      if (!editingRestaurant) { setSelectedRestaurantId(result.restaurant._id); setView("menus"); }
      closeModal();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save restaurant."); }
    finally { setBusy(false); }
  };

  const saveMenu = async (data: MenuFormData & { restaurantId: string }) => {
    setBusy(true); setError("");
    try {
      const response = await fetch(editingMenu ? `/api/menu/${editingMenu._id}` : "/api/menu/create", { method: editingMenu ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save menu.");
      setMenus((previous) => editingMenu ? previous.map((menu) => menu._id === editingMenu._id ? result.menu : menu) : [result.menu, ...previous]);
      closeModal();
      if (!editingMenu) router.push(`/menu/${result.menu._id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save menu."); }
    finally { setBusy(false); }
  };

  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); localStorage.removeItem("user"); router.push("/auth"); };
  if (loading) return <LoadingSpinner size="large" text="Loading workspace..." fullScreen />;

  const navigation: Array<{ key: View; label: string; icon: typeof LayoutDashboard }> = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "restaurants", label: "Restaurants", icon: Building2 },
    { key: "menus", label: "Menus", icon: BookOpen },
    { key: "account", label: "Account", icon: Settings2 },
  ];

  return <div className="owner-app">
    <aside className="owner-app__sidebar">
      <Link href="/" className="owner-app__brand"><span className="admin-app__wordmark">food<span>menu</span></span></Link>
      <span className="owner-app__nav-label">WORKSPACE</span>
      <nav aria-label="Owner workspace">{navigation.map(({ key, label, icon: Icon }) => <button key={key} type="button" className={view === key ? "is-active" : ""} onClick={() => setView(key)}><Icon size={19} strokeWidth={1.8} />{label}</button>)}</nav>
      <div className="owner-app__sidebar-bottom"><span>{user?.name}</span><small>Restaurant owner</small><button type="button" onClick={logout}><LogOut size={17} /> Sign out</button></div>
    </aside>
    <main className="owner-app__main">
      <header className="owner-app__topbar"><span>Owner workspace</span><div><span className="owner-app__avatar">{user?.name?.charAt(0).toUpperCase()}</span><strong>{user?.name}</strong></div></header>
      <div className="owner-app__content">
        {error && !modal && <div className="owner-app__error" role="alert">{error}</div>}
        {view === "overview" && <>
          <div className="owner-app__page-heading"><div><span className="owner-app__eyebrow">YOUR WORKSPACE</span><h1>Good to see you, {user?.name?.split(" ")[0]}.</h1><p>Manage your venues and keep every menu ready for guests.</p></div><button type="button" className="owner-app__primary" onClick={() => openRestaurant()}><Plus size={18} /> Add restaurant</button></div>
          <div className="owner-app__stats"><div><Building2 size={22} /><strong>{restaurants.length}</strong><span>Restaurants</span></div><div><BookOpen size={22} /><strong>{menus.length}</strong><span>Menus</span></div><div><CirclePlus size={22} /><strong>{menus.reduce((sum, menu) => sum + itemCount(menu), 0)}</strong><span>Menu items</span></div></div>
          <div className="owner-app__split-heading"><div><h2>Your restaurants</h2><p>Select a venue to manage its menus.</p></div><button type="button" onClick={() => setView("restaurants")}>View all <ArrowRight size={16} /></button></div>
          {restaurants.length ? <div className="owner-app__venue-grid">{restaurants.slice(0, 3).map((restaurant) => <RestaurantCard key={restaurant._id} restaurant={restaurant} menuCount={menuCount(restaurant._id)} onMenus={() => { setSelectedRestaurantId(restaurant._id); setView("menus"); }} onEdit={() => openRestaurant(restaurant)} />)}</div> : <Empty title="No restaurants yet" text="Start with a restaurant, then create its first menu." action="Add restaurant" onAction={() => openRestaurant()} />}
        </>}
        {view === "restaurants" && <><div className="owner-app__page-heading"><div><span className="owner-app__eyebrow">VENUES</span><h1>Restaurants</h1><p>Each venue can have its own menus and public page.</p></div><button type="button" className="owner-app__primary" onClick={() => openRestaurant()}><Plus size={18} /> Add restaurant</button></div>{restaurants.length ? <div className="owner-app__venue-grid">{restaurants.map((restaurant) => <RestaurantCard key={restaurant._id} restaurant={restaurant} menuCount={menuCount(restaurant._id)} onMenus={() => { setSelectedRestaurantId(restaurant._id); setView("menus"); }} onEdit={() => openRestaurant(restaurant)} />)}</div> : <Empty title="No restaurants yet" text="Add your first venue to start building menus." action="Add restaurant" onAction={() => openRestaurant()} />}</>}
        {view === "menus" && <><div className="owner-app__page-heading"><div><span className="owner-app__eyebrow">CONTENT</span><h1>Menus</h1><p>Create seasonal or special menus, then organize food and drinks inside each one.</p></div>{restaurants.length > 0 && <button type="button" className="owner-app__primary" onClick={() => openMenu()}><Plus size={18} /> Create menu</button>}</div>{restaurants.length > 1 && <div className="owner-app__filters"><label htmlFor="venue-filter">Restaurant</label><select id="venue-filter" value={selectedRestaurantId} onChange={(event) => setSelectedRestaurantId(event.target.value)}><option value="all">All restaurants</option>{restaurants.map((restaurant) => <option value={restaurant._id} key={restaurant._id}>{restaurant.name}</option>)}</select></div>}{filteredMenus.length ? <div className="owner-app__menu-list">{filteredMenus.map((menu) => <article key={menu._id} className="owner-app__menu-row"><div className="owner-app__menu-icon"><BookOpen size={23} /></div><div className="owner-app__menu-info"><div><h2>{menu.name}</h2><span className={`owner-app__status ${menu.isActive ? "is-live" : ""}`}>{menu.isActive ? "Published" : "Draft"}</span></div><p>{menu.restaurant?.name} · {menu.sections?.length || 0} sections · {itemCount(menu)} dishes · {menu.currency}</p></div><div className="owner-app__row-actions"><button type="button" onClick={() => openMenu(menu)} aria-label={`Edit ${menu.name} details`}><Pencil size={17} /></button><button type="button" className="owner-app__outline" onClick={() => router.push(`/menu/${menu._id}`)}>Manage menu <ArrowRight size={16} /></button></div></article>)}</div> : <Empty title="No menus here yet" text={restaurants.length ? "Create a menu, then add its sections, categories and dishes." : "Add a restaurant before creating a menu."} action={restaurants.length ? "Create menu" : "Add restaurant"} onAction={() => restaurants.length ? openMenu() : openRestaurant()} />}</>}
        {view === "account" && <><div className="owner-app__page-heading"><div><span className="owner-app__eyebrow">PROFILE</span><h1>Account</h1><p>Your owner account details.</p></div></div><div className="owner-app__account"><div><span>Name</span><strong>{user?.name}</strong></div><div><span>Email</span><strong>{user?.email}</strong></div><div><span>Role</span><strong>Restaurant owner</strong></div></div></>}
      </div>
    </main>
    {modal === "restaurant" && <Modal title={editingRestaurant ? "Edit restaurant" : "Add restaurant"} subtitle="Start with the essentials. You can update these details later." onClose={closeModal} wide><>{error && <div className="owner-app__error" role="alert">{error}</div>}<RestaurantForm key={editingRestaurant?._id || "new"} onSubmit={saveRestaurant} loading={busy} isEditing={!!editingRestaurant} initialData={editingRestaurant || undefined} /></></Modal>}
    {modal === "menu" && <Modal title={editingMenu ? "Edit menu" : "Create menu"} subtitle="Name a seasonal or special menu and choose its restaurant." onClose={closeModal}><>{error && <div className="owner-app__error" role="alert">{error}</div>}<CreateMenuForm key={editingMenu?._id || selectedRestaurantId} restaurants={restaurants} selectedRestaurantId={selectedRestaurantId === "all" ? restaurants[0]?._id : selectedRestaurantId} editingMenu={editingMenu} onSubmit={saveMenu} onCancel={closeModal} loading={busy} /></></Modal>}
  </div>;
}

function Empty({ title, text, action, onAction }: { title: string; text: string; action: string; onAction: () => void }) {
  return <div className="owner-app__empty"><BookOpen size={30} strokeWidth={1.4} /><h2>{title}</h2><p>{text}</p><button className="owner-app__primary" type="button" onClick={onAction}><Plus size={17} /> {action}</button></div>;
}

function RestaurantCard({ restaurant, menuCount, onMenus, onEdit }: { restaurant: Restaurant; menuCount: number; onMenus: () => void; onEdit: () => void }) {
  return <article className="owner-app__venue"><div className="owner-app__venue-top"><div className="owner-app__venue-icon"><Building2 size={23} /></div><span className={`owner-app__status ${restaurant.status === "active" ? "is-live" : ""}`}>{restaurant.status === "active" ? "Active" : restaurant.status === "pending" ? "Pending review" : restaurant.status}</span></div><h3>{restaurant.name}</h3><p>{restaurant.description || "Restaurant profile"}</p><div className="owner-app__venue-meta"><span><MapPin size={15} />{restaurant.address?.city || "Location not set"}</span><span><BookOpen size={15} />{menuCount} menus</span></div><div className="owner-app__venue-actions"><button type="button" onClick={onMenus}>Manage menus <ArrowUpRight size={16} /></button><button type="button" onClick={onEdit} aria-label={`Edit ${restaurant.name}`}><Pencil size={17} /></button></div></article>;
}
