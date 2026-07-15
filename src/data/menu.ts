export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  section: string;
  category: "Food" | "Dessert";
  badge?: string;
};

let _id = 0;
const it = (
  section: string,
  category: "Food" | "Dessert",
  name: string,
  price: number,
  description?: string,
  badge?: string,
): MenuItem => ({
  id: `m${++_id}`,
  name,
  price,
  description,
  section,
  category,
  badge,
});

export const MENU: MenuItem[] = [
  // PIZZA
  it("Pizza", "Food", "Classic Margherita", 399, "Paneer, Mozzarella, Basil, Tomato Sauce"),
  it("Pizza", "Food", "Fantasy Pizza", 459, "Tomato sauce, black olives, cottage cheese, capsicum, onion, corn, cheese"),
  it("Pizza", "Food", "Peri Peri Paneer", 519, "Tomato sauce, mozzarella, onion, red bell pepper, red paprika, peri peri paneer"),
  it("Pizza", "Food", "New York Corn Pizza", 449, "Sweet corn, red pepper, jalapeno"),
  it("Pizza", "Food", "Basil Pesto", 499, "Basil pesto, mozzarella, cherry tomato"),
  it("Pizza", "Food", "Farm Fresh", 499, "Paneer, onion, mozzarella, olives, sweet corn, bell pepper, baby corn"),
  it("Pizza", "Food", "Gope Gram Side Walk", 490, "Tomato sauce, bell pepper, green chili, onion, jalapenos, olives, paprika, sweetcorn, capsicum", "Chef's Special"),
  // WRAP
  it("Wraps", "Food", "Mexican Wrap", 299, "Spicy Mexican filling wrapped in a soft tortilla"),
  it("Wraps", "Food", "Chilly Paneer Wrap", 349, "Indo-Chinese chilly paneer, crunchy veggies"),
  it("Wraps", "Food", "Erotic Wrap", 299, "Eco-friendly wrap with fresh, zesty filling"),
  it("Wraps", "Food", "Chipotle Cottage Cheese Wrap", 349, "Smoky chipotle paneer & greens"),
  // STARTERS
  it("Starters", "Food", "Corn Cheese Ball", 310, "Golden fried crispy corn & cheese bites"),
  it("Starters", "Food", "Jalapeno Popper", 299, "Cheesy jalapeno stuffed poppers"),
  it("Starters", "Food", "Paneer Tit Bit", 299, "Crispy tossed paneer starter"),
  it("Starters", "Food", "Paneer Pasteer", 348, "Signature paneer starter with house spices", "Chef's Special"),
  // BREAD & TOAST
  it("Bread & Toast", "Food", "Classic Cheese Garlic Bread", 249, "Buttery garlic bread topped with cheese"),
  it("Bread & Toast", "Food", "Jalapeno Olive Garlic Bread", 278, "Cheese garlic bread with jalapenos & olives"),
  it("Bread & Toast", "Food", "Cheese Chilli Toast", 300, "Spicy cheese chilli toast"),
  it("Bread & Toast", "Food", "Avocado Toast", 378, "Smashed avocado on sourdough", "Chef's Special"),
  // OVEN BAKED
  it("Oven Baked", "Food", "Italian Baked Rice", 400, "Rice baked with creamy Italian sauce & cheese"),
  it("Oven Baked", "Food", "Lasagna", 449, "Layered pasta with rich sauce & cheese"),
  it("Oven Baked", "Food", "Pasta Prince", 449, "Baked pasta with a special house sauce"),
  it("Oven Baked", "Food", "Veg Au Gratin", 499, "Vegetables in white sauce, gratinated", "Chef's Special"),
  // FRENCH FRIES
  it("Fries & Nachos", "Food", "Salted Fries", 200, "Crisp golden salted fries"),
  it("Fries & Nachos", "Food", "Peri Peri Fries", 230, "Fries tossed in peri peri seasoning"),
  it("Fries & Nachos", "Food", "Loaded Nachos", 349, "Corn chips loaded with cheese, salsa & jalapenos"),
  it("Fries & Nachos", "Food", "Mexican Chilli Bean Nachos", 299, "Nachos with spicy Mexican beans"),
  // PASTA
  it("Pasta", "Food", "Alfredo", 350, "Creamy white sauce pasta"),
  it("Pasta", "Food", "Arrabbiata", 300, "Spicy Italian tomato sauce pasta"),
  it("Pasta", "Food", "Aglio Olio Spaghetti", 320, "Garlic, olive oil & chilli flakes"),
  it("Pasta", "Food", "Pink Sauce", 350, "Silky pink sauce pasta", "Chef's Special"),
  it("Pasta", "Food", "Pesto Sauce", 390, "Fresh basil pesto pasta"),
  // SALAD
  it("Salad", "Food", "Erotic Cottage Cheese Salad (Hot)", 350, "Warm cottage cheese, crunchy veggies"),
  it("Salad", "Food", "Healthy Greek Salad", 270, "Classic Greek salad with olives & feta-style"),
  // DESSERTS
  it("Signature Desserts", "Dessert", "Berry Bliss", 310, "Layered berry dessert", "New Launch"),
  it("Signature Desserts", "Dessert", "Belgaum Chocolate Delight", 350, "Rich Belgian-style chocolate dessert", "Best Seller"),
  it("Signature Desserts", "Dessert", "Classic Tiramisu", 353, "Coffee-soaked mascarpone tiramisu", "New Launch"),
  it("Signature Desserts", "Dessert", "Mango Parfait", 350, "Layered mango and cream parfait"),
  // SMOOTHIE BOWL
  it("Smoothie Bowls", "Dessert", "Blueberry Bowl", 420, "Blueberry smoothie topped with granola & fruit", "Barista's Special"),
  it("Smoothie Bowls", "Dessert", "Strawberry Bowl", 420, "Strawberry smoothie bowl with granola"),
  // BROWNIES
  it("Brownies", "Dessert", "Choco Brownie", 180, "Fudgy chocolate brownie · addon: vanilla ice cream / Nutella / Biscoff"),
  it("Brownies", "Dessert", "Milk Choco Brownie", 190, "Milk chocolate brownie · addon: vanilla ice cream / Nutella / Biscoff"),
  // CHEESECAKE
  it("Cheesecake", "Dessert", "Classic New York Cheesecake", 240, "Baked New York-style cheesecake"),
  it("Cheesecake", "Dessert", "Blueberry Cheesecake", 300, "Cheesecake with blueberry compote"),
  it("Cheesecake", "Dessert", "Nutella Cheesecake", 310, "Nutella-glazed cheesecake", "Best Seller"),
  it("Cheesecake", "Dessert", "Biscoff Cheesecake", 350, "Biscoff crust & topping", "Best Seller"),
  it("Cheesecake", "Dessert", "Pistachio Cheesecake", 350, "Pistachio cheesecake"),
  it("Cheesecake", "Dessert", "Nutella & Mango Curry Cheesecake", 350, "Nutella cheesecake with mango curry", "Best Seller"),
  it("Cheesecake", "Dessert", "Mango Cheesecake", 330, "Fresh mango cheesecake"),
  // CLOUD
  it("Cloud", "Dessert", "Blueberry Cloud", 280, "Airy blueberry cloud dessert"),
  it("Cloud", "Dessert", "Coconut Cloud", 280, "Coconut cloud dessert", "Barista's Special"),
  it("Cloud", "Dessert", "Strawberry Coconut Cloud", 280, "Strawberry & coconut layered cloud", "Barista's Special"),
  // COOKIES
  it("Cookies", "Dessert", "Bounty Cookie", 120, "Bounty-inspired cookie · addon: Nutella / Biscoff"),
  it("Cookies", "Dessert", "Double Chocolate Cookie", 120, "Rich double chocolate · addon: Nutella / Biscoff"),
  // HOT COFFEE
  it("Hot & Heavenly Coffee", "Dessert", "Espresso", 150, "Single shot of espresso"),
  it("Hot & Heavenly Coffee", "Dessert", "Americano", 180, "Espresso lengthened with hot water"),
  it("Hot & Heavenly Coffee", "Dessert", "Flat White", 200, "Espresso with velvety steamed milk"),
  it("Hot & Heavenly Coffee", "Dessert", "Cappuccino", 200, "Classic cappuccino"),
  it("Hot & Heavenly Coffee", "Dessert", "Latte", 200, "Espresso with steamed milk"),
  it("Hot & Heavenly Coffee", "Dessert", "Mocha", 220, "Chocolate mocha latte"),
  // FRAPPE
  it("Frappe", "Dessert", "Classic Frappe", 260, "Blended cold coffee"),
  it("Frappe", "Dessert", "Caramel Frappe", 280, "Caramel-blended cold coffee"),
  it("Frappe", "Dessert", "Hazelnut Frappe", 300, "Hazelnut cold coffee"),
  it("Frappe", "Dessert", "Mocha Frappe", 320, "Chocolate mocha frappe"),
  it("Frappe", "Dessert", "Choco Hazelnut", 330, "Choco hazelnut frappe", "Best Seller"),
  // ICED
  it("Iced & Aroma", "Dessert", "Iced Espresso", 150, "Chilled espresso"),
  it("Iced & Aroma", "Dessert", "Iced Americano", 180, "Iced Americano"),
  it("Iced & Aroma", "Dessert", "Iced Cafe Bombon", 180, "Espresso over sweetened condensed milk on ice", "Barista's Special"),
  it("Iced & Aroma", "Dessert", "Iced Latte", 230, "Chilled milky latte"),
  it("Iced & Aroma", "Dessert", "Iced Mocha", 240, "Iced chocolate mocha"),
  it("Iced & Aroma", "Dessert", "Affogato", 240, "Espresso poured over vanilla ice cream"),
  // MATCHA
  it("Matcha", "Dessert", "Matcha Latte", 240, "Ceremonial matcha with milk", "Barista's Special"),
  it("Matcha", "Dessert", "Matcha Tonic", 270, "Matcha with tonic water"),
  it("Matcha", "Dessert", "Orange Matcha", 270, "Matcha with orange"),
  it("Matcha", "Dessert", "Creamsicle Matcha", 290, "Cream-swirl matcha", "Barista's Special"),
  it("Matcha", "Dessert", "Strawberry Matcha", 320, "Strawberry matcha latte", "Best Seller"),
  // COFFEE TONIC
  it("Coffee Tonic", "Dessert", "Espresso Tonic", 250, "Espresso layered over chilled tonic", "Barista's Special"),
  it("Coffee Tonic", "Dessert", "Espresso Ginger", 270, "Ginger-infused espresso tonic"),
  it("Coffee Tonic", "Dessert", "Espresso Red Bull", 300, "Espresso layered with Red Bull"),
  it("Coffee Tonic", "Dessert", "Espresso Berry", 300, "Espresso with berry syrup", "Best Seller"),
  it("Coffee Tonic", "Dessert", "Espresso Orange", 340, "Espresso with fresh orange"),
  it("Coffee Tonic", "Dessert", "Espresso Strawberry Bold", 350, "Bold espresso strawberry", "Best Seller"),
  it("Coffee Tonic", "Dessert", "Yuzu Sunrise", 350, "Yuzu citrus espresso sunrise", "Barista's Special"),
];

export const MENU_SECTIONS = Array.from(new Set(MENU.map((m) => m.section)));

// Curated Unsplash imagery per menu section. High-quality, culinary-accurate.
export const SECTION_IMAGES: Record<string, string> = {
  "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=70",
  "Wraps": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=70",
  "Starters": "https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=900&q=70",
  "Bread & Toast": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=70",
  "Oven Baked": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?auto=format&fit=crop&w=900&q=70",
  "Fries & Nachos": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=900&q=70",
  "Pasta": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?auto=format&fit=crop&w=900&q=70",
  "Salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=70",
  "Signature Desserts": "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=70",
  "Smoothie Bowls": "https://images.unsplash.com/photo-1490474504059-bf2db5ab2348?auto=format&fit=crop&w=900&q=70",
  "Brownies": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=70",
  "Cheesecake": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=70",
  "Cloud": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=70",
  "Cookies": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=70",
  "Hot & Heavenly Coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=70",
  "Frappe": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=70",
  "Iced & Aroma": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=70",
  "Matcha": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=900&q=70",
  "Coffee Tonic": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=70",
  "Add-ons": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=70",
};

export function imageForItem(item: MenuItem): string {
  return SECTION_IMAGES[item.section] ??
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70";
}

export const FOOD_SECTIONS = MENU_SECTIONS.filter((s) => MENU.find((m) => m.section === s)?.category === "Food");
export const DESSERT_SECTIONS = MENU_SECTIONS.filter((s) => MENU.find((m) => m.section === s)?.category === "Dessert");

export const CHEFS_SPECIALS = MENU.filter(
  (m) =>
    m.badge === "Chef's Special" ||
    m.badge === "Best Seller" ||
    m.badge === "Barista's Special",
).slice(0, 10);

export const ADDONS: MenuItem[] = [
  it("Add-ons", "Dessert", "Vanilla Ice Cream Scoop", 40, "Add a scoop of vanilla"),
  it("Add-ons", "Dessert", "Nutella Drizzle", 70, "Warm Nutella topping"),
  it("Add-ons", "Dessert", "Biscoff Drizzle", 70, "Biscoff cookie topping"),
  it("Add-ons", "Dessert", "Flavor Shot (Vanilla / Hazelnut / Caramel)", 47, "Any flavor addon"),
];