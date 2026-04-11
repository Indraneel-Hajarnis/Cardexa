// ── FILE: app/subscriptions/[cardId].tsx ─────────────────────────────────────
// Card detail screen — HeroCard + subscription list for this card.

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { HeroCard } from '../../components/cards/HeroCard';
import { SubscriptionRow } from '../../components/subscriptions/SubscriptionRow';
import { fmt } from '../../lib/formatters';
import { COLORS } from '../../constants/theme';
import { deleteSubscriptionById } from '../../db/client';

export default function CardDetailScreen(): React.JSX.Element {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards, subscriptions, isLoading, removeSubscription, showToast } = useStore();

  const card = useMemo(() => cards.find((c) => c.id === cardId), [cards, cardId]);
  const cardSubs = useMemo(
    () => subscriptions.filter((s) => s.cardId === cardId),
    [subscriptions, cardId]
  );

  const totalMonthly = useMemo(() => {
    return cardSubs.reduce((sum, s) => {
      if (s.cycle === 'monthly') return sum + s.amount;
      if (s.cycle === 'quarterly') return sum + s.amount / 3;
      if (s.cycle === 'yearly') return sum + s.amount / 12;
      return sum + s.amount;
    }, 0);
  }, [cardSubs]);

  const handleCancel = async (id: string) => {
    try {
      await deleteSubscriptionById(id);
      removeSubscription(id);
      showToast('Subscription cancelled', 'info');
    } catch {
      showToast('Failed to cancel. Try again.', 'error');
    }
  };

  if (isLoading || !card) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{card.variant}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <HeroCard card={card} subscriptions={subscriptions} />

        {/* Summary bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Subscriptions</Text>
            <Text style={styles.summaryValue}>{cardSubs.length}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Monthly Total</Text>
            <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>
              {fmt(Math.round(totalMonthly))}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Network</Text>
            <Text style={styles.summaryValue}>{card.network}</Text>
          </View>
        </View>

        {/* Subscriptions list */}
        <Text style={styles.sectionTitle}>Active Subscriptions</Text>
        {cardSubs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No subscriptions</Text>
            <Text style={styles.emptySub}>
              Use "Simulate SMS" on the dashboard to add one
            </Text>
          </View>
        ) : (
          cardSubs.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              subscription={sub}
              onCancel={handleCancel}
            />
          ))
        )}

        {/* Auto-Pay floating footer hint */}
        <View style={styles.autoPay}>
          <Text style={styles.autoPayText}>💳 Auto-Pay enabled for this card</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  center: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.surfaceContainerHighest,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: COLORS.onSurface, fontSize: 28, lineHeight: 32 },
  headerTitle: { color: COLORS.onSurface, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  content: { paddingHorizontal: 0, gap: 16, paddingTop: 8 },

  summaryBar: {
    flexDirection: 'row', backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16, marginHorizontal: 24, padding: 16,
    borderWidth: 1, borderColor: COLORS.surfaceContainerHighest,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryLabel: { color: COLORS.outline, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  summaryValue: { color: COLORS.onSurface, fontSize: 16, fontWeight: '700' },
  divider: { width: 1, backgroundColor: COLORS.surfaceContainerHighest },

  sectionTitle: {
    color: COLORS.onSurfaceVariant, fontSize: 11, fontWeight: '700',
    letterSpacing: 2, textTransform: 'uppercase', paddingHorizontal: 24,
  },

  emptyState: {
    alignItems: 'center', gap: 8, paddingVertical: 40, marginHorizontal: 24,
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 16, borderWidth: 1, borderColor: COLORS.surfaceContainerHighest,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { color: COLORS.onSurface, fontSize: 16, fontWeight: '700' },
  emptySub: { color: COLORS.onSurfaceVariant, fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },

  autoPay: {
    marginHorizontal: 24, backgroundColor: 'rgba(0,201,167,0.08)',
    borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,201,167,0.2)',
  },
  autoPayText: { color: COLORS.brandTeal, fontSize: 13, fontWeight: '500' },
});
