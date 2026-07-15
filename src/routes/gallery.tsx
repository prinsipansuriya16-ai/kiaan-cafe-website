import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import img1 from "@/assets/cafe/unnamed.webp";
import img2 from "@/assets/cafe/unnamed_1.webp";
import img3 from "@/assets/cafe/unnamed_2.webp";
import img4 from "@/assets/cafe/unnamed_3.webp";
import img5 from "@/assets/cafe/unnamed_11.webp";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Gallery — Kiaan Cafe · Moments, Coffee & Long Conversations" },
      { name: "description", content: "A visual love letter to slow afternoons, arched walls, dreamy desserts and Surat's most inviting cafe." },
    ],
  }),
});

const QUOTES = [
  "Coffee first. Answers later.",
  "Stay a little longer.",
  "Good food, warm light, and someone worth telling stories to.",
  "Some places don't feel like places. They feel like feelings.",
  "The best conversations happen over the second cup.",
];

const IMAGES = [img1, img2, img3, img4, img5, img1, img3, img4];

function GalleryPage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-8 md:px-10">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Gallery</div>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">Little moments, big feelings.</h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        <div className="columns-1 gap-4 sm:columns-2 md:columns-3">
          {IMAGES.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.05 }}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border"
            >
              <img src={src} alt={`Kiaan Cafe moment ${i + 1}`} className="w-full object-cover" />
            </motion.div>
          ))}

          {QUOTES.map((q, i) => (
            <div
              key={`q${i}`}
              className="mb-4 break-inside-avoid rounded-2xl border border-primary/20 bg-primary/5 p-6"
            >
              <p className="font-serif text-xl leading-snug text-foreground">"{q}"</p>
              <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-primary">— Kiaan Cafe</div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
