// ── FILE: app/(tabs)/wallet.tsx ───────────────────────────────────────────────
// Wallet — shows all cards derived from transaction data, with per-card breakdown.

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CreditCard, TrendingUp, Calendar, Plus,
  AlertTriangle, ChevronRight,
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { getGradientColors } from '../../constants/gradients';
import { getCategoryDef } from '../../constants/categories';
import { fmt } from '../../lib/formatters';
import { COLORS } from '../../constants/theme';
import type { Card, Subscription } from '../../store/useStore';



interface CardWithStats extends Card {
  totalSubs: number;
  monthlySpend: number;
  yearlyCost: number;
  subscriptionList: Subscription[];
  urgentCount: number;
}

export default function WalletScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cards, subscriptions, isLoading } = useStore();

  const cardStats: CardWithStats[] = useMemo(() => {
    return cards.map((card) => {
      const cardSubs = subscriptions.filter((s) => s.cardId === card.id);
      const monthlySpend = cardSubs.reduce((sum, s) => {
        if (s.billingType === 'trial') return sum;
        if (s.cycle === 'monthly') return sum + s.amount;
        if (s.cycle === 'quarterly') return sum + s.amount / 3;
        if (s.cycle === 'yearly') return sum + s.amount / 12;
        return sum + s.amount;
      }, 0);
      const urgentCount = cardSubs.filter(
        (s) => s.status === 'urgent' || s.status === 'trial-urgent'
      ).length;

      return {
        ...card,
        totalSubs: cardSubs.length,
        monthlySpend: Math.round(monthlySpend),
        yearlyCost: Math.round(monthlySpend * 12),
        subscriptionList: cardSubs,
        urgentCount,
      };
    }).sort((a, b) => b.monthlySpend - a.monthlySpend);
  }, [cards, subscriptions]);

  const totalCards = cardStats.length;
  const totalSubs = subscriptions.length;
  const totalMonthly = cardStats.reduce((s, c) => s + c.monthlySpend, 0);

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Wallet</Text>
        <Text style={styles.screenSub}>
          {totalCards} card{totalCards !== 1 ? 's' : ''} · {totalSubs} subscription{totalSubs !== 1 ? 's' : ''}
        </Text>

        {/* Overview */}
        <View style={styles.overviewBar}>
          <View style={styles.overviewItem}>
            <CreditCard size={16} color={COLORS.outline} strokeWidth={1.8} />
            <Text style={styles.overviewValue}>{totalCards}</Text>
            <Text style={styles.overviewLabel}>Cards</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <TrendingUp size={16} color={COLORS.secondary} strokeWidth={1.8} />
            <Text style={[styles.overviewValue, { color: COLORS.secondary }]}>
              {fmt(totalMonthly)}
            </Text>
            <Text style={styles.overviewLabel}>Monthly</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Calendar size={16} color={COLORS.outline} strokeWidth={1.8} />
            <Text style={styles.overviewValue}>{fmt(totalMonthly * 12)}</Text>
            <Text style={styles.overviewLabel}>Yearly</Text>
          </View>
        </View>

        {/* Cards */}
        {cardStats.length === 0 ? (
          <View style={styles.emptyState}>
            <CreditCard size={40} color={COLORS.outlineVariant} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No cards found</Text>
            <Text style={styles.emptySub}>
              Add subscriptions via SMS to auto-detect your cards
            </Text>
          </View>
        ) : (
          cardStats.map((card) => (
            <WalletCardItem
              key={card.id}
              card={card}
              onPress={() => router.push(`/subscriptions/${card.id}`)}
            />
          ))
        )}

        {/* Add card */}
        <Pressable style={styles.addCardBtn} onPress={() => router.push('/add-card')}>
          <View style={styles.addCardIconBox}>
            <Plus size={20} color={COLORS.outline} strokeWidth={2} />
          </View>
          <Text style={styles.addCardText}>Add New Card</Text>
        </Pressable>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function WalletCardItem({
  card,
  onPress,
}: {
  card: CardWithStats;
  onPress: () => void;
}): React.JSX.Element {
  const gradientColors = getGradientColors(card.bank) as [string, string, ...string[]];
  const networkLabel =
    card.network === 'Visa' ? 'VISA' :
    card.network === 'Mastercard' ? 'MC' : 'RuPay';

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    card.subscriptionList.forEach((s) => {
      const monthly = s.cycle === 'monthly' ? s.amount :
        s.cycle === 'quarterly' ? s.amount / 3 :
        s.cycle === 'yearly' ? s.amount / 12 : s.amount;
      map[s.category] = (map[s.category] ?? 0) + monthly;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [card.subscriptionList]);

  return (
    <Pressable onPress={onPress} style={styles.walletCard}>
      {/* Card visual */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardTopRow}>
          <View>
            <Text style={styles.cardBank}>{card.bank}</Text>
            <Text style={styles.cardVariant}>{card.variant}</Text>
          </View>
          <View style={styles.networkBadge}>
            <Text style={styles.networkText}>{networkLabel}</Text>
          </View>
        </View>

        {/* Chip */}
        <View style={styles.chipEmv} />

        <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>

        <View style={styles.cardBottomRow}>
          <View>
            <Text style={styles.cardMetaLabel}>EXPIRES</Text>
            <Text style={styles.cardMetaValue}>{card.expiry}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.cardMetaLabel}>MONTHLY</Text>
            <Text style={styles.cardMetaValue}>{fmt(card.monthlySpend)}</Text>
          </View>
        </View>

        {card.urgentCount > 0 && (
          <View style={styles.cardUrgent}>
            <AlertTriangle size={10} color={COLORS.error} strokeWidth={2.5} />
            <Text style={styles.cardUrgentText}>{card.urgentCount}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsStrip}>
        <View style={styles.statBlock}>
          <Text style={styles.statBlockValue}>{card.totalSubs}</Text>
          <Text style={styles.statBlockLabel}>Subs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={[styles.statBlockValue, { color: COLORS.secondary }]}>
            {fmt(card.monthlySpend)}
          </Text>
          <Text style={styles.statBlockLabel}>Monthly</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statBlockValue}>{fmt(card.yearlyCost)}</Text>
          <Text style={styles.statBlockLabel}>Yearly</Text>
        </View>
      </View>

      {/* Categories */}
      {categoryBreakdown.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Top Categories</Text>
          {categoryBreakdown.map(([cat, val]) => {
            const pct = card.monthlySpend > 0 ? ((val / card.monthlySpend) * 100) : 0;
            const catDef = getCategoryDef(cat);
            return (
              <View key={cat} style={styles.catRow}>
                <View style={[styles.catIconBox, { backgroundColor: catDef.bgColor }]}>
                  <catDef.Icon size={12} color={catDef.color} strokeWidth={2} />
                </View>
                <Text style={styles.catName}>{catDef.label}</Text>
                <View style={styles.catBarTrack}>
                  <View style={[styles.catBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: catDef.color }]} />
                </View>
                <Text style={styles.catAmount}>{fmt(Math.round(val))}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Subscription preview */}
      {card.subscriptionList.length > 0 && (
        <View style={styles.subsPreview}>
          {card.subscriptionList.slice(0, 3).map((sub) => (
            <View key={sub.id} style={styles.subPreviewRow}>
              <View style={styles.subPreviewLeft}>
                <View style={[
                  styles.statusDot,
                  sub.status === 'urgent' || sub.status === 'trial-urgent'
                    ? styles.statusDotUrgent
                    : sub.status === 'warning'
                    ? styles.statusDotWarning
                    : styles.statusDotSafe,
                ]} />
                <Text style={styles.subPreviewName}>{sub.name}</Text>
              </View>
              <Text style={styles.subPreviewAmount}>{fmt(sub.amount)}</Text>
            </View>
          ))}
          {card.subscriptionList.length > 3 && (
            <View style={styles.viewMoreRow}>
              <Text style={styles.subPreviewMore}>
                +{card.subscriptionList.length - 3} more
              </Text>
              <ChevronRight size={14} color={COLORS.outline} strokeWidth={2} />
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  center: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, gap: 16, paddingTop: 16 },
  screenTitle: { color: COLORS.onSurface, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  screenSub: { color: COLORS.outline, fontSize: 13, marginTop: -8 },

  // Overview
  overviewBar: {
    flexDirection: 'row', backgroundColor: COLORS.surfaceContainerLow, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  overviewItem: { flex: 1, alignItems: 'center', gap: 4 },
  overviewLabel: { color: COLORS.outline, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' },
  overviewValue: { color: COLORS.onSurface, fontSize: 17, fontWeight: '700' },
  overviewDivider: { width: 1, backgroundColor: COLORS.glassBorder },

  // Wallet card
  walletCard: {
    borderRadius: 20, overflow: 'hidden',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  cardGradient: { padding: 20, gap: 6 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBank: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  cardVariant: {
    color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 1.5,
    textTransform: 'uppercase', marginTop: 2,
  },
  networkBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  networkText: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  chipEmv: {
    width: 32, height: 22, borderRadius: 4, marginTop: 2,
    backgroundColor: 'rgba(255,215,0,0.5)',
    borderWidth: 0.5, borderColor: 'rgba(255,215,0,0.3)',
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600',
    letterSpacing: 2.5, fontFamily: 'monospace', marginTop: 2,
  },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 },
  cardMetaLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase' },
  cardMetaValue: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginTop: 2 },
  cardUrgent: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(238,125,119,0.15)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(238,125,119,0.2)',
  },
  cardUrgentText: { color: COLORS.error, fontSize: 11, fontWeight: '700' },

  // Stats
  statsStrip: {
    flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.glassBorder,
  },
  statBlock: { flex: 1, alignItems: 'center', gap: 2 },
  statBlockValue: { color: COLORS.onSurface, fontSize: 14, fontWeight: '700' },
  statBlockLabel: { color: COLORS.outline, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase' },
  statDivider: { width: 1, backgroundColor: COLORS.glassBorder },

  // Categories
  categoriesSection: {
    padding: 16, gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.glassBorder,
  },
  categoriesTitle: {
    color: COLORS.onSurfaceVariant, fontSize: 9, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 2,
  },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catIconBox: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: COLORS.glassWhite,
    alignItems: 'center', justifyContent: 'center',
  },
  catName: { color: COLORS.onSurface, fontSize: 12, width: 85 },
  catBarTrack: { flex: 1, height: 3, backgroundColor: COLORS.glassWhite, borderRadius: 1.5, overflow: 'hidden' },
  catBarFill: { height: 3, backgroundColor: COLORS.secondary, borderRadius: 1.5 },
  catAmount: { color: COLORS.onSurfaceVariant, fontSize: 11, fontWeight: '600', width: 60, textAlign: 'right' },

  // Sub preview
  subsPreview: { padding: 16, gap: 10 },
  subPreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subPreviewLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusDotSafe: { backgroundColor: COLORS.brandTeal },
  statusDotWarning: { backgroundColor: COLORS.secondary },
  statusDotUrgent: { backgroundColor: COLORS.error },
  subPreviewName: { color: COLORS.onSurface, fontSize: 13, fontWeight: '500' },
  subPreviewAmount: { color: COLORS.onSurfaceVariant, fontSize: 13, fontWeight: '600' },
  viewMoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 },
  subPreviewMore: { color: COLORS.outline, fontSize: 11, textAlign: 'center' },

  // Add card
  addCardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderColor: COLORS.glassBorder, borderStyle: 'dashed',
    borderRadius: 16, paddingVertical: 18,
  },
  addCardIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.glassWhite,
    alignItems: 'center', justifyContent: 'center',
  },
  addCardText: { color: COLORS.outline, fontSize: 14, fontWeight: '600' },

  // Empty
  emptyState: {
    alignItems: 'center', gap: 10, paddingVertical: 60,
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  emptyTitle: { color: COLORS.onSurface, fontSize: 16, fontWeight: '700', marginTop: 8 },
  emptySub: { color: COLORS.onSurfaceVariant, fontSize: 13, textAlign: 'center', paddingHorizontal: 20, lineHeight: 19 },
});
