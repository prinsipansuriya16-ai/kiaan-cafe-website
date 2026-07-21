export const CAFE = {
  name: "Kiaan Cafe",
  tagline:
    "Welcome to Kiaan Cafe, a cozy kingdom of flavours where Italian classics, Mexican favourites, rich coffee, and dreamy desserts come together under one roof.",
  owner: "Priyanshi Pansuriya",
  phone: "+919638330214",
  phoneDisplay: "+91 96383 30214",
  whatsapp: "919638330214",
  email: "prinsipansuriya16@gmail.com",
  address:
    "217, 2nd Floor, AR Mall, Panvel Point, Mota Varachha, Surat, Gujarat 394105",
  addressShort: "AR Mall, Mota Varachha, Surat",
  hours: "Everyday · 10:00 AM – 12:30 AM",
  costForTwo: "₹200-400",
  cuisines: ["Italian", "Desserts", "Mexican"],
  facilities: ["Dinner", "Indoor seating", "Lunch", "Home delivery"],
  deliveryFee: 40,
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.5999335607064!2d72.88373307524584!3d21.247683980457635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f9ab07e4def%3A0x6c6c1fda0b82065b!2sKiaan%20Cafe!5e0!3m2!1sen!2sin!4v1712345678901!5m2!1sen!2sin",
  mapsLink:
    "https://maps.app.goo.gl/SAWL78td18ofW1FMA",
  instagram: "https://www.instagram.com/kiaancafe_surat/",
  reservation: "https://www.district.in/dining/surat/kiaan-cafe-mota-varachha",
};

export const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/${CAFE.whatsapp}?text=${encodeURIComponent(message)}`;

export const buildTelUrl = () => `tel:${CAFE.phone}`;