// ── FILE: app/auth/login.tsx ──────────────────────────────────────────────────
// Login screen — local-first auth, Stitch design language.

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react-native';
import { loginUser } from '../../db/client';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export default function LoginScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      shake();
      return;
    }
    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      if ('error' in result) {
        setError(result.error);
        shake();
      } else {
        setUser(result);
      }
    } catch {
      setError('Something went wrong');
      shake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Floating doodle background */}
      <LottieView
        source={require('../../assets/floatingDoodleBackground.json')}
        autoPlay
        loop
        speed={0.4}
        resizeMode="cover"
        style={styles.lottieBackground}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Logo area */}
            <View style={styles.logoArea}>
              <View style={styles.logoIcon}>
                <Sparkles size={28} color={COLORS.accent} strokeWidth={1.8} />
              </View>
              <Text style={styles.logoText}>Cardexa</Text>
              <Text style={styles.subtitle}>Your finances, unified</Text>
            </View>

            {/* Form card */}
            <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
              <Text style={styles.formTitle}>Welcome back</Text>
              <Text style={styles.formSubtitle}>Sign in to your account</Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color={COLORS.outline} strokeWidth={1.8} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.outlineVariant}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={COLORS.outline} strokeWidth={1.8} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.outlineVariant}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    {showPassword
                      ? <EyeOff size={18} color={COLORS.outline} strokeWidth={1.8} />
                      : <Eye size={18} color={COLORS.outline} strokeWidth={1.8} />
                    }
                  </Pressable>
                </View>
              </View>

              {/* Login button */}
              <Pressable
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.onAccent} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                    <ArrowRight size={18} color={COLORS.onAccent} strokeWidth={2.5} />
                  </>
                )}
              </Pressable>
            </Animated.View>

            {/* Register link */}
            <View style={styles.bottomLink}>
              <Text style={styles.bottomLinkText}>Don't have an account?</Text>
              <Pressable onPress={() => router.replace('/auth/register')}>
                <Text style={styles.bottomLinkAction}>Create one</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainer,
  },
  flex: { flex: 1 },
  lottieBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingBottom: 40,
  },
  content: {
    gap: SPACING.xxxl,
  },

  // Logo
  logoArea: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.accentContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  logoText: {
    color: COLORS.onSurface,
    ...TYPOGRAPHY.displayMedium,
  },
  subtitle: {
    color: COLORS.outline,
    ...TYPOGRAPHY.bodyLarge,
  },

  // Form card
  formCard: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    gap: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  formTitle: {
    color: COLORS.onSurface,
    ...TYPOGRAPHY.headlineLarge,
  },
  formSubtitle: {
    color: COLORS.outline,
    ...TYPOGRAPHY.bodyMedium,
    marginTop: -SPACING.sm,
  },

  // Error
  errorBox: {
    backgroundColor: 'rgba(238,125,119,0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(238,125,119,0.2)',
  },
  errorText: {
    color: COLORS.error,
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
  },

  // Inputs
  inputGroup: {
    gap: SPACING.xs + 2,
  },
  inputLabel: {
    color: COLORS.onSurfaceVariant,
    ...TYPOGRAPHY.labelLarge,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.onSurface,
    ...TYPOGRAPHY.bodyLarge,
    height: 52,
  },
  eyeButton: {
    padding: SPACING.sm,
    marginRight: -SPACING.sm,
  },

  // Primary button
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    height: 52,
    marginTop: SPACING.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.onAccent,
    ...TYPOGRAPHY.labelLarge,
  },

  // Bottom link
  bottomLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs + 2,
  },
  bottomLinkText: {
    color: COLORS.outline,
    ...TYPOGRAPHY.bodyMedium,
  },
  bottomLinkAction: {
    color: COLORS.accent,
    ...TYPOGRAPHY.labelLarge,
  },
});
