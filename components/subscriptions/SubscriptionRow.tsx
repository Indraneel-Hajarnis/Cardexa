// ── FILE: components/subscriptions/SubscriptionRow.tsx ───────────────────────
// Swipeable subscription row — swipe-left reveals red Cancel action.

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { StatusBadge } from './StatusBadge';
import { fmt, fmtCycle } from '../../lib/formatters';
import { getSubscriptionIcon, getCategoryDef } from '../../constants/categories';
import type { Subscription } from '../../store/useStore';
import { COLORS } from '../../constants/theme';

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

interface SubscriptionRowProps {
  subscription: Subscription;
  onCancel?: (id: string) => void;
  showCard?: boolean;
  cardVariant?: string;
}

export function SubscriptionRow({
  subscription,
  onCancel,
  showCard = false,
  cardVariant,
}: SubscriptionRowProps): React.JSX.Element {
  const translateX = useRef(new Animated.Value(0)).current;
  const swipedOpen = useRef(false);

  const close = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
    swipedOpen.current = false;
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const newX = swipedOpen.current ? g.dx - ACTION_WIDTH : g.dx;
        if (newX < 0) {
          translateX.setValue(Math.max(newX, -ACTION_WIDTH));
        }
      },
      onPanResponderRelease: (_, g) => {
        const currentX = swipedOpen.current ? g.dx - ACTION_WIDTH : g.dx;
        if (currentX < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -ACTION_WIDTH,
            useNativeDriver: true,
            damping: 20,
            stiffness: 300,
          }).start();
          swipedOpen.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          close();
        }
      },
    })
  ).current;

  const handleCancel = () => {
    Alert.alert(
      `Cancel ${subscription.name}?`,
      'This will remove the subscription from Cardexa.',
      [
        { text: 'Keep', style: 'cancel', onPress: close },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            close();
            onCancel?.(subscription.id);
          },
        },
      ]
    );
  };

  const statusBorderColor =
    subscription.status === 'urgent'       ? COLORS.error :
    subscription.status === 'warning'      ? COLORS.secondary :
    subscription.status === 'trial-urgent' ? COLORS.primary :
    COLORS.outlineVariant;

  // Get the Lucide icon for this subscription
  const SubIcon = getSubscriptionIcon(subscription.icon);
  const catDef = getCategoryDef(subscription.category);

  return (
    <View style={styles.outerContainer}>
      {/* Cancel action revealed on swipe */}
      <View style={styles.cancelAction}>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <X size={18} color={COLORS.onSurface} strokeWidth={2.5} />
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      {/* Row content */}
      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Status accent */}
        <View style={[styles.statusBar, { backgroundColor: statusBorderColor }]} />

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: catDef.bgColor }]}>
          <SubIcon size={20} color={catDef.color} strokeWidth={1.8} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{subscription.name}</Text>
            <Text style={styles.amount}>{fmt(subscription.amount)}</Text>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{fmtCycle(subscription.cycle)}</Text>
              <View style={styles.categoryChip}>
                <catDef.Icon size={10} color={catDef.color} strokeWidth={2} />
                <Text style={[styles.categoryChipText, { color: catDef.color }]}>
                  {catDef.label}
                </Text>
              </View>
            </View>
            <StatusBadge status={subscription.status} renewalDays={subscription.renewalDays} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cancelAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    alignItems: 'center',
    gap: 3,
  },
  cancelText: {
    color: COLORS.onSurface,
    fontSize: 10,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  statusBar: {
    width: 3,
    alignSelf: 'stretch',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginVertical: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    color: COLORS.outline,
    fontSize: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
