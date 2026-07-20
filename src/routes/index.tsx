import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MenuItem } from "@/data/menu";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Clock, Utensils, Home as HomeIcon } from "lucide-react";
import { CAFE } from "@/lib/cafe";
import { CHEFS_SPECIALS, imageForItem } from "@/data/menu";
import { Footer } from "@/components/Footer";
import { useCafe } from "@/components/CafeProvider";
import interior1 from "@/assets/cafe/unnamed.webp";
import interior2 from "@/assets/cafe/unnamed_1.webp";
import arch from "@/assets/cafe/unnamed_3.webp";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Kiaan Cafe — A Cozy Kingdom of Flavours in Surat" },
      { name: "description", content: "Italian, Mexican, coffee & desserts in Mota Varachha, Surat. Reserve a table or order in from Kiaan Cafe." },
    ],
  }),
});

const REVIEWS = [
  { name: "Aarav M.", text: "The arched interiors feel like a fairytale. Their Pink Sauce pasta and Biscoff cheesecake are pure luxury." },
  { name: "Neha S.", text: "Best matcha in Surat. The staff is warm, the space is dreamy — we always end up staying a little longer." },
  { name: "Rohan D.", text: "Take a date here. Trust me. The Peri Peri Paneer pizza + Espresso Berry combo is unreal." },
  { name: "Ishita P.", text: "Pastel walls, floral art, incredible desserts. Their smoothie bowls are Insta-perfect and actually taste great." },
  { name: "Vivaan R.", text: "Kiaan is my go-to for slow afternoons. Coffee is barista-grade, and the food never disappoints." },
];

const HOURS = [
  { d: "Tuesday", t: "10:00 AM – 12:30 AM" },
  { d: "Wednesday", t: "10:00 AM – 12:30 AM" },
  { d: "Thursday", t: "10:00 AM – 12:30 AM" },
  { d: "Friday", t: "10:00 AM – 12:30 AM" },
  { d: "Saturday", t: "10:00 AM – 12:30 AM" },
  { d: "Sunday", t: "10:00 AM – 12:30 AM" },
  { d: "Monday", t: "10:00 AM – 12:30 AM" },
];

function Index() {
  const { openOrder, openReservation } = useCafe();
  
  // 1. Dynamic States add kiye
  const [chefsSpecials, setChefsSpecials] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Database se dynamic data fetch karne ka logic add kiya
  useEffect(() => {
    async function fetchSpecials() {
      try {
        const { data, error } = await supabase
          .from("menu" as any)
          .select("*")
          .order("name") as any;

        if (error) throw error;

        // Agar database item me koi badge hai (jaise "Chef's Special") toh use filter karein,
        // nahi toh backup ke liye pehle 3 items screen par show kar dein.
        const specials = data?.filter((item: any) => item.badge) || [];
        setChefsSpecials(specials.length > 0 ? specials : (data?.slice(0, 3) || []));
      } catch (err) {
        console.error("Error loading chef specials:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSpecials();
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Since 2018 · Surat
            </div>
            <h1 className="font-serif text-4xl leading-[1.05] text-foreground md:text-6xl">
              A cozy kingdom<br />of <span className="italic text-primary">flavours.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              {CAFE.tagline}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Owned by <span className="text-foreground">{CAFE.owner}</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu" className="btn-burgundy rounded-full px-6 py-3 text-sm font-medium">
                Look at Menu
              </Link>
              <button
                onClick={openReservation}
                className="rounded-full border border-primary/50 px-6 py-3 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                Reserve a Table
              </button>
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-5">
            {[interior1, interior2].map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`arch-mask relative overflow-hidden bg-secondary shadow-[var(--shadow-elegant)] ${
                  i === 0 ? "aspect-[3/4] mt-10 md:mt-16" : "aspect-[3/4] md:-mt-4"
                } md:min-h-[540px]`}
              >
                <img src={src} alt="Kiaan Cafe interior" className="h-full w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chef's Special Section (Now fully dynamic!) */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Chef's Special</div>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">House favourites</h2>
          </div>
          <Link to="/menu" className="text-sm text-primary hover:underline">View all →</Link>
        </div>

        {/* Loading Spinner ya cards display */}
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2 text-xs">Loading specials...</p>
          </div>
        ) : chefsSpecials.length === 0 ? (
          <p className="text-muted-foreground text-sm">No specials available today.</p>
        ) : (
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
            {chefsSpecials.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                className="min-w-[280px] max-w-[300px] snap-start overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                  <img
                    src={imageForItem(item)}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  {item.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary shadow">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl leading-tight">{item.name}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="font-serif text-lg text-primary">₹{item.price}</div>
                    <button
                      onClick={() => openOrder(item)}
                      className="rounded-full border border-primary/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Operational</div>
            <h2 className="mt-2 font-serif text-3xl">Everything you need to know</h2>
            <div className="mt-6 grid grid-cols-2 gap-5">
              <Detail icon={<Utensils className="h-4 w-4" />} label="Cuisines" value={CAFE.cuisines.join(", ")} />
              <Detail icon={<HomeIcon className="h-4 w-4" />} label="Cost for two" value={CAFE.costForTwo} />
              <Detail icon={<Clock className="h-4 w-4" />} label="Hours" value="10:00 AM – 12:30 AM" />
              <Detail icon={<MapPin className="h-4 w-4" />} label="Facilities" value={CAFE.facilities.join(" · ")} />
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="font-serif text-2xl">Opening schedule</div>
            <div className="mt-4 divide-y divide-border">
              {HOURS.map((h) => (
                <div key={h.d} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-muted-foreground">{h.d}</span>
                  <span className="font-medium">{h.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Loved by our guests</div>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl">Stay a little longer</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-3xl border border-border bg-card p-6 ${i === 4 ? "md:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className="mb-3 text-primary">★★★★★</div>
              <p className="text-sm leading-relaxed text-foreground">"{r.text}"</p>
              <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">— {r.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="overflow-hidden rounded-3xl border border-border">
          <iframe
            src={CAFE.mapEmbed}
            title="Kiaan Cafe location"
            width="100%"
            height="420"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        </div>
      </section>

      <img src={arch} alt="Stay a little longer arch" className="sr-only" />
      <Footer />
    </div>
  );
}
function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
