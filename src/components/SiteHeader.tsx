import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu as MenuIcon, X } from "lucide-react";
import { CAFE } from "@/lib/cafe";
import { useCafe } from "./CafeProvider";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { openReservation } = useCafe();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-serif text-lg">
            K
          </div>
          <div className="leading-tight">
            <div className="font-serif text-xl text-foreground">{CAFE.name}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              A Cozy Kingdom
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}
              activeOptions={{ exact: true }}
              className="text-sm font-medium tracking-wide transition"
            >
              {n.label}
            </Link>
          ))}
          <button
            onClick={openReservation}
            className="btn-burgundy rounded-full px-5 py-2 text-sm font-medium"
          >
            Reserve a Table
          </button>
        </nav>

        <button
          className="rounded-full p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 p-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium"
              >
                {n.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                openReservation();
              }}
              className="btn-burgundy mt-2 rounded-full px-5 py-3 text-sm font-medium"
            >
              Reserve a Table
            </button>
          </div>
        </div>
      )}
    </header>
  );
}