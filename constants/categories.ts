// ── FILE: constants/categories.ts ─────────────────────────────────────────────
// Centralized category registry with Lucide icons + auto-detection from merchant names.

import {
  Film, Music, ShoppingBag, Plane, Settings2, Cloud, Briefcase,
  UtensilsCrossed, Gamepad2, Dumbbell, GraduationCap, Heart,
  Landmark, Wifi, Package, Tv, Video, Palette, PenTool,
  Smartphone, Car, type LucideIcon,
} from 'lucide-react-native';

// ── CATEGORY DEFINITIONS ──────────────────────────────────────────────────────
export interface CategoryDef {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;           // accent color for the category
  bgColor: string;         // subtle background for icon boxes
  keywords: string[];      // merchant name keywords for auto-detection
}

export const CATEGORIES: CategoryDef[] = [
  {
    key: 'Entertainment',
    label: 'Entertainment',
    Icon: Film,
    color: '#E040FB',
    bgColor: 'rgba(224,64,251,0.1)',
    keywords: ['netflix', 'hotstar', 'prime video', 'disney', 'jiocinema', 'zee5', 'sonyliv', 'mubi', 'voot'],
  },
  {
    key: 'Music',
    label: 'Music',
    Icon: Music,
    color: '#1DB954',
    bgColor: 'rgba(29,185,84,0.1)',
    keywords: ['spotify', 'apple music', 'gaana', 'jiosaavn', 'wynk', 'youtube music', 'soundcloud'],
  },
  {
    key: 'Streaming',
    label: 'Streaming',
    Icon: Tv,
    color: '#FF5252',
    bgColor: 'rgba(255,82,82,0.1)',
    keywords: ['youtube', 'twitch', 'youtube premium'],
  },
  {
    key: 'Food',
    label: 'Food & Delivery',
    Icon: UtensilsCrossed,
    color: '#FF6D00',
    bgColor: 'rgba(255,109,0,0.1)',
    keywords: ['zomato', 'swiggy', 'dunzo', 'blinkit', 'zepto', 'bigbasket', 'instamart'],
  },
  {
    key: 'Shopping',
    label: 'Shopping',
    Icon: ShoppingBag,
    color: '#FFD600',
    bgColor: 'rgba(255,214,0,0.1)',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'tata cliq'],
  },
  {
    key: 'Productivity',
    label: 'Productivity',
    Icon: Settings2,
    color: '#448AFF',
    bgColor: 'rgba(68,138,255,0.1)',
    keywords: ['notion', 'figma', 'slack', 'todoist', 'evernote', 'grammarly', 'zoom', 'canva'],
  },
  {
    key: 'Design',
    label: 'Design & Creative',
    Icon: Palette,
    color: '#FF4081',
    bgColor: 'rgba(255,64,129,0.1)',
    keywords: ['adobe', 'creative cloud', 'photoshop', 'illustrator', 'premiere', 'after effects', 'procreate'],
  },
  {
    key: 'Cloud',
    label: 'Cloud Storage',
    Icon: Cloud,
    color: '#40C4FF',
    bgColor: 'rgba(64,196,255,0.1)',
    keywords: ['google one', 'icloud', 'dropbox', 'onedrive', 'google drive', 'mega'],
  },
  {
    key: 'Professional',
    label: 'Professional',
    Icon: Briefcase,
    color: '#7C4DFF',
    bgColor: 'rgba(124,77,255,0.1)',
    keywords: ['linkedin', 'github', 'copilot', 'chatgpt', 'openai', 'microsoft 365'],
  },
  {
    key: 'Travel',
    label: 'Travel',
    Icon: Plane,
    color: '#00BFA5',
    bgColor: 'rgba(0,191,165,0.1)',
    keywords: ['makemytrip', 'goibibo', 'cleartrip', 'booking', 'airbnb', 'oyo', 'ixigo'],
  },
  {
    key: 'Gaming',
    label: 'Gaming',
    Icon: Gamepad2,
    color: '#69F0AE',
    bgColor: 'rgba(105,240,174,0.1)',
    keywords: ['xbox', 'playstation', 'steam', 'epic games', 'nvidia', 'ea play', 'game pass'],
  },
  {
    key: 'Fitness',
    label: 'Fitness & Health',
    Icon: Dumbbell,
    color: '#FF6E40',
    bgColor: 'rgba(255,110,64,0.1)',
    keywords: ['cult', 'fittr', 'healthify', 'strava', 'headspace', 'calm', 'peloton', 'gym'],
  },
  {
    key: 'Education',
    label: 'Education',
    Icon: GraduationCap,
    color: '#536DFE',
    bgColor: 'rgba(83,109,254,0.1)',
    keywords: ['coursera', 'udemy', 'unacademy', 'byjus', 'skillshare', 'masterclass', 'duolingo'],
  },
  {
    key: 'Insurance',
    label: 'Insurance & Finance',
    Icon: Landmark,
    color: '#B2FF59',
    bgColor: 'rgba(178,255,89,0.1)',
    keywords: ['lic', 'insurance', 'policy', 'mutual fund', 'sip', 'zerodha'],
  },
  {
    key: 'Telecom',
    label: 'Telecom & Internet',
    Icon: Wifi,
    color: '#18FFFF',
    bgColor: 'rgba(24,255,255,0.1)',
    keywords: ['jio', 'airtel', 'vi', 'bsnl', 'broadband', 'act fibernet'],
  },
  {
    key: 'Auto',
    label: 'Auto & Transport',
    Icon: Car,
    color: '#FFAB40',
    bgColor: 'rgba(255,171,64,0.1)',
    keywords: ['ola', 'uber', 'rapido', 'petrol', 'fuel', 'fastag', 'parking'],
  },
  {
    key: 'Other',
    label: 'Other',
    Icon: Package,
    color: '#90A4AE',
    bgColor: 'rgba(144,164,174,0.1)',
    keywords: [],
  },
];

// ── LOOKUP MAP ────────────────────────────────────────────────────────────────
const categoryMap = new Map<string, CategoryDef>();
CATEGORIES.forEach((c) => categoryMap.set(c.key, c));

export function getCategoryDef(key: string): CategoryDef {
  return categoryMap.get(key) ?? CATEGORIES[CATEGORIES.length - 1]; // fallback to 'Other'
}

// ── SUBSCRIPTION ICON LOOKUP ──────────────────────────────────────────────────
// Map the old icon keys (from seed data) to specific Lucide icons
import {
  Clapperboard, Headphones, Truck, PlayCircle, Star,
  ChefHat, PenLine, Brush, CloudCog, VideoIcon, Rocket, Award,
} from 'lucide-react-native';

const SUBSCRIPTION_ICONS: Record<string, LucideIcon> = {
  // Seed data icon keys
  movie: Clapperboard,
  music_note: Headphones,
  local_shipping: Truck,
  play_circle: PlayCircle,
  stars: Star,
  restaurant: ChefHat,
  palette: Palette,
  brush: Brush,
  cloud: Cloud,
  video_camera_front: VideoIcon,
  fastfood: UtensilsCrossed,
  work: Briefcase,
  auto_awesome: Rocket,
  notifications_active: Award,
  // Category-based fallback keys
  entertainment: Film,
  music: Music,
  streaming: Tv,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  productivity: Settings2,
  design: Palette,
  professional: Briefcase,
  travel: Plane,
  gaming: Gamepad2,
  fitness: Dumbbell,
  education: GraduationCap,
  insurance: Landmark,
  telecom: Wifi,
  auto: Car,
  other: Package,
};

export function getSubscriptionIcon(iconKey: string): LucideIcon {
  return SUBSCRIPTION_ICONS[iconKey] ?? SUBSCRIPTION_ICONS[iconKey.toLowerCase()] ?? Package;
}

// ── AUTO-DETECT CATEGORY ──────────────────────────────────────────────────────
// Given a merchant name, guess the category.
export function detectCategory(merchantName: string): string {
  const lower = merchantName.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return cat.key;
    }
  }
  return 'Other';
}
