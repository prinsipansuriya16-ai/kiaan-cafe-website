import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin-dashboard")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — Kiaan Cafe" }, { name: "robots", content: "noindex" }] }),
});

type Order = { id: string; customer_name: string; customer_phone: string; total: number; status: string; payment_method: string; created_at: string; items: any };
type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: string;
  payment_status: string; // 'paid' | 'pending' — set by ReservationModal.tsx
};

type MenuSection = { id: string; name: string; category: "Food" | "Dessert"; image_url: string | null };
type MenuItemRow = { id: string; name: string; description: string | null; price: number; section_id: string; badge: string | null; image_url: string | null };

function AdminDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<"orders" | "reservations" | "sections" | "menu">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  
  // File upload state for loaders
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Forms state
  const [newSecName, setNewSecName] = useState("");
  const [newSecCat, setNewSecCat] = useState<"Food" | "Dessert">("Food");
  
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemSecId, setNewItemSecId] = useState("");
  const [newItemBadge, setNewItemBadge] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return navigate({ to: "/auth" });
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id);
      const admin = !!roles?.some((r) => r.role === "admin");
      setIsAdmin(admin);
      setReady(true);
      if (admin) await loadAll();
    })();
  }, [navigate]);

  const loadAll = async () => {
    // Queries ko completely as any cast kar rahe hain taaki TypeScript validation bypass ho jaye
    const [o, r, s, m] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }) as any,
      supabase.from("reservations").select("*").order("created_at", { ascending: false }) as any,
      (supabase.from("menu_sections" as any).select("*") as any).order("name") as any,
      (supabase.from("menu" as any).select("*") as any).order("name") as any,
    ]);

    setOrders((o.data as Order[]) ?? []);
    setReservations((r.data as Reservation[]) ?? []);
    
    // Safely parse data using local variables with safe fallback
    const sectionsData = (s.data as any) as MenuSection[] ?? [];
    const itemsData = (m.data as any) as MenuItemRow[] ?? [];
    
    setSections(sectionsData);
    setItems(itemsData);
    
    if (sectionsData && sectionsData.length > 0) {
      setNewItemSecId(sectionsData[0].id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  // ==========================================
  // IMAGE UPLOAD FUNCTION (Supabase Storage)
  // ==========================================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string, type: "section" | "item") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      // Storage mein upload karein — bucket must match exactly: 'cafe-images'
      const { error: uploadError } = await supabase.storage
        .from('cafe-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Public URL nikalein
      const { data: { publicUrl } } = supabase.storage
        .from('cafe-images')
        .getPublicUrl(filePath);

      // Database table update karein — .select() forces Supabase to return
      // the row it actually touched. If RLS silently blocks the write,
      // Postgres reports 0 rows affected (no error!), so we must check
      // the returned data, not just `error`.
      if (type === "section") {
        const { data, error } = await supabase
          .from("menu_sections" as any)
          .update({ image_url: publicUrl })
          .eq("id", id)
          .select();

        if (error) {
          console.error("[handleImageUpload] menu_sections update error:", { id, filePath, error });
          throw error;
        }
        if (!data || data.length === 0) {
          console.error(
            "[handleImageUpload] menu_sections update returned 0 rows — likely blocked by RLS policy or id not found:",
            { id, filePath },
          );
          throw new Error("Update was rejected by the database (0 rows affected). Check RLS UPDATE policy on menu_sections.");
        }

        const updatedRow = data[0] as any;
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, image_url: updatedRow.image_url } : s)));
      } else {
        const { data, error } = await supabase
          .from("menu" as any)
          .update({ image_url: publicUrl })
          .eq("id", id)
          .select();

        if (error) {
          console.error("[handleImageUpload] menu update error:", { id, filePath, error });
          throw error;
        }
        if (!data || data.length === 0) {
          console.error(
            "[handleImageUpload] menu update returned 0 rows — likely blocked by RLS policy or id not found:",
            { id, filePath },
          );
          throw new Error("Update was rejected by the database (0 rows affected). Check RLS UPDATE policy on menu.");
        }

        const updatedRow = data[0] as any;
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, image_url: updatedRow.image_url } : i)));
      }

      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingId(null);
    }
  };

  // ==========================================
  // SECTIONS CRUD
  // ==========================================
  const addSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecName.trim()) return toast.error("Category name required");
    const id = "sec-" + newSecName.toLowerCase().replace(/\s+/g, '-');
    
    const { error } = await supabase.from("menu_sections" as any).insert({
      id,
      name: newSecName,
      category: newSecCat
    });

    if (error) return toast.error(error.message);
    toast.success("Category added!");
    setNewSecName("");
    await loadAll();
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Are you sure? This will delete all items inside this category too.")) return;
    const { error } = await supabase.from("menu_sections" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted!");
    await loadAll();
  };

  // ==========================================
  // ITEMS CRUD
  // ==========================================
  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemSecId) return toast.error("Name & Category are required");
    const id = "m-" + Math.random().toString(36).substring(2, 9);

    const { error } = await supabase.from("menu" as any).insert({
      id,
      name: newItemName,
      description: newItemDesc || null,
      price: newItemPrice,
      section_id: newItemSecId,
      badge: newItemBadge || null
    });

    if (error) return toast.error(error.message);
    toast.success("Item added!");
    setNewItemName("");
    setNewItemDesc("");
    setNewItemPrice(0);
    setNewItemBadge("");
    await loadAll();
  };

  const updateItemPrice = async (id: string, price: number) => {
    const { data, error } = await supabase.from("menu" as any).update({ price }).eq("id", id).select();

    if (error) {
      console.error("[updateItemPrice] Supabase update error:", { id, price, error });
      return toast.error(error.message);
    }

    if (!data || data.length === 0) {
      console.error(
        "[updateItemPrice] Update returned 0 rows for id:",
        id,
        "— check RLS UPDATE policy on the 'menu' table for the current role, and confirm this id actually exists in 'menu'.",
      );
      return toast.error("Update was not saved (0 rows affected). Likely an RLS permissions issue — check console for details.");
    }

    const updatedRow = data[0] as any;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, price: updatedRow.price } : i)));
    toast.success("Price updated!");
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Item deleted!");
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (!ready) return <div className="p-16 text-center text-muted-foreground">Loading…</div>;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">Not an admin</h1>
        <p className="mt-3 text-muted-foreground">
          Your account isn't an admin yet. Ask the owner to add your user id to the <code>user_roles</code> table with role <code>admin</code>.
        </p>
        <button onClick={signOut} className="btn-burgundy mt-6 rounded-full px-6 py-2 text-sm">Sign out</button>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage orders, reservations, categories & live menus.</p>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          { key: "orders", label: "Orders" },
          { key: "reservations", label: "Reservations" },
          { key: "sections", label: "Manage Categories" },
          { key: "menu", label: "Manage Items" }
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${tab === t.key ? "btn-burgundy" : "border border-border"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-2">When</th><th className="p-2">Customer</th><th className="p-2">Phone</th><th className="p-2">Total</th><th className="p-2">Pay</th><th className="p-2">Status</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="p-2">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="p-2">{o.customer_name}</td>
                    <td className="p-2">{o.customer_phone}</td>
                    <td className="p-2">₹{o.total}</td>
                    <td className="p-2">{o.payment_method}</td>
                    <td className="p-2">{o.status}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* RESERVATIONS TAB */}
        {tab === "reservations" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-2">Date</th><th className="p-2">Time</th><th className="p-2">Guests</th><th className="p-2">Customer</th><th className="p-2">Phone</th><th className="p-2">Payment</th><th className="p-2">Status</th></tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-2">{r.reservation_date}</td>
                    <td className="p-2">{r.reservation_time}</td>
                    <td className="p-2">{r.guests}</td>
                    <td className="p-2">{r.customer_name}</td>
                    <td className="p-2">{r.customer_phone}</td>
                    <td className="p-2">
                      {r.payment_status === "paid" ? (
                        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          Paid Online (Advance)
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          Pay at Cafe
                        </span>
                      )}
                    </td>
                    <td className="p-2">{r.status}</td>
                  </tr>
                ))}
                {reservations.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No reservations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* SECTIONS / CATEGORIES TAB */}
        {tab === "sections" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Add New Category</h2>
            <form onSubmit={addSection} className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Category Name (e.g. Burgers, Mocktails)"
                value={newSecName}
                onChange={(e) => setNewSecName(e.target.value)}
                className="flex-1 min-w-[200px] rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <select
                value={newSecCat}
                onChange={(e) => setNewSecCat(e.target.value as "Food" | "Dessert")}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="Food">Food</option>
                <option value="Dessert">Dessert</option>
              </select>
              <button type="submit" className="flex items-center gap-2 btn-burgundy rounded-md px-4 py-2 text-sm font-medium">
                <Plus className="h-4 w-4" /> Add Category
              </button>
            </form>

            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-semibold mb-4">Live Categories</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((s) => (
                  <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 bg-muted/20">
                    <div className="relative h-32 w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No Banner Image</span>
                      )}
                      
                      {/* Image Upload Overlay */}
                      <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                        {uploadingId === s.id ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <div className="flex flex-col items-center text-xs">
                            <Upload className="h-5 w-5 mb-1" />
                            Upload Banner
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, s.id, "section")}
                          disabled={uploadingId !== null}
                        />
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.category}</div>
                      </div>
                      <button onClick={() => deleteSection(s.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-full">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MENU ITEMS TAB */}
        {tab === "menu" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Add New Menu Item</h2>
            <form onSubmit={addItem} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="text"
                placeholder="Item Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Description"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Price"
                value={newItemPrice || ""}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <select
                value={newItemSecId}
                onChange={(e) => setNewItemSecId(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Badge (e.g. Best Seller) - Optional"
                value={newItemBadge}
                onChange={(e) => setNewItemBadge(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2"
              />
              <button type="submit" className="flex items-center justify-center gap-2 btn-burgundy rounded-md px-4 py-2 text-sm font-medium sm:col-span-2">
                <Plus className="h-4 w-4" /> Add Menu Item
              </button>
            </form>

            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-semibold mb-4">Manage Menu Items</h2>
              <div className="space-y-3">
                {items.map((i) => {
                  const itemSection = sections.find(s => s.id === i.section_id);
                  return (
                    <div key={i.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-3 bg-muted/10">
                      
                      {/* Interactive Item Image */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center group">
                        {i.image_url ? (
                          <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-center text-muted-foreground leading-none">No Photo</span>
                        )}
                        
                        {/* File Upload Overlay */}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                          {uploadingId === i.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, i.id, "item")}
                            disabled={uploadingId !== null}
                          />
                        </label>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {i.name} 
                          {i.badge && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{i.badge}</span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{i.description || "No description"}</div>
                        <div className="text-xs font-semibold text-muted-foreground mt-0.5">Category: {itemSection?.name || "Unassigned"}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">₹</span>
                        <input
                          type="number"
                          value={i.price}
                          onChange={(e) => updateItemPrice(i.id, Number(e.target.value))}
                          className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm text-right font-medium"
                        />
                        <button onClick={() => deleteItem(i.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-full">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
                {items.length === 0 && <p className="text-sm text-center text-muted-foreground py-6">No items inside the selected list.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}