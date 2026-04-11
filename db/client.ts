// ── FILE: db/client.ts ────────────────────────────────────────────────────────
// Pure expo-sqlite implementation — NO drizzle-orm dependency.

import * as SQLite from 'expo-sqlite';
import type { Card, Subscription } from '../store/useStore';

let sqlite: SQLite.SQLiteDatabase | null = null;

function getSQLite(): SQLite.SQLiteDatabase {
  if (!sqlite) {
    sqlite = SQLite.openDatabaseSync('cardexa.db');
  }
  return sqlite;
}

function parseGradient(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── SEED DATA ─────────────────────────────────────────────────────────────────
const SEED_CARDS: Card[] = [
  {
    id: 'hdfc',
    bank: 'HDFC Bank',
    variant: 'HDFC INFINIA',
    last4: '4521',
    expiry: '08/27',
    network: 'Visa',
    gradient: ['from-[#8b1d1d]', 'via-[#e11d48]', 'to-[#4c0519]'],
    monthlySpend: 976,
  },
  {
    id: 'icici',
    bank: 'ICICI Bank',
    variant: 'ICICI EMERALDE',
    last4: '8834',
    expiry: '03/26',
    network: 'Mastercard',
    gradient: ['from-[#E65C00]', 'to-[#993D00]'],
    monthlySpend: 637,
  },
  {
    id: 'sbi',
    bank: 'State Bank of India',
    variant: 'SBI AURUM',
    last4: '2210',
    expiry: '11/28',
    network: 'RuPay',
    gradient: ['from-[#003366]', 'to-[#001A33]'],
    monthlySpend: 629,
  },
  {
    id: 'axis',
    bank: 'Axis Bank',
    variant: 'AXIS BANK MAGNUS',
    last4: '6603',
    expiry: '06/27',
    network: 'Visa',
    gradient: ['from-[#4A0E1C]', 'to-[#2D0911]'],
    monthlySpend: 1384,
  },
];

const SEED_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub_netflix',  name: 'Netflix',             cardId: 'hdfc',  amount: 649,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 3,  category: 'Entertainment', icon: 'movie',          status: 'urgent'       },
  { id: 'sub_spotify',  name: 'Spotify Premium',     cardId: 'hdfc',  amount: 119,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 12, category: 'Music',         icon: 'music_note',     status: 'safe'         },
  { id: 'sub_prime',    name: 'Amazon Prime',         cardId: 'icici', amount: 1499, billingType: 'recurring', cycle: 'yearly',    renewalDays: 45, category: 'Shopping',      icon: 'local_shipping', status: 'safe'         },
  { id: 'sub_yt',       name: 'YouTube Premium',      cardId: 'hdfc',  amount: 189,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 6,  category: 'Streaming',     icon: 'play_circle',    status: 'warning'      },
  { id: 'sub_hotstar',  name: 'Disney+ Hotstar',      cardId: 'icici', amount: 299,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 2,  category: 'Entertainment', icon: 'stars',          status: 'urgent'       },
  { id: 'sub_zomato',   name: 'Zomato Pro',           cardId: 'axis',  amount: 299,  billingType: 'trial',     cycle: null,        renewalDays: 4,  category: 'Food',          icon: 'restaurant',     status: 'trial-urgent' },
  { id: 'sub_canva',    name: 'Canva Pro',             cardId: 'sbi',   amount: 499,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 18, category: 'Productivity',  icon: 'palette',        status: 'safe'         },
  { id: 'sub_adobe',    name: 'Adobe Creative Cloud', cardId: 'axis',  amount: 4230, billingType: 'recurring', cycle: 'monthly',   renewalDays: 22, category: 'Design',        icon: 'brush',          status: 'safe'         },
  { id: 'sub_gone',     name: 'Google One',           cardId: 'sbi',   amount: 130,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 9,  category: 'Cloud',         icon: 'cloud',          status: 'warning'      },
  { id: 'sub_zoom',     name: 'Zoom Pro',             cardId: 'axis',  amount: 1300, billingType: 'recurring', cycle: 'monthly',   renewalDays: 14, category: 'Productivity',  icon: 'video_camera_front', status: 'safe'    },
  { id: 'sub_swiggy',   name: 'Swiggy One',           cardId: 'icici', amount: 299,  billingType: 'recurring', cycle: 'quarterly', renewalDays: 30, category: 'Food',          icon: 'fastfood',       status: 'safe'         },
  { id: 'sub_linkedin', name: 'LinkedIn Premium',     cardId: 'axis',  amount: 2999, billingType: 'recurring', cycle: 'monthly',   renewalDays: 5,  category: 'Professional',  icon: 'work',           status: 'warning'      },
];

// ── INIT ──────────────────────────────────────────────────────────────────────
export async function initDB(reset = false): Promise<void> {
  const db = getSQLite();
  await db.execAsync(`PRAGMA journal_mode = WAL;`);

  if (reset) {
    await db.execAsync(`DROP TABLE IF EXISTS cards; DROP TABLE IF EXISTS subscriptions; DROP TABLE IF EXISTS processed_sms; DROP TABLE IF EXISTS sync_log;`);
  }

  // Users table is never dropped on reset so accounts persist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      bank TEXT NOT NULL,
      variant TEXT NOT NULL,
      last4 TEXT NOT NULL,
      expiry TEXT NOT NULL,
      network TEXT NOT NULL,
      gradient TEXT NOT NULL,
      monthly_spend REAL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      card_id TEXT NOT NULL,
      amount REAL NOT NULL,
      billing_type TEXT NOT NULL,
      cycle TEXT,
      renewal_days INTEGER NOT NULL,
      trial_ends_amount REAL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS processed_sms (
      id TEXT PRIMARY KEY,
      processed_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      synced_at INTEGER NOT NULL,
      fetched INTEGER DEFAULT 0,
      parsed INTEGER DEFAULT 0,
      new_count INTEGER DEFAULT 0
    );
  `);
}

export async function seedIfEmpty(): Promise<void> {
  const db = getSQLite();
  const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM cards');
  if (result && result.count > 0) return;

  const now = Date.now();

  // Insert seed cards
  for (const c of SEED_CARDS) {
    db.runSync(
      `INSERT OR IGNORE INTO cards (id, bank, variant, last4, expiry, network, gradient, monthly_spend, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      c.id, c.bank, c.variant, c.last4, c.expiry, c.network, JSON.stringify(c.gradient), c.monthlySpend, now
    );
  }

  // Insert seed subscriptions
  for (const s of SEED_SUBSCRIPTIONS) {
    db.runSync(
      `INSERT OR IGNORE INTO subscriptions (id, name, card_id, amount, billing_type, cycle, renewal_days, trial_ends_amount, category, icon, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      s.id, s.name, s.cardId, s.amount, s.billingType, s.cycle ?? null, s.renewalDays, null, s.category, s.icon, s.status, now
    );
  }
}

// ── QUERIES ───────────────────────────────────────────────────────────────────
export async function fetchAllCards(): Promise<Card[]> {
  const db = getSQLite();
  const rows = db.getAllSync<any>('SELECT * FROM cards');
  return rows.map((r) => ({
    id:          r.id,
    bank:        r.bank,
    variant:     r.variant,
    last4:       r.last4,
    expiry:      r.expiry,
    network:     r.network as Card['network'],
    gradient:    parseGradient(r.gradient),
    monthlySpend: r.monthly_spend ?? 0,
  }));
}

export async function fetchAllSubscriptions(): Promise<Subscription[]> {
  const db = getSQLite();
  const rows = db.getAllSync<any>('SELECT * FROM subscriptions');
  return rows.map((r) => ({
    id:              r.id,
    name:            r.name,
    cardId:          r.card_id,
    amount:          r.amount,
    billingType:     r.billing_type as Subscription['billingType'],
    cycle:           r.cycle as Subscription['cycle'],
    renewalDays:     r.renewal_days,
    trialEndsAmount: r.trial_ends_amount ?? undefined,
    category:        r.category as Subscription['category'],
    icon:            r.icon,
    status:          r.status as Subscription['status'],
  }));
}

export async function saveCard(card: Card): Promise<void> {
  const db = getSQLite();
  db.runSync(
    `INSERT INTO cards (id, bank, variant, last4, expiry, network, gradient, monthly_spend, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    card.id, card.bank, card.variant, card.last4, card.expiry, card.network, JSON.stringify(card.gradient), card.monthlySpend, Date.now()
  );
}

export async function saveSubscription(sub: Subscription): Promise<void> {
  const db = getSQLite();
  db.runSync(
    `INSERT INTO subscriptions (id, name, card_id, amount, billing_type, cycle, renewal_days, trial_ends_amount, category, icon, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    sub.id, sub.name, sub.cardId, sub.amount, sub.billingType, sub.cycle ?? null, sub.renewalDays, sub.trialEndsAmount ?? null, sub.category, sub.icon, sub.status, Date.now()
  );
}

export async function markSMSProcessed(id: string): Promise<void> {
  const db = getSQLite();
  db.runSync(
    `INSERT INTO processed_sms (id, processed_at) VALUES (?, ?)`,
    id, Date.now()
  );
}

export async function deleteSubscriptionById(id: string): Promise<void> {
  const db = getSQLite();
  db.runSync('DELETE FROM subscriptions WHERE id = ?', id);
}

// ── AUTH ───────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// Simple local hash (not cryptographically secure — this is local-first, no server)
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0; // Convert to 32bit integer
  }
  // Mix in length for extra entropy and convert to hex
  const mixed = Math.abs(hash ^ (input.length * 31));
  return `sh_${mixed.toString(16).padStart(8, '0')}_${input.length}`;
}

function generateId(): string {
  return `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateSessionId(): string {
  return `ses_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthUser | { error: string }> {
  const db = getSQLite();
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if email exists
  const existing = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE email = ?', normalizedEmail);
  if (existing && existing.count > 0) {
    return { error: 'An account with this email already exists' };
  }

  const id = generateId();
  const passwordHash = simpleHash(password);
  const now = Date.now();

  db.runSync(
    'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    id, name.trim(), normalizedEmail, passwordHash, now
  );

  // Create session
  const sessionId = generateSessionId();
  db.runSync(
    'INSERT INTO sessions (id, user_id, created_at) VALUES (?, ?, ?)',
    sessionId, id, now
  );

  return { id, name: name.trim(), email: normalizedEmail };
}

export async function loginUser(email: string, password: string): Promise<AuthUser | { error: string }> {
  const db = getSQLite();
  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = simpleHash(password);

  const user = db.getFirstSync<{ id: string; name: string; email: string; password_hash: string }>(
    'SELECT id, name, email, password_hash FROM users WHERE email = ?',
    normalizedEmail
  );

  if (!user) {
    return { error: 'No account found with this email' };
  }

  if (user.password_hash !== passwordHash) {
    return { error: 'Incorrect password' };
  }

  // Create session
  const sessionId = generateSessionId();
  db.runSync(
    'INSERT INTO sessions (id, user_id, created_at) VALUES (?, ?, ?)',
    sessionId, user.id, Date.now()
  );

  return { id: user.id, name: user.name, email: user.email };
}

export async function getActiveSession(): Promise<AuthUser | null> {
  const db = getSQLite();

  // Get most recent session
  const session = db.getFirstSync<{ user_id: string }>(
    'SELECT user_id FROM sessions ORDER BY created_at DESC LIMIT 1'
  );

  if (!session) return null;

  const user = db.getFirstSync<{ id: string; name: string; email: string }>(
    'SELECT id, name, email FROM users WHERE id = ?',
    session.user_id
  );

  return user ?? null;
}

export async function logoutUser(): Promise<void> {
  const db = getSQLite();
  db.runSync('DELETE FROM sessions');
}
