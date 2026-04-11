// ── FILE: app/(tabs)/smartpay.tsx ─────────────────────────────────────────────
// SmartPay — find the best card for any merchant & transaction amount.

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Zap, Search, Store, IndianRupee, Crown, ChevronRight,
  ShoppingCart, UtensilsCrossed, Pizza, Clapperboard,
  ShoppingBag, Fuel, LeafyGreen, Plane,
  RotateCw, CalendarClock, CalendarDays, CalendarCheck,
} from 'lucide-react-native';
import { optimizeCard, type OptimizationResult, type Recurrence } from '../../lib/cardOptimizer';
import { useStore } from '../../store/useStore';
import { fmt } from '../../lib/formatters';
import { COLORS } from '../../constants/theme';

const POPULAR_MERCHANTS = [
  { name: 'Amazon', Icon: ShoppingCart },
  { name: 'Swiggy', Icon: UtensilsCrossed },
  { name: 'Zomato', Icon: Pizza },
  { name: 'Netflix', Icon: Clapperboard },
  { name: 'Flipkart', Icon: ShoppingBag },
  { name: 'Petrol', Icon: Fuel },
  { name: 'BigBasket', Icon: LeafyGreen },
  { name: 'MakeMyTrip', Icon: Plane },
];

const RECURRENCE_OPTIONS: { key: Recurrence; label: string; Icon: typeof RotateCw }[] = [
  { key: 'one-time',  label: 'One-Time',  Icon: CalendarCheck },
  { key: 'monthly',   label: 'Monthly',   Icon: CalendarClock },
  { key: 'quarterly', label: 'Quarterly', Icon: CalendarDays },
  { key: 'yearly',    label: 'Yearly',    Icon: RotateCw },
];

export default function SmartPayScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const cards = useStore((s) => s.cards);
  const [merchant, setMerchant] = useState('');
  const [amountText, setAmountText] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('one-time');
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const hasCards = cards.length > 0;

  const handleOptimize = useCallback(() => {
    Keyboard.dismiss();
    const amount = parseFloat(amountText.replace(/,/g, ''));
    if (!merchant.trim() || isNaN(amount) || amount <= 0 || !hasCards) return;
    const res = optimizeCard(merchant.trim(), amount, recurrence, cards);
    setResults(res);
    setHasSearched(true);
  }, [merchant, amountText, recurrence]);

  const handleQuickMerchant = useCallback((name: string) => {
    setMerchant(name);
    if (amountText) {
      const amount = parseFloat(amountText.replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0 && hasCards) {
        const res = optimizeCard(name, amount, recurrence, cards);
        setResults(res);
        setHasSearched(true);
      }
    }
  }, [amountText, recurrence, cards, hasCards]);

  const isRecurring = recurrence !== 'one-time';
  const bestCard = results.length > 0 ? results[0] : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>SmartPay</Text>

        {/* Hero */}
        <View style={styles.heroBox}>
          <View style={styles.heroIconBox}>
            <Zap size={24} color={COLORS.secondary} strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>Find your best card</Text>
          <Text style={styles.heroSub}>
            Enter a merchant, amount & frequency — we'll tell you which card maximises your rewards.
          </Text>
        </View>

        {/* Merchant input */}
        <Text style={styles.inputLabel}>MERCHANT / STORE</Text>
        <View style={styles.inputBox}>
          <Store size={18} color={COLORS.outline} strokeWidth={2} />
          <TextInput
            style={styles.input}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="e.g. Amazon, Zomato, Petrol…"
            placeholderTextColor={COLORS.outlineVariant}
            keyboardAppearance="dark"
            returnKeyType="next"
          />
          {merchant.length > 0 && (
            <Pressable onPress={() => setMerchant('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Quick merchant chips */}
        <View style={styles.chipRow}>
          {POPULAR_MERCHANTS.map((m) => {
            const isActive = merchant === m.name;
            return (
              <Pressable
                key={m.name}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => handleQuickMerchant(m.name)}
              >
                <m.Icon size={13} color={isActive ? COLORS.onSurface : COLORS.outline} strokeWidth={2} />
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {m.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Amount input */}
        <Text style={styles.inputLabel}>TRANSACTION AMOUNT</Text>
        <View style={styles.inputBox}>
          <IndianRupee size={18} color={COLORS.outline} strokeWidth={2} />
          <TextInput
            style={styles.input}
            value={amountText}
            onChangeText={setAmountText}
            placeholder="e.g. 2500"
            placeholderTextColor={COLORS.outlineVariant}
            keyboardType="numeric"
            keyboardAppearance="dark"
            returnKeyType="done"
            onSubmitEditing={handleOptimize}
          />
        </View>

        {/* ── RECURRENCE SELECTOR ──────────────────────────────────── */}
        <Text style={styles.inputLabel}>PAYMENT FREQUENCY</Text>
        <View style={styles.recurrenceRow}>
          {RECURRENCE_OPTIONS.map((opt) => {
            const isActive = recurrence === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[styles.recurrencePill, isActive && styles.recurrencePillActive]}
                onPress={() => setRecurrence(opt.key)}
              >
                <opt.Icon
                  size={14}
                  color={isActive ? COLORS.onSurface : COLORS.outline}
                  strokeWidth={2}
                />
                <Text style={[styles.recurrenceText, isActive && styles.recurrenceTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Optimize button */}
        <Pressable
          style={[styles.optimizeBtn, (!merchant.trim() || !amountText || !hasCards) && styles.optimizeBtnDisabled]}
          onPress={handleOptimize}
        >
          <LinearGradient
            colors={['#ffbf00', '#e6a800']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.optimizeBtnGradient}
          >
            <Zap size={18} color="#2a1f00" strokeWidth={2.5} />
            <Text style={styles.optimizeBtnText}>Find Best Card</Text>
          </LinearGradient>
        </Pressable>

        {/* Results */}
        {hasSearched && results.length > 0 && (
          <View style={styles.resultsSection}>
            {/* Winner card */}
            {bestCard && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.winnerCard}>
                <LinearGradient
                  colors={bestCard.card.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.winnerGradient}
                >
                  <View style={styles.winnerBadge}>
                    <Crown size={12} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.winnerBadgeText}>RECOMMENDED</Text>
                  </View>
                  <Text style={styles.winnerBank}>{bestCard.card.bank}</Text>
                  <Text style={styles.winnerVariant}>{bestCard.card.variant}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Text style={styles.winnerLast4}>•••• {bestCard.card.last4}</Text>
                    <View style={styles.networkChip}>
                      <Text style={styles.networkChipText}>{bestCard.networkName}</Text>
                    </View>
                  </View>

                  <View style={styles.winnerStats}>
                    <View style={styles.winnerStat}>
                      <Text style={styles.winnerStatLabel}>Reward</Text>
                      <Text style={styles.winnerStatValue}>{bestCard.effectiveReward}%</Text>
                    </View>
                    <View style={styles.winnerStatDivider} />
                    <View style={styles.winnerStat}>
                      <Text style={styles.winnerStatLabel}>You Save</Text>
                      <Text style={styles.winnerStatValue}>{fmt(bestCard.cashbackEstimate)}</Text>
                    </View>
                    <View style={styles.winnerStatDivider} />
                    {isRecurring ? (
                      <View style={styles.winnerStat}>
                        <Text style={styles.winnerStatLabel}>Per Year</Text>
                        <Text style={styles.winnerStatValue}>{fmt(bestCard.annualSavings)}</Text>
                      </View>
                    ) : (
                      <View style={styles.winnerStat}>
                        <Text style={styles.winnerStatLabel}>Match</Text>
                        <Text style={styles.winnerStatValue}>{bestCard.score}%</Text>
                      </View>
                    )}
                  </View>

                  {/* Annual value indicator for recurring */}
                  {isRecurring && bestCard.netAnnualValue !== 0 && (
                    <View style={[
                      styles.netValueBadge,
                      bestCard.netAnnualValue > 0 ? styles.netValuePositive : styles.netValueNegative,
                    ]}>
                      <Text style={[
                        styles.netValueText,
                        bestCard.netAnnualValue > 0 ? styles.netValueTextPositive : styles.netValueTextNegative,
                      ]}>
                        {bestCard.netAnnualValue > 0 ? '↑' : '↓'} Net annual value: {fmt(Math.abs(bestCard.netAnnualValue))}
                        {bestCard.netAnnualValue > 0 ? ' profit' : ' after fees'}
                      </Text>
                    </View>
                  )}
                </LinearGradient>

                {/* Reasons */}
                <View style={styles.reasonsBox}>
                  <Text style={styles.reasonsTitle}>Why this card?</Text>
                  {bestCard.reasons.map((r, i) => (
                    <View key={i} style={styles.reasonRow}>
                      <View style={styles.reasonDot} />
                      <Text style={styles.reasonText}>{r}</Text>
                    </View>
                  ))}
                  {bestCard.bankProfile.perks.slice(0, 2).map((p, i) => (
                    <View key={`perk_${i}`} style={styles.reasonRow}>
                      <View style={styles.perkDot} />
                      <Text style={styles.perkText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Other cards */}
            {results.length > 1 && (
              <>
                <Text style={styles.sectionTitle}>Other Cards</Text>
                {results.slice(1).map((res, i) => (
                  <Animated.View
                    key={res.card.id}
                    entering={FadeInDown.delay((i + 1) * 100).duration(300)}
                    style={styles.altCard}
                  >
                    <LinearGradient
                      colors={res.card.gradient as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.altCardStripe}
                    />
                    <View style={styles.altCardContent}>
                      <View style={styles.altCardLeft}>
                        <Text style={styles.altCardBank}>{res.card.bank} · {res.networkName}</Text>
                        <Text style={styles.altCardVariant}>{res.card.variant}</Text>
                        <Text style={styles.altCardTag}>{res.tag}</Text>
                      </View>
                      <View style={styles.altCardRight}>
                        <Text style={styles.altCardReward}>{res.effectiveReward}%</Text>
                        {isRecurring ? (
                          <Text style={styles.altCardSave}>{fmt(res.annualSavings)}/yr</Text>
                        ) : (
                          <Text style={styles.altCardSave}>Save {fmt(res.cashbackEstimate)}</Text>
                        )}
                        <View style={styles.altScorePill}>
                          <Text style={styles.altScoreText}>{res.score}%</Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </>
            )}
          </View>
        )}

        {/* No cards state */}
        {!hasCards && (
          <View style={styles.emptyState}>
            <Search size={36} color={COLORS.outlineVariant} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No cards added yet</Text>
            <Text style={styles.emptySub}>Add your credit cards in the Wallet tab first, then come back to find the best card for any purchase.</Text>
          </View>
        )}

        {/* Empty search results */}
        {hasCards && hasSearched && results.length === 0 && (
          <View style={styles.emptyState}>
            <Search size={36} color={COLORS.outlineVariant} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptySub}>Check your merchant name and amount</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  screenTitle: { color: COLORS.onSurface, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  content: { padding: 20, gap: 16 },

  // Hero
  heroBox: {
    backgroundColor: 'rgba(255,213,79,0.04)', borderWidth: 1, borderColor: 'rgba(255,213,79,0.1)',
    borderRadius: 20, padding: 20, alignItems: 'center', gap: 8,
  },
  heroIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,213,79,0.08)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroTitle: { color: COLORS.onSurface, fontSize: 18, fontWeight: '700' },
  heroSub: { color: COLORS.onSurfaceVariant, fontSize: 13, textAlign: 'center', lineHeight: 19 },

  // Inputs
  inputLabel: {
    color: COLORS.outline, fontSize: 10, fontWeight: '700', letterSpacing: 2,
    marginBottom: -8,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  input: { flex: 1, color: COLORS.onSurface, fontSize: 15 },
  clearBtn: { color: COLORS.outline, fontSize: 14, padding: 4 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  chipActive: { backgroundColor: 'rgba(255,213,79,0.08)', borderColor: 'rgba(255,213,79,0.2)' },
  chipText: { color: COLORS.outline, fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: COLORS.onSurface },

  // Recurrence selector
  recurrenceRow: { flexDirection: 'row', gap: 8 },
  recurrencePill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  recurrencePillActive: {
    backgroundColor: 'rgba(255,213,79,0.08)',
    borderColor: 'rgba(255,213,79,0.25)',
  },
  recurrenceText: { color: COLORS.outline, fontSize: 11, fontWeight: '600' },
  recurrenceTextActive: { color: COLORS.onSurface },

  // Optimize button
  optimizeBtn: { borderRadius: 14, overflow: 'hidden' },
  optimizeBtnDisabled: { opacity: 0.35 },
  optimizeBtnGradient: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  optimizeBtnText: { color: '#2a1f00', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  // Results
  resultsSection: { gap: 14 },
  sectionTitle: {
    color: COLORS.onSurfaceVariant, fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', marginTop: 4,
  },

  // Winner card
  winnerCard: {
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,213,79,0.2)',
  },
  winnerGradient: { padding: 20, gap: 4 },
  winnerBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 6,
  },
  winnerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  winnerBank: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  winnerVariant: { color: '#fff', fontSize: 20, fontWeight: '800' },
  winnerLast4: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'monospace' },
  networkChip: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  networkChipText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  winnerStats: {
    flexDirection: 'row', marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 14,
  },
  winnerStat: { flex: 1, alignItems: 'center', gap: 3 },
  winnerStatLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase' },
  winnerStatValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  winnerStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Net annual value badge
  netValueBadge: {
    marginTop: 10, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  netValuePositive: { backgroundColor: 'rgba(105,240,174,0.15)' },
  netValueNegative: { backgroundColor: 'rgba(255,82,82,0.12)' },
  netValueText: { fontSize: 12, fontWeight: '700' },
  netValueTextPositive: { color: '#69F0AE' },
  netValueTextNegative: { color: '#FF5252' },

  // Reasons
  reasonsBox: { backgroundColor: COLORS.surfaceContainerLow, padding: 16, gap: 8 },
  reasonsTitle: { color: COLORS.onSurfaceVariant, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  reasonRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  reasonDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.secondary, marginTop: 7 },
  reasonText: { color: COLORS.onSurface, fontSize: 13, flex: 1, lineHeight: 20 },
  perkDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.brandTeal, marginTop: 7 },
  perkText: { color: COLORS.onSurfaceVariant, fontSize: 13, flex: 1, lineHeight: 20 },

  // Alt cards
  altCard: {
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.glassBorder, flexDirection: 'row',
  },
  altCardStripe: { width: 4 },
  altCardContent: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14,
  },
  altCardLeft: { flex: 1, gap: 2 },
  altCardBank: { color: COLORS.outline, fontSize: 11 },
  altCardVariant: { color: COLORS.onSurface, fontSize: 14, fontWeight: '700' },
  altCardTag: { color: COLORS.onSurfaceVariant, fontSize: 11, marginTop: 2 },
  altCardRight: { alignItems: 'flex-end', gap: 4 },
  altCardReward: { color: COLORS.secondary, fontSize: 16, fontWeight: '800' },
  altCardSave: { color: COLORS.onSurfaceVariant, fontSize: 11 },
  altScorePill: {
    backgroundColor: COLORS.glassWhite, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  altScoreText: { color: COLORS.outline, fontSize: 11, fontWeight: '700' },

  // Empty
  emptyState: {
    alignItems: 'center', gap: 10, paddingVertical: 40,
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  emptyTitle: { color: COLORS.onSurface, fontSize: 16, fontWeight: '700', marginTop: 4 },
  emptySub: { color: COLORS.onSurfaceVariant, fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
});
