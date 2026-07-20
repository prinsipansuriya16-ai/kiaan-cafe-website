import { supabase } from "@/integrations/supabase/client";

// Types for dynamic Menu & Sections
export type MenuSection = {
  id: string;
  name: string;
  category: "Food" | "Dessert";
  image_url?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  section_id: string;
  section: string; // Isko strictly string kar diya hai taaki error chali jaye
  badge?: string;
  image_url?: string;
  menu_sections?: MenuSection; // Join relation ke liye
};

// 1. Database se saare sections (categories) fetch karne ka function
export const fetchLiveSections = async (): Promise<MenuSection[]> => {
  const { data, error } = await (supabase
    .from("menu_sections" as any)
    .select("*") as any)
    .order("name", { ascending: true });

  if (error) {
    console.error("Sections load karne mein error:", error.message);
    return [];
  }
  return data as MenuSection[];
};

// 2. Database se saare menu items fetch karne ka function
export const fetchLiveMenu = async (): Promise<MenuItem[]> => {
  const { data, error } = await (supabase
    .from("menu" as any)
    .select("*, menu_sections(*)") as any)
    .order("name", { ascending: true });

  if (error) {
    console.error("Menu items load karne mein error:", error.message);
    return [];
  }
  
  // Dynamic mapping with strict section name fallback
  return (data as any[]).map(item => ({
    ...item,
    section: item.menu_sections?.name || ""
  })) as unknown as MenuItem[];
};

// 3. Image URL helper: Agar database mein custom image na ho, toh section ki default image use karein
export function imageForItem(item: MenuItem, sectionImage?: string): string {
  if (item.image_url) return item.image_url;
  if (sectionImage) return sectionImage;
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70";
}

// ==========================================
// Purane static elements ke fallbacks (taaki baki files break na ho)
// ==========================================
export const MENU: MenuItem[] = [];

export const MENU_SECTIONS = [
  "Pizza", "Wraps", "Starters", "Bread & Toast", "Oven Baked", "Fries & Nachos", 
  "Pasta", "Salad", "Signature Desserts", "Smoothie Bowls", "Brownies", 
  "Cheesecake", "Cloud", "Cookies", "Hot & Heavenly Coffee", "Frappe", 
  "Iced & Aroma", "Matcha", "Coffee Tonic"
];

export const FOOD_SECTIONS = ["Pizza", "Wraps", "Starters", "Bread & Toast", "Oven Baked", "Fries & Nachos", "Pasta", "Salad"];
export const DESSERT_SECTIONS = ["Signature Desserts", "Smoothie Bowls", "Brownies", "Cheesecake", "Cloud", "Cookies", "Hot & Heavenly Coffee", "Frappe", "Iced & Aroma", "Matcha", "Coffee Tonic"];
// Isko file ke bilkul end me copy paste kar dijiye
// Isko file ke bilkul end me copy paste kar dijiye
export const CHEFS_SPECIALS: MenuItem[] = [];