// ── FILE: app/auth/register.tsx ───────────────────────────────────────────────
// Registration screen — local-first, Stitch design language.

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Check } from 'lucide-react-native';
import { registerUser } from '../../db/client';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export default function RegisterScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // Password strength
  const getPasswordStrength = (): { label: string; color: string; pct: number } => {
    if (password.length === 0) return { label: '', color: COLORS.outlineVariant, pct: 0 };
    if (password.length < 4) return { label: 'Weak', color: COLORS.error, pct: 25 };
    if (password.length < 6) return { label: 'Fair', color: COLORS.secondary, pct: 50 };
    if (password.length < 8) return { label: 'Good', color: COLORS.brandTeal, pct: 75 };
    return { label: 'Strong', color: '#69F0AE', pct: 100 };
  };

  const strength = getPasswordStrength();

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      shake();
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      shake();
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      shake();
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser(name, email, password);
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
            {/* Logo */}
            <View style={styles.logoArea}>
              <View style={styles.logoIcon}>
                <Sparkles size={28} color={COLORS.accent} strokeWidth={1.8} />
              </View>
              <Text style={styles.logoText}>Create Account</Text>
              <Text style={styles.subtitle}>Start managing your subscriptions</Text>
            </View>

            {/* Form */}
            <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={COLORS.outline} strokeWidth={1.8} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.outlineVariant}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

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
                    placeholder="Min 4 characters"
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
                {/* Strength bar */}
                {password.length > 0 && (
                  <View style={styles.strengthRow}>
                    <View style={styles.strengthTrack}>
                      <View style={[styles.strengthFill, { width: `${strength.pct}%`, backgroundColor: strength.color }]} />
                    </View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={COLORS.outline} strokeWidth={1.8} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor={COLORS.outlineVariant}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                  {confirmPassword.length > 0 && confirmPassword === password && (
                    <Check size={18} color={COLORS.brandTeal} strokeWidth={2.5} />
                  )}
                </View>
              </View>

              {/* Register button */}
              <Pressable
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.onAccent} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Create Account</Text>
                    <ArrowRight size={18} color={COLORS.onAccent} strokeWidth={2.5} />
                  </>
                )}
              </Pressable>
            </Animated.View>

            {/* Login link */}
            <View style={styles.bottomLink}>
              <Text style={styles.bottomLinkText}>Already have an account?</Text>
              <Pressable onPress={() => router.replace('/auth/login')}>
                <Text style={styles.bottomLinkAction}>Sign in</Text>
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
    gap: SPACING.xxl,
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
    ...TYPOGRAPHY.headlineLarge,
  },
  subtitle: {
    color: COLORS.outline,
    ...TYPOGRAPHY.bodyMedium,
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

  // Strength
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  strengthTrack: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.glassWhite,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    ...TYPOGRAPHY.labelSmall,
    width: 44,
    textAlign: 'right',
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
