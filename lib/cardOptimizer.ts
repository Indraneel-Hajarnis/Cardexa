// ── FILE: lib/cardOptimizer.ts ────────────────────────────────────────────────
// Heuristic engine: given a merchant name, transaction amount, recurrence, and
// the user's actual cards, recommends the optimal card and explains why.
// Card reward profiles are derived from bank + network instead of being
// hardcoded, so the engine adapts to whatever cards the user has added.

import type { Card, Network } from '../store/useStore';

export type Recurrence = 'one-time' | 'monthly' | 'quarterly' | 'yearly';

// ── BANK REWARD PROFILES ──────────────────────────────────────────────────────
// Each bank has a base reward rate + category-specific bonuses.

interface BankProfile {
  baseRewardPct: number;
  categoryBonuses: Record<string, number>;
  annualFee: number;
  rewardCap: number;
  highValueThreshold: number;
  highValueBonus: number;
  perks: string[];
}

const BANK_PROFILES: Record<string, BankProfile> = {
  'HDFC Bank': {
    baseRewardPct: 3.3,
    categoryBonuses: {
      makemytrip: 5, goibibo: 5, irctc: 4, cleartrip: 4, oyo: 4, booking: 4, airbnb: 4,
      indigo: 3, airindia: 3, vistara: 3, spicejet: 3, airport: 3,
      zomato: 4, swiggy: 4, restaurant: 3, cafe: 3, dominos: 2, mcdonalds: 2,
      netflix: 2, hotstar: 2, spotify: 2, prime: 2, youtube: 2,
      amazon: 2, flipkart: 1.5, myntra: 1.5, ajio: 1.5,
    },
    annualFee: 10000,
    rewardCap: 2500,
    highValueThreshold: 5000,
    highValueBonus: 1.0,
    perks: ['Unlimited lounge access', '10x rewards on travel', 'Premium concierge', 'Golf privileges'],
  },
  'ICICI Bank': {
    baseRewardPct: 2.0,
    categoryBonuses: {
      amazon: 5, flipkart: 3, myntra: 3, ajio: 3, nykaa: 3, meesho: 2,
      netflix: 3, hotstar: 3, spotify: 3, prime: 4, youtube: 2, jiocinema: 2,
      bigbasket: 3, blinkit: 3, zepto: 3, instamart: 3, swiggy: 2, zomato: 2,
      hp: 2.5, iocl: 2.5, bpcl: 2.5, petrol: 2.5, fuel: 2.5,
    },
    annualFee: 12000,
    rewardCap: 3000,
    highValueThreshold: 3000,
    highValueBonus: 0.5,
    perks: ['5% on Amazon', 'Airport lounge (8/yr)', 'Movie ticket BOGO', 'Fuel surcharge waiver'],
  },
  'State Bank of India': {
    baseRewardPct: 1.5,
    categoryBonuses: {
      bigbasket: 5, dmart: 5, reliance: 4, more: 4, spencers: 4, zepto: 3, blinkit: 3,
      electricity: 3, water: 3, gas: 3, broadband: 3, jio: 2, airtel: 2, vi: 2,
      lic: 2.5, health: 2, insurance: 2.5, emi: 1.5,
      hp: 3.5, iocl: 3.5, bpcl: 3.5, petrol: 3.5, fuel: 3.5, diesel: 3.5,
      irctc: 2, passport: 2,
    },
    annualFee: 4999,
    rewardCap: Infinity,
    highValueThreshold: 10000,
    highValueBonus: 1.5,
    perks: ['Best fuel rewards', 'No reward cap', 'Utility bill cashback', 'Low annual fee'],
  },
  'Axis Bank': {
    baseRewardPct: 2.5,
    categoryBonuses: {
      makemytrip: 4, goibibo: 4, irctc: 3, cleartrip: 3,
      amazon: 3, flipkart: 3, myntra: 2.5,
      zomato: 3, swiggy: 3,
      netflix: 2.5, hotstar: 2.5, spotify: 2, prime: 2,
      hp: 2, iocl: 2, bpcl: 2, petrol: 2, fuel: 2,
    },
    annualFee: 5000,
    rewardCap: 2000,
    highValueThreshold: 4000,
    highValueBonus: 0.8,
    perks: ['EDGE rewards program', 'Airport lounge (4/yr)', 'Dining privileges', 'EMI cashback'],
  },
  'Kotak Mahindra Bank': {
    baseRewardPct: 1.8,
    categoryBonuses: {
      amazon: 3, flipkart: 2.5, myntra: 2,
      zomato: 3, swiggy: 3, dominos: 2, restaurant: 2.5,
      netflix: 2, hotstar: 2, spotify: 2,
      bigbasket: 2, blinkit: 2,
      hp: 2, iocl: 2, bpcl: 2, petrol: 2, fuel: 2,
    },
    annualFee: 3000,
    rewardCap: 1800,
    highValueThreshold: 5000,
    highValueBonus: 0.5,
    perks: ['PVR movie offers', 'Dining discounts', 'Fuel surcharge waiver', 'EMI conversion'],
  },
  'Yes Bank': {
    baseRewardPct: 1.5,
    categoryBonuses: {
      amazon: 2.5, flipkart: 2, myntra: 2,
      zomato: 2, swiggy: 2,
      netflix: 2, hotstar: 2,
      hp: 1.5, iocl: 1.5, bpcl: 1.5, petrol: 1.5, fuel: 1.5,
      makemytrip: 3, goibibo: 3,
    },
    annualFee: 2500,
    rewardCap: 1500,
    highValueThreshold: 5000,
    highValueBonus: 0.5,
    perks: ['Travel rewards', 'Milestone bonuses', 'Fuel surcharge waiver', 'Dining offers'],
  },
  'IndusInd Bank': {
    baseRewardPct: 1.5,
    categoryBonuses: {
      makemytrip: 4, goibibo: 4, cleartrip: 3,
      amazon: 2, flipkart: 2,
      zomato: 3, swiggy: 3, restaurant: 3, cafe: 2.5,
      netflix: 2, hotstar: 2, spotify: 2,
    },
    annualFee: 2999,
    rewardCap: 1800,
    highValueThreshold: 5000,
    highValueBonus: 0.5,
    perks: ['Airport lounge (4/yr)', 'Dining privileges', 'Weekend offers', 'EMI options'],
  },
  'Bank of Baroda': {
    baseRewardPct: 1.0,
    categoryBonuses: {
      zomato: 5, swiggy: 5, dominos: 4, mcdonalds: 3, kfc: 3, restaurant: 4, cafe: 3,
      starbucks: 4, chaayos: 3,
      coursera: 3, udemy: 3, unacademy: 3, byjus: 2, school: 2, college: 2, university: 2,
      pharmacy: 3, apollo: 3, medplus: 3, netmeds: 3, hospital: 2, doctor: 2,
      makemytrip: 2, irctc: 2,
      upi: 1, phonepe: 1, gpay: 1,
    },
    annualFee: 1499,
    rewardCap: 1500,
    highValueThreshold: 2000,
    highValueBonus: 0.5,
    perks: ['5% on food delivery', 'Edu & health rewards', 'Lowest annual fee', 'No min. spend'],
  },
};

// Fallback for banks we don't have specific data for
const DEFAULT_BANK_PROFILE: BankProfile = {
  baseRewardPct: 1.0,
  categoryBonuses: {},
  annualFee: 500,
  rewardCap: 1000,
  highValueThreshold: 5000,
  highValueBonus: 0.3,
  perks: ['Standard rewards', 'Basic cashback'],
};

// ── NETWORK BONUSES & TRAITS ──────────────────────────────────────────────────
// Different card networks have different strengths depending on merchant type.

interface NetworkTraits {
  /** Extra reward % for merchants in this network's sweet spot */
  bonuses: Record<string, number>;
  /** Merchants/categories this network doesn't support well (penalty) */
  penalties: Record<string, number>;
  /** Human-readable network perks */
  perks: string[];
  /** General acceptance score (higher = more widely accepted) */
  acceptanceScore: number;
}

const NETWORK_TRAITS: Record<Network, NetworkTraits> = {
  'Visa': {
    bonuses: {
      // International merchants
      booking: 1.5, airbnb: 1.5, amazon: 0.5, netflix: 0.5, spotify: 0.5,
      uber: 1, apple: 1, google: 0.5, microsoft: 0.5,
      // Cross-border travel
      makemytrip: 0.5, cleartrip: 0.5, indigo: 0.5,
    },
    penalties: {},
    perks: ['Global acceptance', 'Visa Offers platform', 'Zero liability fraud protection', 'Cross-border acceptance'],
    acceptanceScore: 10,
  },
  'Mastercard': {
    bonuses: {
      // Dining & lifestyle
      zomato: 1, swiggy: 1, restaurant: 1, cafe: 0.5, starbucks: 0.5,
      dominos: 0.5, mcdonalds: 0.5,
      // Entertainment
      netflix: 0.5, hotstar: 0.5, spotify: 0.5, prime: 0.5,
      // Shopping
      flipkart: 0.5, myntra: 0.5, ajio: 0.5,
      // Travel
      makemytrip: 0.5, goibibo: 0.5,
    },
    penalties: {},
    perks: ['Mastercard Surpass benefits', 'Priceless experiences', 'Dining program discounts', 'SmartData insights'],
    acceptanceScore: 9,
  },
  'RuPay': {
    bonuses: {
      // Government & domestic
      irctc: 2, passport: 1.5,
      // Fuel — strong RuPay advantage
      hp: 1.5, iocl: 1.5, bpcl: 1.5, petrol: 1.5, fuel: 1.5, diesel: 1.5,
      // Insurance & PSU
      lic: 2, insurance: 1.5, emi: 1,
      // Utility
      electricity: 1.5, water: 1, gas: 1, broadband: 1,
      jio: 1, airtel: 0.5, vi: 0.5, bsnl: 1,
      // Domestic e-commerce
      flipkart: 0.5, bigbasket: 0.5, blinkit: 0.5,
    },
    penalties: {
      // International services are weaker on RuPay
      netflix: -0.5, spotify: -0.5, amazon: -0.3,
      booking: -1, airbnb: -1, uber: -0.5,
    },
    perks: ['Zero MDR on UPI', 'IRCTC bonus rewards', 'NPCI cashback offers', 'Govt service discounts'],
    acceptanceScore: 7,
  },
};

// ── RECURRENCE HELPERS ────────────────────────────────────────────────────────

function frequencyPerYear(recurrence: Recurrence): number {
  switch (recurrence) {
    case 'monthly':   return 12;
    case 'quarterly': return 4;
    case 'yearly':    return 1;
    case 'one-time':  return 0;
  }
}

function recurrenceLabel(recurrence: Recurrence): string {
  switch (recurrence) {
    case 'monthly':   return 'month';
    case 'quarterly': return 'quarter';
    case 'yearly':    return 'year';
    case 'one-time':  return '';
  }
}

// ── MERCHANT KEYWORD MATCHING ────────────────────────────────────────────────
function matchMerchant(merchant: string, keywords: Record<string, number>): { bonus: number; keyword: string } {
  const lower = merchant.toLowerCase().replace(/[^a-z0-9]/g, '');
  let bestBonus = 0;
  let bestKeyword = '';
  for (const [keyword, bonus] of Object.entries(keywords)) {
    if (lower.includes(keyword)) {
      if (bonus > bestBonus) {
        bestBonus = bonus;
        bestKeyword = keyword;
      }
    }
  }
  return { bonus: bestBonus, keyword: bestKeyword };
}

// ── CORE OPTIMIZER ────────────────────────────────────────────────────────────
export interface OptimizationResult {
  card: Card;
  bankProfile: BankProfile;
  networkName: Network;
  score: number;
  effectiveReward: number;
  cashbackEstimate: number;
  annualSavings: number;
  netAnnualValue: number;
  reasons: string[];
  tag: string;
  gradient: string[];
}

export function optimizeCard(
  merchant: string,
  amount: number,
  recurrence: Recurrence = 'one-time',
  userCards: Card[],
): OptimizationResult[] {
  if (!merchant.trim() || amount <= 0 || userCards.length === 0) return [];

  const freq = frequencyPerYear(recurrence);
  const isRecurring = freq > 0;

  const results: OptimizationResult[] = userCards.map((card) => {
    const bankProfile = BANK_PROFILES[card.bank] ?? DEFAULT_BANK_PROFILE;
    const networkTraits = NETWORK_TRAITS[card.network];
    let effectiveReward = bankProfile.baseRewardPct;
    const reasons: string[] = [];

    // 1. Category bonus (from bank)
    const catMatch = matchMerchant(merchant, bankProfile.categoryBonuses);
    if (catMatch.bonus > 0) {
      effectiveReward += catMatch.bonus;
      reasons.push(`+${catMatch.bonus}% ${card.bank} category bonus for this merchant`);
    }

    // 2. Network bonus/penalty
    const netBonus = matchMerchant(merchant, networkTraits.bonuses);
    const netPenalty = matchMerchant(merchant, networkTraits.penalties);

    if (netBonus.bonus > 0) {
      effectiveReward += netBonus.bonus;
      reasons.push(`+${netBonus.bonus}% ${card.network} network bonus`);
    }
    if (netPenalty.bonus < 0) {
      effectiveReward += netPenalty.bonus; // negative
      reasons.push(`${netPenalty.bonus}% — ${card.network} has limited support for this merchant`);
    }

    // 3. High-value bonus
    if (amount >= bankProfile.highValueThreshold) {
      effectiveReward += bankProfile.highValueBonus;
      reasons.push(`+${bankProfile.highValueBonus}% high-value txn bonus (≥₹${bankProfile.highValueThreshold.toLocaleString('en-IN')})`);
    }

    // 4. Reward cap check
    effectiveReward = Math.max(0, effectiveReward); // floor at 0
    const rawCashback = (effectiveReward / 100) * amount;
    const actualCashback = Math.min(rawCashback, bankProfile.rewardCap);
    let cappedReward = effectiveReward;
    if (rawCashback > bankProfile.rewardCap) {
      cappedReward = (bankProfile.rewardCap / amount) * 100;
      reasons.push(`⚠️ Reward capped at ₹${bankProfile.rewardCap.toLocaleString('en-IN')} per txn`);
    }

    // 5. Base reward + network context
    reasons.unshift(`${bankProfile.baseRewardPct}% base reward (${card.bank})`);
    reasons.push(`🔗 Network: ${card.network} (acceptance: ${networkTraits.acceptanceScore}/10)`);

    // 6. Recurrence-specific insights
    let annualSavings = 0;
    let netAnnualValue = 0;

    if (isRecurring) {
      annualSavings = actualCashback * freq;
      netAnnualValue = annualSavings - bankProfile.annualFee;

      reasons.push(`💰 ₹${Math.round(annualSavings).toLocaleString('en-IN')}/yr from this ${recurrenceLabel(recurrence)}ly payment alone`);

      if (rawCashback > bankProfile.rewardCap) {
        const annualLost = (rawCashback - bankProfile.rewardCap) * freq;
        reasons.push(`⚠️ You lose ~₹${Math.round(annualLost).toLocaleString('en-IN')}/yr to reward cap on this recurring charge`);
      }

      if (bankProfile.annualFee > 0) {
        if (annualSavings >= bankProfile.annualFee) {
          const monthsToBreakEven = Math.ceil(bankProfile.annualFee / (actualCashback * (freq / 12)));
          reasons.push(`✓ Pays off ₹${bankProfile.annualFee.toLocaleString('en-IN')} annual fee in ${monthsToBreakEven} month${monthsToBreakEven > 1 ? 's' : ''}`);
        } else {
          const pctCovered = Math.round((annualSavings / bankProfile.annualFee) * 100);
          reasons.push(`Annual fee coverage: ${pctCovered}% from this recurring charge`);
        }
      } else {
        reasons.push('✓ No annual fee — all rewards are pure savings');
      }
    } else {
      if (bankProfile.annualFee === 0) {
        reasons.push('✓ No annual fee');
      } else if (bankProfile.annualFee <= 2000) {
        reasons.push(`✓ Low annual fee (₹${bankProfile.annualFee.toLocaleString('en-IN')})`);
      }
    }

    // ── SCORING ──────────────────────────────────────────────────────────────
    let score: number;
    const totalBonus = catMatch.bonus + netBonus.bonus + Math.min(0, netPenalty.bonus);
    const networkAcceptance = networkTraits.acceptanceScore;

    if (isRecurring) {
      const rewardScore = Math.min(cappedReward * 8, 40);
      const catScore = totalBonus > 0 ? Math.min(totalBonus * 4, 15) : 3;
      const netValueScore = netAnnualValue > 0
        ? Math.min(netAnnualValue / 100, 25)
        : Math.max(-10, netAnnualValue / 200);
      const feeEfficiency = bankProfile.annualFee === 0
        ? 12 : Math.max(0, 12 - bankProfile.annualFee / 2000);
      const capPenalty = (rawCashback > bankProfile.rewardCap) ? -8 : (bankProfile.rewardCap === Infinity ? 5 : 0);
      const networkScore = networkAcceptance * 0.5;

      score = Math.min(99, Math.max(10, Math.round(
        rewardScore + catScore + netValueScore + feeEfficiency + capPenalty + networkScore
      )));
    } else {
      const rewardScore = Math.min(cappedReward * 10, 50);
      const catScore = totalBonus > 0 ? Math.min(totalBonus * 5, 25) : 5;
      const feeScore = Math.max(0, 12 - bankProfile.annualFee / 1000);
      const networkScore = networkAcceptance * 0.8;

      score = Math.min(99, Math.round(rewardScore + catScore + feeScore + networkScore));
    }

    // ── TAG ──────────────────────────────────────────────────────────────────
    let tag = 'General Rewards';
    if (isRecurring) {
      if (netAnnualValue > 0 && totalBonus >= 3) tag = 'Best Recurring Value';
      else if (netAnnualValue > 0) tag = 'Net Positive';
      else if (totalBonus >= 4) tag = `Best for ${merchant.trim()}`;
      else if (netBonus.bonus >= 1) tag = `${card.network} Advantage`;
      else if (totalBonus >= 2) tag = 'Category Match';
      else if (bankProfile.rewardCap === Infinity) tag = 'Uncapped Rewards';
      else tag = 'Standard Recurring';
    } else {
      if (totalBonus >= 4) tag = `Best for ${merchant.trim()}`;
      else if (netBonus.bonus >= 1.5) tag = `${card.network} Advantage`;
      else if (totalBonus >= 2) tag = 'Category Match';
      else if (amount >= bankProfile.highValueThreshold) tag = 'High-Value Pick';
    }

    return {
      card,
      bankProfile,
      networkName: card.network,
      score,
      effectiveReward: Math.round(cappedReward * 10) / 10,
      cashbackEstimate: Math.round(actualCashback),
      annualSavings: Math.round(annualSavings),
      netAnnualValue: Math.round(netAnnualValue),
      reasons,
      tag,
      gradient: card.gradient,
    };
  });

  results.sort((a, b) => b.score - a.score || b.cashbackEstimate - a.cashbackEstimate);
  return results;
}
