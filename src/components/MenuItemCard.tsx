import type { MenuItem } from "@/data/menu";
import { imageForItem } from "@/data/menu";
import { useCafe } from "./CafeProvider";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { openOrder } = useCafe();
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={imageForItem(item)}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg leading-tight text-foreground">{item.name}</h3>
          <div className="whitespace-nowrap font-serif text-lg text-primary">₹{item.price}</div>
        </div>
        {item.badge && (
          <span className="mt-2 inline-block rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
            {item.badge}
          </span>
        )}
        {item.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
      <button
        onClick={() => openOrder(item)}
        className="mt-5 self-start rounded-full border border-primary/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground"
      >
        Order Now
      </button>
      </div>
    </div>
  );
}