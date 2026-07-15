import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, Mail, Phone } from "lucide-react";
import { CAFE, buildTelUrl } from "@/lib/cafe";

export function Footer() {
  return (
    <footer className="mt-24 bg-[#0d0d0d] text-neutral-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4 md:px-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-serif">
              K
            </div>
            <div className="font-serif text-xl text-white">{CAFE.name}</div>
          </div>
          <p className="mt-4 text-sm text-neutral-400">
            A cozy kingdom of flavours where Italian classics, Mexican favourites,
            rich coffee and dreamy desserts come together under one roof.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={CAFE.instagram} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="font-serif text-lg text-white">Quick Links</div>
          <ul className="mt-4 space-y-2 text-sm text-neutral-400">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/menu" className="hover:text-white">Menu</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-serif text-lg text-white">Visit Us</div>
          <div className="mt-4 flex items-start gap-2 text-sm text-neutral-400">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{CAFE.address}</span>
          </div>
          <div className="mt-3 text-sm text-neutral-400">{CAFE.hours}</div>
        </div>

        <div>
          <div className="font-serif text-lg text-white">Contact</div>
          <a href={buildTelUrl()} className="mt-4 flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
            <Phone className="h-4 w-4" /> {CAFE.phoneDisplay}
          </a>
          <a href={`mailto:${CAFE.email}`} className="mt-2 flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
            <Mail className="h-4 w-4" /> {CAFE.email}
          </a>
          <div className="mt-4 text-xs text-neutral-500">
            Owned by <span className="text-neutral-300">{CAFE.owner}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-neutral-500 md:px-10">
          © {new Date().getFullYear()} {CAFE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}