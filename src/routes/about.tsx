import { createFileRoute } from "@tanstack/react-router";
import { Instagram, MessageCircle, Phone, MapPin, ExternalLink } from "lucide-react";
import { CAFE, buildTelUrl, buildWhatsAppUrl } from "@/lib/cafe";
import { Footer } from "@/components/Footer";
import interior1 from "@/assets/cafe/unnamed.webp";
import arch from "@/assets/cafe/unnamed_3.webp";

// generic types signature bypass kiya taaki parameter validation issue khatam ho sake
export const Route = (createFileRoute as any)("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Kiaan Cafe · Surat's Cozy Kingdom of Flavours" },
      { name: "description", content: "The story, vision, and everyday craft behind Kiaan Cafe in Mota Varachha, Surat. Reservations, cuisines, hours, and every way to reach us." },
    ],
  }),
});

const TILES = [
  { label: "Instagram", href: () => CAFE.instagram, icon: Instagram },
  { label: "WhatsApp", href: () => buildWhatsAppUrl(`Hi ${CAFE.name}, I'd like to know more.`), icon: MessageCircle },
  { label: "Call Us", href: buildTelUrl, icon: Phone },
  { label: "Directions", href: () => CAFE.mapsLink, icon: MapPin },
  { label: "Reserve on District", href: () => CAFE.reservation, icon: ExternalLink },
];

function AboutPage() {
  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">About us</div>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-6xl">
            Where flavour meets <span className="italic text-primary">stillness.</span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Kiaan Cafe was born from a simple belief — that great food and good coffee deserve
            a space that feels like home. We built our arched walls, hand-crafted our menu of
            Italian classics, Mexican favourites, rich coffee and dreamy desserts, and welcomed
            Surat to <em>stay a little longer</em>.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every plate we serve is a small love letter to comfort, craft, and slow afternoons —
            from our signature Pink Sauce pasta to our best-selling Biscoff cheesecake and
            barista-grade matcha.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Owned & run by <span className="text-foreground">{CAFE.owner}</span>.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="arch-mask overflow-hidden shadow-[var(--shadow-elegant)] aspect-[3/4] mt-6">
            <img src={interior1} alt="Kiaan interior" className="h-full w-full object-cover" />
          </div>
          <div className="arch-mask overflow-hidden shadow-[var(--shadow-elegant)] aspect-[3/4]">
            <img src={arch} alt="Stay a little longer arch" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        <h2 className="font-serif text-3xl">Restaurant details</h2>
        <div className="mt-6 grid gap-5 rounded-3xl border border-border bg-card p-6 md:grid-cols-2 md:p-8">
          <Detail label="Cost for two" value={CAFE.costForTwo} />
          <Detail label="Cuisines" value={CAFE.cuisines.join(", ")} />
          <Detail label="Facilities" value={CAFE.facilities.join(" · ")} />
          <Detail label="Hours" value={CAFE.hours} />
          <Detail label="Address" value={CAFE.address} full />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        <h2 className="font-serif text-3xl">Connect with us</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((t) => {
            const Icon = t.icon;
            return (
              <a
                key={t.label}
                href={t.href()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-serif text-lg">{t.label}</div>
                  <div className="text-xs text-muted-foreground">Open →</div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Detail({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-medium text-foreground">{value}</div>
    </div>
  );
}