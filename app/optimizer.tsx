// ── FILE: app/optimizer.tsx ───────────────────────────────────────────────────
// Card Optimizer — user inputs merchant & amount, gets the best card recommendation.

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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  FadeInDown,
} from 'react-native-reanimated';
import { optimizeCard, type OptimizationResult } from '../lib/cardOptimizer';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/formatters';
import { COLORS } from '../constants/theme';

const POPULAR_MERCHANTS = [
  { name: 'Amazon', icon: '📦' },
  { name: 'Swiggy', icon: '🍔' },
  { name: 'Zomato', icon: '🍕' },
  { name: 'Netflix', icon: '🎬' },
  { name: 'Flipkart', icon: '🛒' },
  { name: 'Petrol', icon: '⛽' },
  { name: 'BigBasket', icon: '🥬' },
  { name: 'MakeMyTrip', icon: '✈️' },
];

export default function OptimizerScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cards = useStore((s) => s.cards);
  const [merchant, setMerchant] = useState('');
  const [amountText, setAmountText] = useState('');
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleOptimize = useCallback(() => {
    Keyboard.dismiss();
    const amount = parseFloat(amountText.replace(/,/g, ''));
    if (!merchant.trim() || isNaN(amount) || amount <= 0 || cards.length === 0) return;
    const res = optimizeCard(merchant.trim(), amount, 'one-time', cards);
    setResults(res);
    setHasSearched(true);
  }, [merchant, amountText, cards]);

  const handleQuickMerchant = useCallback((name: string) => {
    setMerchant(name);
    if (amountText) {
      const amount = parseFloat(amountText.replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0 && cards.length > 0) {
        const res = optimizeCard(name, amount, 'one-time', cards);
        setResults(res);
        setHasSearched(true);
      }
    }
  }, [amountText, cards]);

  const bestCard = results.length > 0 ? results[0] : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Card Optimizer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero description */}
        <View style={styles.heroBox}>
          <Text style={styles.heroIcon}>⚡</Text>
          <Text style={styles.heroTitle}>Find your best card</Text>
          <Text style={styles.heroSub}>
            Enter a merchant and amount — we'll tell you which card maximises your rewards.
          </Text>
        </View>

        {/* Merchant input */}
        <Text style={styles.inputLabel}>MERCHANT / STORE</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputIcon}>🏪</Text>
          <TextInput
            style={styles.input}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="e.g. Amazon, Zomato, Petrol…"
            placeholderTextColor="#767575"
            keyboardAppearance="dark"
            returnKeyType="next"
          />
        </View>

        {/* Quick merchant chips */}
        <View style={styles.chipRow}>
          {POPULAR_MERCHANTS.map((m) => (
            <Pressable
              key={m.name}
              style={[styles.chip, merchant === m.name && styles.chipActive]}
              onPress={() => handleQuickMerchant(m.name)}
            >
              <Text style={styles.chipIcon}>{m.icon}</Text>
              <Text style={[styles.chipText, merchant === m.name && styles.chipTextActive]}>
                {m.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Amount input */}
        <Text style={styles.inputLabel}>TRANSACTION AMOUNT (₹)</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputIcon}>💰</Text>
          <TextInput
            style={styles.input}
            value={amountText}
            onChangeText={setAmountText}
            placeholder="e.g. 2500"
            placeholderTextColor="#767575"
            keyboardType="numeric"
            keyboardAppearance="dark"
            returnKeyType="done"
            onSubmitEditing={handleOptimize}
          />
        </View>

        {/* Optimize button */}
        <Pressable
          style={[styles.optimizeBtn, (!merchant.trim() || !amountText) && styles.optimizeBtnDisabled]}
          onPress={handleOptimize}
        >
          <LinearGradient
            colors={['#ffbf00', '#e6ac00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.optimizeBtnGradient}
          >
            <Text style={styles.optimizeBtnText}>⚡ Find Best Card</Text>
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
                    <Text style={styles.winnerBadgeText}>👑 RECOMMENDED</Text>
                  </View>
                  <Text style={styles.winnerBank}>{bestCard.card.bank}</Text>
                  <Text style={styles.winnerVariant}>{bestCard.card.variant}</Text>
                  <Text style={styles.winnerLast4}>•••• {bestCard.card.last4}</Text>

                  <View style={styles.winnerStats}>
                    <View style={styles.winnerStat}>
                      <Text style={styles.winnerStatLabel}>Effective Reward</Text>
                      <Text style={styles.winnerStatValue}>{bestCard.effectiveReward}%</Text>
                    </View>
                    <View style={styles.winnerStatDivider} />
                    <View style={styles.winnerStat}>
                      <Text style={styles.winnerStatLabel}>You Save</Text>
                      <Text style={styles.winnerStatValue}>{fmt(bestCard.cashbackEstimate)}</Text>
                    </View>
                    <View style={styles.winnerStatDivider} />
                    <View style={styles.winnerStat}>
                      <Text style={styles.winnerStatLabel}>Match Score</Text>
                      <Text style={styles.winnerStatValue}>{bestCard.score}%</Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Reasons */}
                <View style={styles.reasonsBox}>
                  <Text style={styles.reasonsTitle}>Why this card?</Text>
                  {bestCard.reasons.map((r, i) => (
                    <View key={i} style={styles.reasonRow}>
                      <Text style={styles.reasonBullet}>•</Text>
                      <Text style={styles.reasonText}>{r}</Text>
                    </View>
                  ))}
                  {bestCard.bankProfile.perks.slice(0, 2).map((p, i) => (
                    <View key={`perk_${i}`} style={styles.reasonRow}>
                      <Text style={styles.perkBullet}>✓</Text>
                      <Text style={styles.perkText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Other cards comparison */}
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
                        <Text style={styles.altCardBank}>{res.card.bank}</Text>
                        <Text style={styles.altCardVariant}>{res.card.variant}</Text>
                        <Text style={styles.altCardTag}>{res.tag}</Text>
                      </View>
                      <View style={styles.altCardRight}>
                        <Text style={styles.altCardReward}>{res.effectiveReward}%</Text>
                        <Text style={styles.altCardSave}>Save {fmt(res.cashbackEstimate)}</Text>
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

        {/* Empty state */}
        {hasSearched && results.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🤔</Text>
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptySub}>Check your merchant name and amount</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.surfaceContainerHighest,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: COLORS.onSurface, fontSize: 28, lineHeight: 32 },
  headerTitle: { color: COLORS.onSurface, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  content: { padding: 20, gap: 16 },

  // Hero
  heroBox: {
    backgroundColor: COLORS.accentContainer, borderWidth: 1, borderColor: 'rgba(255,213,79,0.15)',
    borderRadius: 20, padding: 20, alignItems: 'center', gap: 6,
  },
  heroIcon: { fontSize: 32 },
  heroTitle: { color: COLORS.onSurface, fontSize: 20, fontWeight: '700' },
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
    borderWidth: 1, borderColor: COLORS.surfaceContainerHighest,
  },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, color: COLORS.onSurface, fontSize: 15 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.surfaceContainerHighest,
  },
  chipActive: { backgroundColor: COLORS.primaryContainer, borderColor: COLORS.outline },
  chipIcon: { fontSize: 14 },
  chipText: { color: COLORS.outline, fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: COLORS.onSurface },

  // Optimize button
  optimizeBtn: { borderRadius: 14, overflow: 'hidden' },
  optimizeBtnDisabled: { opacity: 0.4 },
  optimizeBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  optimizeBtnText: { color: '#3a2900', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  // Results
  resultsSection: { gap: 16, marginTop: 4 },
  sectionTitle: {
    color: COLORS.onSurfaceVariant, fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', marginTop: 4,
  },

  // Winner card
  winnerCard: {
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,213,79,0.3)',
  },
  winnerGradient: { padding: 20, gap: 4 },
  winnerBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4,
  },
  winnerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  winnerBank: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  winnerVariant: { color: '#fff', fontSize: 22, fontWeight: '800' },
  winnerLast4: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: 'monospace', marginTop: 4 },
  winnerStats: {
    flexDirection: 'row', marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 14,
  },
  winnerStat: { flex: 1, alignItems: 'center', gap: 2 },
  winnerStatLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase' },
  winnerStatValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  winnerStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  // Reasons
  reasonsBox: { backgroundColor: COLORS.surfaceContainerLow, padding: 16, gap: 8 },
  reasonsTitle: { color: COLORS.onSurfaceVariant, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  reasonRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  reasonBullet: { color: COLORS.accent, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  reasonText: { color: COLORS.onSurface, fontSize: 13, flex: 1, lineHeight: 20 },
  perkBullet: { color: COLORS.brandTeal, fontSize: 13, fontWeight: '700', lineHeight: 20 },
  perkText: { color: COLORS.onSurfaceVariant, fontSize: 13, flex: 1, lineHeight: 20 },

  // Alt cards
  altCard: {
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.surfaceContainerHighest, flexDirection: 'row',
  },
  altCardStripe: { width: 5 },
  altCardContent: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14,
  },
  altCardLeft: { flex: 1, gap: 2 },
  altCardBank: { color: COLORS.outline, fontSize: 11 },
  altCardVariant: { color: COLORS.onSurface, fontSize: 14, fontWeight: '700' },
  altCardTag: { color: COLORS.onSurfaceVariant, fontSize: 11, marginTop: 2 },
  altCardRight: { alignItems: 'flex-end', gap: 4 },
  altCardReward: { color: COLORS.accent, fontSize: 16, fontWeight: '800' },
  altCardSave: { color: COLORS.onSurfaceVariant, fontSize: 11 },
  altScorePill: {
    backgroundColor: COLORS.surfaceContainerHigh, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  altScoreText: { color: COLORS.outline, fontSize: 11, fontWeight: '700' },

  // Empty
  emptyState: {
    alignItems: 'center', gap: 8, paddingVertical: 40,
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 16, borderWidth: 1, borderColor: COLORS.surfaceContainerHighest,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { color: COLORS.onSurface, fontSize: 16, fontWeight: '700' },
  emptySub: { color: COLORS.onSurfaceVariant, fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
});
