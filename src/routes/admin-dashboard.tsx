import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/admin-dashboard")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — Kiaan Cafe" }, { name: "robots", content: "noindex" }] }),
});

type Order = { id: string; customer_name: string; customer_phone: string; total: number; status: string; payment_method: string; created_at: string; items: any };
type Reservation = { id: string; customer_name: string; customer_phone: string; reservation_date: string; reservation_time: string; guests: number; status: string };
type MenuItemRow = { id: string; name: string; price: number; category: string; section: string; available: boolean; image_url: string | null };

function AdminDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<"orders" | "reservations" | "menu">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);

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
    const [o, r, m] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("reservations").select("*").order("created_at", { ascending: false }),
      supabase.from("menu_items").select("*").order("section"),
    ]);
    setOrders((o.data as Order[]) ?? []);
    setReservations((r.data as Reservation[]) ?? []);
    setItems((m.data as MenuItemRow[]) ?? []);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
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

  const toggleAvail = async (id: string, next: boolean) => {
    const { error } = await supabase.from("menu_items").update({ available: next }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, available: next } : i)));
  };
  const updatePrice = async (id: string, price: number) => {
    const { error } = await supabase.from("menu_items").update({ price }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, price } : i)));
  };
  const updateImage = async (id: string, image_url: string) => {
    const { error } = await supabase.from("menu_items").update({ image_url }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, image_url } : i)));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage orders, reservations and menu.</p>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-6 flex gap-2">
        {(["orders", "reservations", "menu"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${tab === t ? "btn-burgundy" : "border border-border"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4">
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

        {tab === "reservations" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-2">Date</th><th className="p-2">Time</th><th className="p-2">Guests</th><th className="p-2">Customer</th><th className="p-2">Phone</th><th className="p-2">Status</th></tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-2">{r.reservation_date}</td>
                    <td className="p-2">{r.reservation_time}</td>
                    <td className="p-2">{r.guests}</td>
                    <td className="p-2">{r.customer_name}</td>
                    <td className="p-2">{r.customer_phone}</td>
                    <td className="p-2">{r.status}</td>
                  </tr>
                ))}
                {reservations.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No reservations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === "menu" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The public menu on <code>/menu</code> is rendered from a static file for now. This table is for dynamic menu items you add later.
            </p>
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">No dynamic items yet.</p>
            )}
            {items.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {i.image_url ? <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.section} · {i.category}</div>
                </div>
                <input
                  type="url"
                  placeholder="image URL"
                  defaultValue={i.image_url ?? ""}
                  onBlur={(e) => updateImage(i.id, e.target.value)}
                  className="w-56 rounded-md border border-border bg-background px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  defaultValue={i.price}
                  onBlur={(e) => updatePrice(i.id, Number(e.target.value))}
                  className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={i.available} onChange={(e) => toggleAvail(i.id, e.target.checked)} />
                  Available
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
