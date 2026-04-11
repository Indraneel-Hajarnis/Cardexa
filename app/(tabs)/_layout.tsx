// ── FILE: app/(tabs)/_layout.tsx ──────────────────────────────────────────────
// Tab navigator — Dashboard, SmartPay, Wallet, Alerts

import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '../../components/ui/TabBar';

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarLabel: 'Home' }}
      />
      <Tabs.Screen
        name="smartpay"
        options={{ title: 'SmartPay', tabBarLabel: 'SmartPay' }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ title: 'Wallet', tabBarLabel: 'Wallet' }}
      />
      <Tabs.Screen
        name="alerts"
        options={{ title: 'Alerts', tabBarLabel: 'Alerts' }}
      />
    </Tabs>
  );
}
