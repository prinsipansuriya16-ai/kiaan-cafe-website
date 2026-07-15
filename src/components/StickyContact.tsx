import { Phone, MessageCircle } from "lucide-react";
import { CAFE, buildTelUrl, buildWhatsAppUrl } from "@/lib/cafe";

export function StickyContact() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <a
        href={buildWhatsAppUrl(`Hi ${CAFE.name}! I have a question.`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp us"
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] transition hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={buildTelUrl()}
        aria-label="Call the cafe"
        className="grid h-14 w-14 place-items-center rounded-full btn-burgundy transition"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}