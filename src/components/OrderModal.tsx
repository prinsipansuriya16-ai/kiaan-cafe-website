import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Check, ExternalLink } from "lucide-react";
import type { MenuItem, MenuSection } from "@/data/menu";
import { fetchLiveMenu, fetchLiveSections } from "@/data/menu";
import { CAFE, buildWhatsAppUrl } from "@/lib/cafe";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "@/lib/stripe";
import { CheckoutForm } from "@/components/CheckoutForm";

type CartLine = { item: MenuItem; qty: number };

// Loaded once at module scope, not per-render — this is the standard
// Stripe.js pattern so the SDK isn't re-initialized on every open/close.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);


export function OrderModal({
  open,
  onClose,
  seedItem,
}: {
  open: boolean;
  onClose: () => void;
  seedItem?: MenuItem;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  
  const [dbItems, setDbItems] = useState<MenuItem[]>([]);
  const [dbSections, setDbSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");

  const [payment, setPayment] = useState<"online" | "cod" | "takeaway">("cod");
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Stripe checkout state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);


  useEffect(() => {
    async function loadOrderMenu() {
      try {
        setLoading(true);

        // Uses the same "menu" + "menu_sections" source of truth as the Menu page
        const [items, sections] = await Promise.all([
          fetchLiveMenu(),
          fetchLiveSections(),
        ]);

        setDbItems(items);
        setDbSections(sections);
      } catch (err) {
        console.error("Critical Error loading order modal menu:", err);
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      loadOrderMenu();
    }
  }, [open]);

  // Resolve which section tab should be active: prefer the seeded item's
  // real section (by section_id), otherwise default to the first section
  // once sections have loaded.
  useEffect(() => {
    if (!open || dbSections.length === 0) return;

    if (seedItem) {
      const matchedSection = dbSections.find(
        (s) => s.id === seedItem.section_id,
      );
      if (matchedSection) {
        setActiveSection(matchedSection.name);
        return;
      }
    }

    if (!activeSection) {
      setActiveSection(dbSections[0].name);
    }
  }, [open, seedItem, dbSections]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setStep(1);
      setOrderId(null);
      setClientSecret(null);
      setShowStripeForm(false);
      setPaymentError(null);
      if (seedItem) {
        setCart({ [seedItem.id]: { item: seedItem, qty: 1 } });
      } else {
        setCart({});
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, seedItem]);

  const displayItems = useMemo(() => {
    if (dbItems.length === 0) return [];
    if (!activeSection) return dbItems;

    return dbItems.filter(
      (m) => m.section.trim().toLowerCase() === activeSection.trim().toLowerCase(),
    );
  }, [activeSection, dbItems]);

  const subtotal = useMemo(
    () => Object.values(cart).reduce((s, l) => s + l.item.price * l.qty, 0),
    [cart],
  );
  const deliveryFee = payment === "takeaway" ? 0 : CAFE.deliveryFee;
  const total = subtotal + deliveryFee;
  const lines = Object.values(cart);

  const bump = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const cur = prev[item.id]?.qty ?? 0;
      const next = cur + delta;
      const clone = { ...prev };
      if (next <= 0) delete clone[item.id];
      else clone[item.id] = { item, qty: next };
      return clone;
    });
  };

  const placeOrder = async () => {
    setPlacing(true);
    setPaymentError(null);
    const payload = {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_address: payment === "takeaway" ? "Takeaway" : address.trim(),
      items: lines.map((l) => ({ name: l.item.name, price: l.item.price, qty: l.qty })),
      subtotal,
      delivery_fee: deliveryFee,
      total,
      payment_method: payment,
      // Only an actually-completed Stripe payment counts as "paid" — cod and
      // takeaway are settled in person, so they stay "unpaid" until then.
      payment_status: payment === "online" ? "paid" : "unpaid",
      fulfillment_method: payment === "takeaway" ? "takeaway" : "delivery",
      // By the time placeOrder runs, the order IS confirmed: for cod/takeaway
      // there's nothing left to wait on, and for online payment this only
      // fires from CheckoutForm's onSuccess, i.e. after Stripe has already
      // settled the payment.
      status: "confirmed",
    };
    try {
      const { data, error }: { data: any; error: any } = await supabase.from("orders" as any).insert(payload as any).select().single();
      if (error) throw error;
      setOrderId(data.id);
      setStep(4);
    } catch (e: any) {
      // Do NOT silently pretend this succeeded — a customer thinking their
      // order went through when it never reached the business is worse than
      // an honest error. Log the real cause and let them see it/retry.
      console.error("[OrderModal] Failed to save order to Supabase:", {
        error: e,
        payload,
      });
      setPaymentError(
        "We couldn't save your order. Please try again, or message us directly on WhatsApp so we don't miss it.",
      );
    } finally {
      setPlacing(false);
    }
  };

  // Called when the customer picks "Online Payment" and hits "Proceed to Pay".
  // Creates a Stripe PaymentIntent for the current order total, then reveals
  // the embedded CheckoutForm. The actual Supabase order write only happens
  // afterwards, in CheckoutForm's onSuccess → placeOrder().
  const startStripeCheckout = async () => {
    setPaymentError(null);
    setPlacing(true);
    try {
      const result = await createPaymentIntent({ data: total });
      if (!result?.clientSecret) {
        throw new Error("No client secret returned from payment server.");
      }
      setClientSecret(result.clientSecret);
      setShowStripeForm(true);
    } catch (err: any) {
      console.error("[OrderModal] Failed to create Stripe payment intent:", err);
      setPaymentError(err.message || "Could not start payment. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const waMessage = useMemo(() => {
    const itemLines = lines
      .map((l) => `• ${l.item.name} × ${l.qty} — ₹${l.item.price * l.qty}`)
      .join("\n");
    return `*New Order — Kiaan Cafe*\n\n*Customer:* ${name}\n*Phone:* ${phone}\n*Method:* ${payment.toUpperCase()}\n${
      payment !== "takeaway" ? `*Address:* ${address}\n` : ""
    }\n*Items:*\n${itemLines}\n\n*Subtotal:* ₹${subtotal}\n*Delivery:* ₹${deliveryFee}\n*Total:* ₹${total}\n\nOrder ID: ${orderId ?? "-"}`;
  }, [name, phone, address, payment, lines, subtotal, deliveryFee, total, orderId]);

  const canStep1 = name.trim().length >= 2 && /^\d{10,15}$/.test(phone.trim()) && (payment === "takeaway" || address.trim().length > 4);
  const canStep2 = lines.length > 0;

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
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <div className="font-serif text-xl text-foreground">Place your order</div>
                <div className="text-xs text-muted-foreground">Step {Math.min(step, 4)} of 4</div>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-4 gap-1 px-6 pt-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`h-1.5 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === 1 && (
                <div className="space-y-4">
                  <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" />
                  <Field label="Active Mobile Number" value={phone} onChange={setPhone} placeholder="10-digit mobile" />
                  <Field label="Full Drop Address" value={address} onChange={setAddress} placeholder="Flat, building, area, landmark" textarea />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="font-serif text-lg">Your bundle</div>
                    {lines.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">Add items from the categories below.</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {lines.map((l) => (
                          <div key={l.item.id} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{l.item.name}</div>
                              <div className="text-xs text-muted-foreground">₹{l.item.price} × {l.qty}</div>
                            </div>
                            <QtyStepper value={l.qty} onDec={() => bump(l.item, -1)} onInc={() => bump(l.item, 1)} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-serif text-lg mb-2">Choose your items</div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {loading ? (
                        <div className="text-xs text-muted-foreground py-1">Loading categories...</div>
                      ) : (
                        dbSections.map((s) => (
                          <button
                            key={s.name}
                            onClick={() => setActiveSection(s.name)}
                            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                              activeSection === s.name
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-foreground/70 hover:bg-muted"
                            }`}
                          >
                            {s.name}
                          </button>
                        ))
                      )}
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {loading ? (
                        <div className="text-xs text-muted-foreground py-4 text-center col-span-2">Loading items...</div>
                      ) : displayItems.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4 text-center col-span-2">No items in this category.</div>
                      ) : (
                        displayItems.map((m) => {
                          const qty = cart[m.id]?.qty ?? 0;
                          return (
                            <div key={m.id} className="flex items-center justify-between gap-2 rounded-xl border border-border p-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{m.name}</div>
                                <div className="text-xs text-primary">₹{m.price}</div>
                              </div>
                              {qty === 0 ? (
                                <button onClick={() => bump(m, 1)} className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground">Add</button>
                              ) : (
                                <QtyStepper value={qty} onDec={() => bump(m, -1)} onInc={() => bump(m, 1)} />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="font-serif text-lg">Invoice summary</div>
                    <div className="mt-3 space-y-1 text-sm">
                      {lines.map((l) => (
                        <div key={l.item.id} className="flex justify-between">
                          <span className="truncate">{l.item.name} × {l.qty}</span>
                          <span>₹{l.item.price * l.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                      <Row label="Subtotal" value={`₹${subtotal}`} />
                      <Row label="Delivery fee" value={`₹${deliveryFee}`} />
                      <Row label="Total" value={`₹${total}`} bold />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-medium">Payment method</div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {(["online", "cod", "takeaway"] as const).map((p) => (
                        <label
                          key={p}
                          className={`cursor-pointer rounded-xl border p-3 text-center text-sm capitalize transition ${
                            payment === p ? "border-primary bg-primary/5 text-primary" : "border-border"
                          }`}
                        >
                          <input
                            type="radio"
                            name="pm"
                            className="sr-only"
                            checked={payment === p}
                            onChange={() => {
                              setPayment(p);
                              if (p !== "online") {
                                setShowStripeForm(false);
                                setClientSecret(null);
                                setPaymentError(null);
                              }
                            }}
                          />
                          {p === "cod" ? "Cash on Delivery" : p === "online" ? "Online Payment" : "Takeaway"}
                        </label>
                      ))}
                    </div>

                    {paymentError && (
                      <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        {paymentError}
                      </div>
                    )}

                    {payment === "online" && showStripeForm && clientSecret && (
                      <div className="mt-4">
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                          <CheckoutForm amount={total} onSuccess={placeOrder} />
                        </Elements>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="py-6 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-8 w-8" />
                  </div>
                  <div className="mt-4 font-serif text-2xl">Order confirmed</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Estimated {payment === "takeaway" ? "pickup" : "delivery"}: 35–45 minutes.
                  </p>
                  <a
                    href={buildWhatsAppUrl(waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-burgundy mx-auto mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
                  >
                    Confirm Order via WhatsApp <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            {step < 4 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <button
                  onClick={() => {
                    if (step === 1) return onClose();
                    if (step === 3 && showStripeForm) {
                      setShowStripeForm(false);
                      setClientSecret(null);
                      setPaymentError(null);
                      return;
                    }
                    setStep(step - 1);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {step === 1 ? "Cancel" : "Back"}
                </button>
                {step === 1 && (
                  <button
                    disabled={!canStep1}
                    onClick={() => setStep(2)}
                    className="btn-burgundy rounded-full px-6 py-2 text-sm font-medium disabled:opacity-40"
                  >
                    Next
                  </button>
                )}
                {step === 2 && (
                  <button
                    disabled={!canStep2}
                    onClick={() => setStep(3)}
                    className="btn-burgundy rounded-full px-6 py-2 text-sm font-medium disabled:opacity-40"
                  >
                    Proceed
                  </button>
                )}
                {step === 3 && payment === "online" ? (
                  !showStripeForm && (
                    <button
                      disabled={placing}
                      onClick={startStripeCheckout}
                      className="btn-burgundy rounded-full px-6 py-2 text-sm font-medium disabled:opacity-40"
                    >
                      {placing ? "Preparing payment…" : "Proceed to Pay"}
                    </button>
                  )
                ) : (
                  step === 3 && (
                    <button
                      disabled={placing}
                      onClick={placeOrder}
                      className="btn-burgundy rounded-full px-6 py-2 text-sm font-medium disabled:opacity-40"
                    >
                      {placing ? "Placing…" : "Confirm & Pay"}
                    </button>
                  )
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
      )}
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-semibold text-foreground" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function QtyStepper({ value, onDec, onInc }: { value: number; onDec: () => void; onInc: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-background">
      <button onClick={onDec} className="grid h-8 w-8 place-items-center text-primary hover:bg-primary/10 rounded-l-full"><Minus className="h-3.5 w-3.5" /></button>
      <span className="w-5 text-center text-sm tabular-nums">{value}</span>
      <button onClick={onInc} className="grid h-8 w-8 place-items-center text-primary hover:bg-primary/10 rounded-r-full"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}