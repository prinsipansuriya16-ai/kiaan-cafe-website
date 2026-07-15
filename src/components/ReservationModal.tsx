import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ExternalLink } from "lucide-react";
import { CAFE, buildWhatsAppUrl } from "@/lib/cafe";
import { supabase } from "@/integrations/supabase/client";

const TIME_SLOTS = ["12:00 PM", "1:30 PM", "3:00 PM", "7:00 PM", "8:30 PM", "10:00 PM"];

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function labelDate(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export function ReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateStr, setDateStr] = useState(fmtDate(todayPlus(0)));
  const [time, setTime] = useState(TIME_SLOTS[3]);
  const [guests, setGuests] = useState(2);
  const [payment, setPayment] = useState<"online" | "at-venue">("at-venue");
  const [placing, setPlacing] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setStep(1);
      setReservationId(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const dateOptions = useMemo(() => [0, 1, 2].map(todayPlus), []);

  const submit = async () => {
    setPlacing(true);
    const localId = `local-${Date.now().toString(36)}`;
    const payload = {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_address: address.trim() || null,
      reservation_date: dateStr,
      reservation_time: time,
      guests,
      payment_method: payment,
      status: "confirmed",
    };
    try {
      const { error } = await supabase.from("reservations").insert(payload);
      if (error) throw error;
      setReservationId(localId);
    } catch {
      try {
        const key = "kiaan_pending_reservations";
        const existing = JSON.parse(sessionStorage.getItem(key) ?? "[]");
        existing.push({ id: localId, ...payload, created_at: new Date().toISOString() });
        sessionStorage.setItem(key, JSON.stringify(existing));
      } catch {}
      setReservationId(localId);
    } finally {
      setStep(4);
      setPlacing(false);
    }
  };

  const canStep1 = name.trim().length >= 2 && /^\d{7,15}$/.test(phone.trim());

  const waMessage = `*New Reservation — Kiaan Cafe*\n\n*Customer:* ${name}\n*Phone:* ${phone}\n*Date:* ${labelDate(new Date(dateStr))}\n*Time:* ${time}\n*Guests:* ${guests}\n*Payment:* ${payment}\n${address ? `*Address:* ${address}\n` : ""}\nReservation ID: ${reservationId ?? "-"}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-3"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <div className="font-serif text-xl">Reserve a Table</div>
                <div className="text-xs text-muted-foreground">
                  {step === 4 ? "Confirmed" : `Step ${step} of 3`}
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-3 gap-1 px-6 pt-3">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === 1 && (
                <div className="space-y-4">
                  <F label="Full Name" value={name} onChange={setName} />
                  <F label="Mobile Number" value={phone} onChange={setPhone} />
                  <F label="Address (optional)" value={address} onChange={setAddress} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Day</div>
                    <div className="grid grid-cols-3 gap-2">
                      {dateOptions.map((d) => {
                        const s = fmtDate(d);
                        return (
                          <button
                            key={s}
                            onClick={() => setDateStr(s)}
                            className={`rounded-xl border p-3 text-center text-sm transition ${
                              dateStr === s ? "border-primary bg-primary/5 text-primary" : "border-border"
                            }`}
                          >
                            {labelDate(d)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Time slot</div>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={`rounded-xl border p-2.5 text-center text-sm transition ${
                            time === t ? "border-primary bg-primary/5 text-primary" : "border-border"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Guests</div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((g) => (
                        <button
                          key={g}
                          onClick={() => setGuests(g)}
                          className={`h-10 w-10 rounded-full border text-sm transition ${
                            guests === g ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="font-serif text-lg">Booking summary</div>
                    <div className="mt-3 space-y-1 text-sm">
                      <Row l="Name" v={name} />
                      <Row l="Phone" v={phone} />
                      <Row l="Date" v={labelDate(new Date(dateStr))} />
                      <Row l="Time" v={time} />
                      <Row l="Guests" v={String(guests)} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium">Payment</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["at-venue", "online"] as const).map((p) => (
                        <label
                          key={p}
                          className={`cursor-pointer rounded-xl border p-3 text-center text-sm transition ${
                            payment === p ? "border-primary bg-primary/5 text-primary" : "border-border"
                          }`}
                        >
                          <input type="radio" name="rpm" className="sr-only" checked={payment === p} onChange={() => setPayment(p)} />
                          {p === "at-venue" ? "Pay at Venue" : "Online (advance)"}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="py-6 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-8 w-8" />
                  </div>
                  <div className="mt-4 font-serif text-2xl">Table reserved</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    See you on {labelDate(new Date(dateStr))} at {time} — {CAFE.addressShort}.
                  </p>
                  {payment === "online" && (
                    <div className="mx-auto mt-4 max-w-sm rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-xs text-primary">
                      Payment gateway is currently in <b>test mode</b>. No amount has been charged — please share the booking on WhatsApp to finalize.
                    </div>
                  )}
                  <a
                    href={buildWhatsAppUrl(waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-burgundy mx-auto mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
                  >
                    Confirm Booking via WhatsApp <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            {step < 4 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <button
                  onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {step === 1 ? "Cancel" : "Back"}
                </button>
                {step === 1 && (
                  <button disabled={!canStep1} onClick={() => setStep(2)} className="btn-burgundy rounded-full px-6 py-2 text-sm font-medium disabled:opacity-40">Next</button>
                )}
                {step === 2 && (
                  <button onClick={() => setStep(3)} className="btn-burgundy rounded-full px-6 py-2 text-sm font-medium">Next</button>
                )}
                {step === 3 && (
                  <button disabled={placing} onClick={submit} className="btn-burgundy rounded-full px-6 py-2 text-sm font-medium disabled:opacity-40">
                    {placing ? "Booking…" : "Confirm Booking"}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}