"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Inbox, LayoutDashboard, LogOut, Search, Users } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";

type View = "overview" | "restaurants" | "owners" | "enquiries";
type Restaurant = { _id: string; name: string; slug: string; status: "pending" | "active" | "inactive" | "suspended"; owner?: { name: string; email: string }; address?: { city: string }; description?: string; createdAt: string };
type Account = { _id: string; name: string; email: string; phone?: string; role: "ADMIN" | "RESTAURANT_OWNER"; status: "ACTIVE" | "INACTIVE" | "SUSPENDED"; createdAt: string };
type Enquiry = { _id: string; name: string; email: string; phone?: string; restaurant?: string; message: string; status: "new" | "read"; createdAt: string };
type Overview = { users: { total: number; owners: number; active: number }; restaurants: { total: number; active: number; pending: number }; menus: { total: number; active: number } };

const navigation = [
  { key: "overview" as View, label: "Overview", icon: LayoutDashboard },
  { key: "restaurants" as View, label: "Restaurants", icon: Building2 },
  { key: "owners" as View, label: "Accounts", icon: Users },
  { key: "enquiries" as View, label: "Enquiries", icon: Inbox },
];
const date = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function AdminPage() {
  const router = useRouter();
  const [account, setAccount] = useState<{ name: string; email: string } | null>(null);
  const [view, setView] = useState<View>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<Account[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selected, setSelected] = useState<Restaurant | Account | Enquiry | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const endpoints = ["/api/admin/overview", "/api/admin/restaurants?limit=200", "/api/admin/users?limit=200", "/api/contact"];
      const responses = await Promise.all(endpoints.map((url) => fetch(url)));
      if (responses.some((response) => !response.ok)) throw new Error("Could not load the admin workspace.");
      const [summary, venues, accounts, messages] = await Promise.all(responses.map((response) => response.json()));
      const venueList: Restaurant[] = venues.restaurants || [];
      const accountList: Account[] = accounts.users || [];
      const enquiryList: Enquiry[] = messages.requests || [];
      for (let page = 2; page <= (venues.pagination?.pages || 1); page++) {
        const response = await fetch(`/api/admin/restaurants?limit=200&page=${page}`);
        if (!response.ok) throw new Error("Could not load all restaurants.");
        venueList.push(...((await response.json()).restaurants || []));
      }
      for (let page = 2; page <= (accounts.pagination?.pages || 1); page++) {
        const response = await fetch(`/api/admin/users?limit=200&page=${page}`);
        if (!response.ok) throw new Error("Could not load all accounts.");
        accountList.push(...((await response.json()).users || []));
      }
      for (let page = 2; page <= (messages.pagination?.pages || 1); page++) {
        const response = await fetch(`/api/contact?page=${page}`);
        if (!response.ok) throw new Error("Could not load all enquiries.");
        enquiryList.push(...((await response.json()).requests || []));
      }
      setOverview(summary); setRestaurants(venueList); setUsers(accountList); setEnquiries(enquiryList);
      setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load data."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    try {
      const current = JSON.parse(localStorage.getItem("user") || "null");
      if (current?.role !== "ADMIN") { router.replace("/auth"); return; }
      setAccount(current); void refresh();
    } catch { router.replace("/auth"); }
  }, [router]);

  const rows = useMemo(() => {
    const needle = search.toLowerCase().trim();
    if (view === "restaurants") return restaurants.filter((item) => (filter === "all" || item.status === filter) && `${item.name} ${item.owner?.name || ""} ${item.address?.city || ""}`.toLowerCase().includes(needle));
    if (view === "owners") return users.filter((item) => (filter === "all" || item.status === filter) && `${item.name} ${item.email}`.toLowerCase().includes(needle));
    return enquiries.filter((item) => (filter === "all" || item.status === filter) && `${item.name} ${item.email} ${item.restaurant || ""}`.toLowerCase().includes(needle));
  }, [view, restaurants, users, enquiries, search, filter]);

  const update = async (kind: "restaurant" | "user" | "enquiry", id: string, status: string) => {
    setBusy(true); setError("");
    const path = kind === "restaurant" ? `/api/admin/restaurants/${id}/status` : kind === "user" ? `/api/admin/users/${id}/status` : `/api/contact/${id}`;
    try {
      const response = await fetch(path, { method: kind === "enquiry" ? "PATCH" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error || "Could not update status."); }
      setSelected(null); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update status."); }
    finally { setBusy(false); }
  };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); localStorage.removeItem("user"); router.push("/auth"); };
  if (loading) return <LoadingSpinner fullScreen text="Loading admin workspace..." />;

  const newCount = enquiries.filter((item) => item.status === "new").length;
  return <div className="owner-app admin-app">
    <aside className="owner-app__sidebar"><Link href="/" className="owner-app__brand"><span className="admin-app__wordmark">food<span>menu</span></span></Link><span className="owner-app__nav-label">PLATFORM</span><nav aria-label="Platform admin">{navigation.map(({ key, label, icon: Icon }) => <button type="button" key={key} className={view === key ? "is-active" : ""} onClick={() => { setView(key); setFilter("all"); setSearch(""); }}><Icon size={19} strokeWidth={1.8} />{label}{key === "enquiries" && newCount > 0 && <b>{newCount}</b>}</button>)}</nav><div className="owner-app__sidebar-bottom"><span>{account?.name}</span><small>Platform administrator</small><button type="button" onClick={logout}><LogOut size={17} /> Sign out</button></div></aside>
    <main className="owner-app__main"><header className="owner-app__topbar"><span>Platform / {navigation.find((item) => item.key === view)?.label}</span><div><span className="owner-app__avatar">{account?.name?.charAt(0)}</span><strong>{account?.name}</strong></div></header><div className="owner-app__content">
      {error && <div className="owner-app__error" role="alert">{error}</div>}
      {view === "overview" ? <><div className="owner-app__page-heading"><div><span className="owner-app__eyebrow">PLATFORM OVERVIEW</span><h1>Good to see you, {account?.name?.split(" ")[0]}.</h1><p>Review venues, accounts and incoming requests from one place.</p></div></div><div className="admin-app__stats"><Stat value={overview?.restaurants.total || 0} label="Restaurants" detail={`${overview?.restaurants.pending || 0} awaiting review`} icon={Building2} /><Stat value={overview?.users.owners || 0} label="Restaurant owners" detail={`${overview?.users.active || 0} active accounts`} icon={Users} /><Stat value={overview?.menus.total || 0} label="Menus" detail={`${overview?.menus.active || 0} published`} icon={LayoutDashboard} /><Stat value={newCount} label="New enquiries" detail={`${enquiries.length} total messages`} icon={Inbox} /></div><div className="admin-app__overview-grid"><section className="admin-app__panel"><div className="owner-app__split-heading"><div><h2>Restaurants to review</h2><p>Approve or inspect new venues.</p></div><button onClick={() => setView("restaurants")}>View all <ArrowRight size={16} /></button></div>{restaurants.filter((item) => item.status === "pending").slice(0, 5).map((item) => <button className="admin-app__quick-row" key={item._id} onClick={() => { setView("restaurants"); setSelected(item); }}><span><strong>{item.name}</strong><small>{item.owner?.name || "Owner"} · {item.address?.city}</small></span><Status value={item.status} /></button>)}{!restaurants.some((item) => item.status === "pending") && <p className="admin-app__empty">No restaurants waiting for review.</p>}</section><section className="admin-app__panel"><div className="owner-app__split-heading"><div><h2>Recent enquiries</h2><p>Messages from potential partners.</p></div><button onClick={() => setView("enquiries")}>View all <ArrowRight size={16} /></button></div>{enquiries.slice(0, 5).map((item) => <button className="admin-app__quick-row" key={item._id} onClick={() => { setView("enquiries"); setSelected(item); }}><span><strong>{item.name}</strong><small>{item.restaurant || item.email}</small></span><Status value={item.status} /></button>)}{!enquiries.length && <p className="admin-app__empty">No enquiries yet.</p>}</section></div></> : <><div className="owner-app__page-heading"><div><span className="owner-app__eyebrow">MANAGEMENT</span><h1>{view === "restaurants" ? "Restaurants" : view === "owners" ? "Accounts" : "Enquiries"}</h1><p>{view === "restaurants" ? "Review every venue and its publication status." : view === "owners" ? "Manage owner access and platform accounts." : "Read and manage access requests from the website."}</p></div><strong className="admin-app__count">{rows.length} records</strong></div><div className="admin-app__toolbar"><label><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${view}…`} /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter status">{(view === "restaurants" ? ["all", "pending", "active", "inactive", "suspended"] : view === "owners" ? ["all", "ACTIVE", "INACTIVE", "SUSPENDED"] : ["all", "new", "read"]).map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : status}</option>)}</select></div><div className="admin-app__table-wrap"><table className="admin-app__table"><thead><tr><th>{view === "restaurants" ? "Restaurant" : view === "owners" ? "Account" : "Enquiry"}</th><th>{view === "restaurants" ? "Owner" : view === "owners" ? "Role" : "Venue"}</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>{rows.map((row) => <tr key={row._id}><td><strong>{"restaurant" in row ? row.name : row.name}</strong><small>{view === "restaurants" ? (row as Restaurant).address?.city : (row as Account | Enquiry).email}</small></td><td>{view === "restaurants" ? (row as Restaurant).owner?.name || "—" : view === "owners" ? (row as Account).role === "ADMIN" ? "Administrator" : "Restaurant owner" : (row as Enquiry).restaurant || "—"}</td><td><Status value={row.status} /></td><td>{date(row.createdAt)}</td><td><button className="admin-app__view" onClick={() => setSelected(row)}>View <ArrowRight size={15} /></button></td></tr>)}</tbody></table>{!rows.length && <p className="admin-app__empty">No records match this view.</p>}</div></>}
    </div></main>
    {selected && <Modal title={selected.name} subtitle={"message" in selected ? "Website enquiry" : "role" in selected ? "Platform account" : "Restaurant details"} onClose={() => setSelected(null)} error={error}>{"message" in selected ? <div className="admin-app__detail"><Detail label="Email" value={selected.email} /><Detail label="Phone" value={selected.phone || "—"} /><Detail label="Restaurant" value={selected.restaurant || "—"} /><Detail label="Received" value={date(selected.createdAt)} /><div><span>Message</span><p>{selected.message}</p></div><div className="admin-app__actions"><a href={`mailto:${selected.email}`}>Reply by email ↗</a><button disabled={busy} onClick={() => update("enquiry", selected._id, selected.status === "new" ? "read" : "new")}>Mark {selected.status === "new" ? "as read" : "unread"}</button></div></div> : "role" in selected ? <div className="admin-app__detail"><Detail label="Email" value={selected.email} /><Detail label="Phone" value={selected.phone || "—"} /><Detail label="Role" value={selected.role === "ADMIN" ? "Administrator" : "Restaurant owner"} /><Detail label="Joined" value={date(selected.createdAt)} /><div className="admin-app__actions"><select value={selected.status} disabled={busy} onChange={(event) => update("user", selected._id, event.target.value)} aria-label="Account status">{["ACTIVE", "INACTIVE", "SUSPENDED"].map((status) => <option key={status}>{status}</option>)}</select></div></div> : <div className="admin-app__detail"><Detail label="Owner" value={selected.owner?.name || "—"} /><Detail label="Owner email" value={selected.owner?.email || "—"} /><Detail label="Location" value={selected.address?.city || "—"} /><Detail label="Created" value={date(selected.createdAt)} />{selected.description && <div><span>Description</span><p>{selected.description}</p></div>}<div className="admin-app__actions"><Link href={`/${selected.slug}`} target="_blank">Open public page ↗</Link><select value={selected.status} disabled={busy} onChange={(event) => update("restaurant", selected._id, event.target.value)} aria-label="Restaurant status">{["pending", "active", "inactive", "suspended"].map((status) => <option key={status}>{status}</option>)}</select></div></div>}</Modal>}
  </div>;
}

function Status({ value }: { value: string }) { return <span className={`admin-app__status is-${value.toLowerCase()}`}>{value.toLowerCase()}</span>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function Stat({ value, label, detail, icon: Icon }: { value: number; label: string; detail: string; icon: typeof Building2 }) { return <div className="admin-app__stat"><Icon size={21} strokeWidth={1.7} /><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>; }
