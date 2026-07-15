import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MENU, MENU_SECTIONS, FOOD_SECTIONS, DESSERT_SECTIONS, type MenuItem } from "@/data/menu";
import { MenuItemCard } from "@/components/MenuItemCard";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
  head: () => ({
    meta: [
      { title: "Menu — Kiaan Cafe · Italian, Mexican, Coffee & Desserts" },
      { name: "description", content: "Explore Kiaan Cafe's full menu: pizza, pasta, wraps, cheesecakes, matcha, espresso and more. Order online for delivery in Surat." },
    ],
  }),
});

type Filter = "All" | "Food" | "Dessert";

function MenuPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [subcat, setSubcat] = useState<string>("__all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSubcat("__all");
  }, [filter]);

  const subcats = useMemo(() => {
    if (filter === "Food") return FOOD_SECTIONS;
    if (filter === "Dessert") return DESSERT_SECTIONS;
    return [];
  }, [filter]);

  const grouped = useMemo(() => {
    const filtered = MENU.filter(
      (m) =>
        (filter === "All" || m.category === filter) &&
        (subcat === "__all" || m.section === subcat) &&
        (query.trim() === "" ||
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.description?.toLowerCase().includes(query.toLowerCase())),
    );
    const map = new Map<string, MenuItem[]>();
    for (const s of MENU_SECTIONS) map.set(s, []);
    for (const m of filtered) map.get(m.section)?.push(m);
    return Array.from(map.entries()).filter(([, list]) => list.length);
  }, [filter, subcat, query]);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-6 md:px-10 md:pt-16">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Digital Menu</div>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">The full menu</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Italian classics, Mexican favourites, hand-crafted coffee, and dreamy desserts. Tap any dish to order.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(["All", "Food", "Dessert"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  filter === f
                    ? "btn-burgundy"
                    : "border border-border text-foreground/70 hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary sm:w-64"
          />
        </div>

        <AnimatePresence initial={false}>
          {subcats.length > 0 && (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-5 -mx-6 overflow-x-auto px-6 md:-mx-10 md:px-10"
            >
              <div className="flex w-max gap-2 pb-1">
                <SubcatPill active={subcat === "__all"} onClick={() => setSubcat("__all")}>
                  {filter === "Food" ? "All Food" : "All Desserts"}
                </SubcatPill>
                {subcats.map((s) => (
                  <SubcatPill key={s} active={subcat === s} onClick={() => setSubcat(s)}>
                    {s}
                  </SubcatPill>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        {grouped.length === 0 && (
          <p className="text-center text-muted-foreground">No items match your search.</p>
        )}
        <AnimatePresence mode="popLayout">
        {grouped.map(([section, items], idx) => (
          <motion.div
            layout
            key={section}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, delay: idx * 0.03 }}
            className="mt-14 first:mt-4"
          >
            <div className="mb-6 flex items-center gap-4">
              <h2 className="font-serif text-2xl md:text-3xl">{section}</h2>
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </section>
      <Footer />
    </div>
  );
}

function SubcatPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border bg-card/60 text-foreground/70 hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
