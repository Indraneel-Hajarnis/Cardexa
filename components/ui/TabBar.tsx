// ── FILE: components/ui/TabBar.tsx ────────────────────────────────────────────

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Zap, Wallet, Bell } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { COLORS } from '../../constants/theme';

const TAB_ICONS: Record<string, React.ComponentType<any>> = {
  index: LayoutDashboard,
  smartpay: Zap,
  wallet: Wallet,
  alerts: Bell,
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const urgentCount = useStore((s) => s.urgentCount());

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label = (options.tabBarLabel as string) ?? options.title ?? route.name;
          const IconComponent = TAB_ICONS[route.name] ?? LayoutDashboard;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const showBadge = route.name === 'alerts' && urgentCount > 0;

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              <View style={[styles.pill, isFocused && styles.pillActive]}>
                <View style={styles.iconWrapper}>
                  <IconComponent
                    size={20}
                    color={isFocused ? COLORS.primary : COLORS.primaryContainer}
                    strokeWidth={isFocused ? 2.2 : 1.8}
                  />
                  {showBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{urgentCount > 9 ? '9+' : urgentCount}</Text>
                    </View>
                  )}
                </View>
                {isFocused && (
                  <Text style={styles.label}>{label}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(14,14,14,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(72,72,72,0.25)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 56,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    gap: 6,
  },
  pillActive: {
    backgroundColor: 'rgba(198,198,199,0.1)',
  },
  iconWrapper: {
    position: 'relative',
  },
  label: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -7,
    backgroundColor: COLORS.error,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainerLowest,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
});
