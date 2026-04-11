// ── FILE: app/(tabs)/alerts.tsx ───────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brain, CheckCircle2, AlertTriangle, Clock } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { SubscriptionRow } from '../../components/subscriptions/SubscriptionRow';
import { fmt } from '../../lib/formatters';
import { COLORS } from '../../constants/theme';
import { deleteSubscriptionById } from '../../db/client';

type FilterKey = 'all' | 'urgent' | 'trials';

const FILTERS: { key: FilterKey; label: string; Icon: React.ComponentType<any> }[] = [
  { key: 'all',    label: 'All',    Icon: Clock },
  { key: 'urgent', label: 'Urgent', Icon: AlertTriangle },
  { key: 'trials', label: 'Trials', Icon: Clock },
];

export default function AlertsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { subscriptions, isLoading, removeSubscription, showToast, alertFilter, setAlertFilter } = useStore();

  const filtered = useMemo(() => {
    let list = [...subscriptions];
    if (alertFilter === 'urgent') {
      list = list.filter((s) => s.status === 'urgent' || s.status === 'trial-urgent');
    } else if (alertFilter === 'trials') {
      list = list.filter((s) => s.billingType === 'trial');
    }
    return list.sort((a, b) => a.renewalDays - b.renewalDays);
  }, [subscriptions, alertFilter]);

  const handleCancel = async (id: string) => {
    try {
      await deleteSubscriptionById(id);
      removeSubscription(id);
      showToast('Subscription cancelled', 'info');
    } catch {
      showToast('Failed to cancel. Try again.', 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const urgentSubs = subscriptions.filter((s) => s.status === 'urgent' || s.status === 'trial-urgent');
  const totalRenewal = urgentSubs.reduce((s, sub) => s + sub.amount, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Alerts</Text>

        {/* Intelligence banner */}
        {urgentSubs.length > 0 && (
          <View style={styles.intelligenceBanner}>
            <View style={styles.intelligenceIconBox}>
              <Brain size={18} color={COLORS.primary} strokeWidth={2} />
            </View>
            <View style={styles.intelligenceContent}>
              <Text style={styles.intelligenceTitle}>Cardexa Intelligence</Text>
              <Text style={styles.intelligenceSub}>
                {urgentSubs.length} subscription{urgentSubs.length > 1 ? 's' : ''} renewing soon.
                {' '}{fmt(totalRenewal)} total due within 7 days.
              </Text>
            </View>
          </View>
        )}

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const isActive = alertFilter === f.key;
            return (
              <Pressable
                key={f.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setAlertFilter(f.key)}
              >
                <f.Icon
                  size={14}
                  color={isActive ? COLORS.onSurface : COLORS.outline}
                  strokeWidth={2}
                />
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Subscription list */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle2 size={40} color={COLORS.brandTeal} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptySub}>No alerts matching this filter</Text>
          </View>
        ) : (
          filtered.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              subscription={sub}
              onCancel={handleCancel}
              showCard={true}
            />
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  content: { paddingHorizontal: 0, gap: 12, paddingTop: 16 },
  center: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: COLORS.onSurface, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, paddingHorizontal: 20 },

  intelligenceBanner: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: COLORS.secondaryContainer,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    borderRadius: 16, padding: 16, marginHorizontal: 16,
  },
  intelligenceIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.glassWhite,
    alignItems: 'center', justifyContent: 'center',
  },
  intelligenceContent: { flex: 1, gap: 3 },
  intelligenceTitle: { color: COLORS.onSurface, fontSize: 14, fontWeight: '700' },
  intelligenceSub: { color: COLORS.onSurfaceVariant, fontSize: 12, lineHeight: 17 },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  filterTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  filterTabActive: { backgroundColor: COLORS.secondaryContainer, borderColor: COLORS.outlineVariant },
  filterText: { color: COLORS.outline, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: COLORS.onSurface },

  emptyState: {
    alignItems: 'center', gap: 10, paddingVertical: 60,
    marginHorizontal: 16,
  },
  emptyTitle: { color: COLORS.onSurface, fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySub: { color: COLORS.onSurfaceVariant, fontSize: 13 },
});
