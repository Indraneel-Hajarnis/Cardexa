// ── FILE: app/(tabs)/index.tsx ────────────────────────────────────────────────
// Dashboard — DNA persona at top, hero spend, all subscriptions, simulate SMS.

import React, { useState, useCallback, useEffect } from 'react';
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
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import {
  Dna, TrendingUp, CreditCard, Award, Mail,
  AlertTriangle, ChevronRight, LogOut,
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SMSBottomSheet } from '../../components/sms/SMSBottomSheet';
import { SubscriptionRow } from '../../components/subscriptions/SubscriptionRow';
import { fmt, getGreeting } from '../../lib/formatters';
import { simulateIncomingSMS } from '../../lib/smsSync';
import { logoutUser, deleteSubscriptionById } from '../../db/client';
import { COLORS } from '../../constants/theme';
import type { ParsedSMS } from '../../lib/smsSync';

const PERSONA_TAGS = ['Creative', 'Tech-forward', 'Value-conscious', 'Content creator'];
const STAT_LABELS = ['Active subs', 'Monthly', 'Cards', 'Cluster'];

export default function DashboardScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    cards, subscriptions, isLoading, totalMonthly, urgentCount,
    setSMSFlow, resetSMSFlow, removeSubscription, showToast,
  } = useStore();
  const { user, logout: logoutStore } = useAuthStore();

  const handleLogout = async () => {
    await logoutUser();
    logoutStore();
  };

  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeSMS, setActiveSMS] = useState<ParsedSMS | null>(null);

  // Pulse animation for DNA dot
  const dotScale = useSharedValue(1);
  useEffect(() => {
    dotScale.value = withRepeat(
      withTiming(1.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, [dotScale]);
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: dotScale.value }] }));

  const handleSimulateSMS = useCallback(() => {
    const next = simulateIncomingSMS();
    if (!next) return;
    resetSMSFlow();
    setSMSFlow({ pendingSMS: next, step: 1 });
    setActiveSMS(next);
    setSheetVisible(true);
  }, [resetSMSFlow, setSMSFlow]);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setActiveSMS(null);
    resetSMSFlow();
  }, [resetSMSFlow]);

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
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Loading Cardexa…</Text>
      </View>
    );
  }

  const monthlyTotal = totalMonthly();
  const yearlyTotal = monthlyTotal * 12;
  const urgentNum = urgentCount();

  const STAT_VALUES = [
    `${subscriptions.length}`,
    fmt(Math.round(monthlyTotal)),
    `${cards.length}`,
    'Top 12%',
  ];

  const STAT_ICONS = [TrendingUp, CreditCard, CreditCard, Award];

  return (
    <View style={[styles.root, { backgroundColor: COLORS.surfaceContainerLowest }]}>
      <LinearGradient
        colors={['rgba(198,198,199,0.05)', 'transparent']}
        style={[styles.halo, { height: 140 + insets.top }]}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* GREETING */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] ?? 'User'}</Text>
            <Text style={styles.greetingSub}>Here's your financial snapshot</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {urgentNum > 0 && (
              <View style={styles.urgentBadge}>
                <AlertTriangle size={12} color={COLORS.error} strokeWidth={2.5} />
                <Text style={styles.urgentBadgeText}>{urgentNum}</Text>
              </View>
            )}
            <Pressable onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} color={COLORS.outline} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {/* ── SUBSCRIPTION DNA ─────────────────────────────────── */}
        <View style={styles.dnaCard}>
          <View style={styles.dnaHeader}>
            <View style={styles.dnaTitleRow}>
              <View style={styles.dnaIconBox}>
                <Dna size={18} color={COLORS.brandTeal} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.dnaName}>The Creator</Text>
                <Text style={styles.dnaSubtitle}>Subscription DNA</Text>
              </View>
            </View>
            <View style={styles.matchBadge}>
              <View style={styles.activeDotWrapper}>
                <Animated.View style={[styles.activeDotPulse, dotStyle]} />
                <View style={styles.activeDotCore} />
              </View>
              <Text style={styles.matchText}>94%</Text>
            </View>
          </View>
          <Text style={styles.dnaDesc}>
            Creative professional investing in tools that amplify output. High affinity for
            content platforms, cloud storage, and productivity suites.
          </Text>
          <View style={styles.dnaTags}>
            {PERSONA_TAGS.map((t) => (
              <View key={t} style={styles.dnaTag}>
                <Text style={styles.dnaTagText}>{t}</Text>
              </View>
            ))}
          </View>
          {/* Stat pills */}
          <View style={styles.statRow}>
            {STAT_LABELS.map((label, i) => {
              const Icon = STAT_ICONS[i];
              return (
                <View key={label} style={styles.statPill}>
                  <Icon size={13} color={COLORS.outline} strokeWidth={2} />
                  <Text style={styles.statValue}>{STAT_VALUES[i]}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── HERO SPEND ──────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL MONTHLY SUBSCRIPTIONS</Text>
          <Text style={styles.heroAmount}>{fmt(Math.round(monthlyTotal))}</Text>
          <View style={styles.heroChips}>
            <View style={styles.heroChip}>
              <TrendingUp size={12} color={COLORS.onSurfaceVariant} strokeWidth={2} />
              <Text style={styles.heroChipText}>{fmt(Math.round(yearlyTotal))} / year</Text>
            </View>
            <View style={styles.heroChipDivider} />
            <View style={styles.heroChip}>
              <CreditCard size={12} color={COLORS.onSurfaceVariant} strokeWidth={2} />
              <Text style={styles.heroChipText}>{cards.length} cards</Text>
            </View>
          </View>
        </View>

        {/* ── SIMULATE SMS ────────────────────────────────────── */}
        <Pressable style={styles.simulateButton} onPress={handleSimulateSMS}>
          <View style={styles.simulateIconBox}>
            <Mail size={18} color={COLORS.onSurface} strokeWidth={2} />
          </View>
          <View style={styles.simulateContent}>
            <Text style={styles.simulateText}>Simulate Incoming SMS</Text>
            <Text style={styles.simulateSub}>Test subscription detection</Text>
          </View>
          <ChevronRight size={18} color={COLORS.outlineVariant} strokeWidth={2} />
        </Pressable>

        {/* ── ALL SUBSCRIPTIONS ────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Subscriptions</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{subscriptions.length}</Text>
          </View>
        </View>

        {subscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Mail size={40} color={COLORS.outlineVariant} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No subscriptions yet</Text>
            <Text style={styles.emptySub}>
              Use "Simulate SMS" above to add your first subscription
            </Text>
          </View>
        ) : (
          subscriptions.map((sub) => (
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

      <SMSBottomSheet visible={sheetVisible} sms={activeSMS} onClose={handleCloseSheet} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  halo: { position: 'absolute', top: 0, left: 0, right: 0 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: COLORS.onSurfaceVariant, fontSize: 14 },
  scrollContent: { paddingHorizontal: 20, gap: 16 },

  // Greeting
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: COLORS.onSurface, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  greetingSub: { color: COLORS.outline, fontSize: 13, marginTop: 3 },
  urgentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(238,125,119,0.1)',
    borderWidth: 1, borderColor: 'rgba(238,125,119,0.2)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
  },
  urgentBadgeText: { color: COLORS.error, fontSize: 13, fontWeight: '700' },
  logoutBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.glassWhite,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },

  // DNA Card
  dnaCard: {
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    padding: 18, gap: 14,
  },
  dnaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dnaTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dnaIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(0,201,167,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  dnaName: { color: COLORS.onSurface, fontSize: 17, fontWeight: '700' },
  dnaSubtitle: { color: COLORS.outline, fontSize: 11, marginTop: 1 },
  activeDotWrapper: { position: 'relative', width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  activeDotPulse: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,201,167,0.3)' },
  activeDotCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.brandTeal },
  matchBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,201,167,0.08)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(0,201,167,0.15)',
  },
  matchText: { color: COLORS.brandTeal, fontSize: 14, fontWeight: '800' },
  dnaDesc: { color: COLORS.onSurfaceVariant, fontSize: 13, lineHeight: 19 },
  dnaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dnaTag: {
    backgroundColor: COLORS.glassWhite, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  dnaTagText: { color: COLORS.onSurfaceVariant, fontSize: 11, fontWeight: '500' },
  statRow: { flexDirection: 'row', gap: 8 },
  statPill: {
    flex: 1, backgroundColor: COLORS.glassWhite, borderRadius: 12, padding: 10,
    gap: 3, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  statValue: { color: COLORS.onSurface, fontSize: 15, fontWeight: '700' },
  statLabel: { color: COLORS.outline, fontSize: 9, letterSpacing: 0.3, textTransform: 'uppercase' },

  // Hero
  heroCard: {
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  heroLabel: { color: COLORS.outline, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 8 },
  heroAmount: { color: COLORS.onSurface, fontSize: 42, fontWeight: '800', letterSpacing: -2 },
  heroChips: {
    flexDirection: 'row', alignItems: 'center', gap: 0,
    marginTop: 10, backgroundColor: COLORS.glassWhite,
    borderRadius: 10, overflow: 'hidden',
  },
  heroChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  heroChipText: { color: COLORS.onSurfaceVariant, fontSize: 12, fontWeight: '500' },
  heroChipDivider: { width: 1, height: 16, backgroundColor: COLORS.glassBorder },

  // Simulate
  simulateButton: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 16,
    padding: 16,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  simulateIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.glassWhite,
    alignItems: 'center', justifyContent: 'center',
  },
  simulateContent: { flex: 1 },
  simulateText: { color: COLORS.onSurface, fontSize: 14, fontWeight: '600' },
  simulateSub: { color: COLORS.outline, fontSize: 11, marginTop: 2 },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: COLORS.onSurfaceVariant, fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  countBadge: {
    backgroundColor: COLORS.accentContainer, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  countText: { color: COLORS.secondary, fontSize: 11, fontWeight: '700' },

  // Empty
  emptyState: {
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 20, padding: 40,
    alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  emptyTitle: { color: COLORS.onSurface, fontSize: 16, fontWeight: '700', marginTop: 8 },
  emptySub: { color: COLORS.onSurfaceVariant, fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
