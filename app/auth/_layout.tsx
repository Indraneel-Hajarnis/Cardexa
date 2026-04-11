// ── FILE: app/auth/_layout.tsx ────────────────────────────────────────────────
// Auth group layout — no headers, dark bg.

import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function AuthLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.surfaceContainer },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
