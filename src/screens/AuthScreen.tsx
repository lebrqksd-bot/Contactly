import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';
import { strings } from '@/constants/strings';

const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

type AuthMode = 'login' | 'signup' | 'magic-link';

export default function AuthScreen() {
  const router = useRouter();
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal:
        Dimensions.get('window').width < 400
          ? 0
          : Math.max(Dimensions.get('window').width * 0.05, 16),
      paddingVertical: Math.max(Dimensions.get('window').height * 0.03, 24),
      width: '100%',
      alignSelf: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Math.max(Dimensions.get('window').height * 0.03, theme.spacing.lg),
    },
    logo: {
      width: Math.max(Dimensions.get('window').width * 0.25, 80),
      height: Math.max(Dimensions.get('window').width * 0.25, 80),
      borderRadius: theme.borderRadius.lg,
    },
    appTitle: {
      fontSize: Math.max(Dimensions.get('window').width * 0.07, theme.typography.fontSize.xl),
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
      marginTop: theme.spacing.sm,
    },
    form: {
      width: '100%',
    },
    authTabs: {
      flexDirection: 'row',
      marginBottom: Math.max(Dimensions.get('window').height * 0.02, theme.spacing.md),
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.lg,
      padding: 2,
    },
    authTab: {
      flex: 1,
      paddingVertical: Math.max(Dimensions.get('window').height * 0.012, 8),
      paddingHorizontal: Math.max(Dimensions.get('window').width * 0.02, 8),
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
    },
    authTabActive: {
      backgroundColor: theme.colors.primary,
    },
    authTabText: {
      fontSize: Math.max(Dimensions.get('window').width * 0.045, theme.typography.fontSize.sm),
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },
    authTabTextActive: {
      color: '#FFFFFF',
      fontFamily: theme.typography.fontFamily.semiBold,
    },
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      setPasswordError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    clearErrors();
    
    if (!fullName.trim()) {
      setNameError('Full name is required');
      return;
    }

    if (!email) {
      setEmailError(strings.errors.emailRequired);
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(strings.errors.emailInvalid);
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      setSuccessMessage('Account created! Please check your email to verify your account.');
      setAuthMode('login');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        setEmailError('This email is already registered. Please sign in.');
      } else {
        setEmailError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    clearErrors();
    
    if (!email) {
      setEmailError(strings.errors.emailRequired);
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(strings.errors.emailInvalid);
      return;
    }

    setLoading(true);
    try {
      await signInWithOTP(email.trim());
      setLinkSent(true);
    } catch (error: any) {
      setEmailError(error.message || strings.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setEmailError(error.message || strings.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return <Loader visible={true} overlay message={strings.loading.loading} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Animated.View entering={FadeIn.duration(theme.animation.duration.normal)} style={styles.logoContainer}>
            <Image
              source={require('../../assets/image/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
              onError={(e) => {
                console.log('Logo image error:', e.nativeEvent.error);
              }}
            />
            <Text style={styles.appTitle}>Contactly</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(theme.animation.duration.normal)}
            style={styles.form}
          >
            {linkSent ? (
              <View style={styles.successContainer}>
                <MaterialCommunityIcons
                  name="email-check"
                  size={64}
                  color={theme.colors.success}
                />
                <Text style={styles.successTitle}>{strings.auth.magicLinkSent}</Text>
                <Text style={styles.successMessage}>
                  Check your email and click the link to sign in.
                </Text>
                <Button
                  title={strings.auth.resendLink}
                  onPress={() => {
                    setLinkSent(false);
                    setEmail('');
                  }}
                  variant="outline"
                  style={styles.resendButton}
                />
              </View>
            ) : (
              <>
                {/* Success Message */}
                {successMessage ? (
                  <View style={styles.successBanner}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
                    <Text style={styles.successBannerText}>{successMessage}</Text>
                  </View>
                ) : null}

                {/* Auth Mode Tabs */}
                <View style={styles.authTabs}>
                  <TouchableOpacity
                    style={[styles.authTab, authMode === 'login' && styles.authTabActive]}
                    onPress={() => { setAuthMode('login'); clearErrors(); }}
                  >
                    <Text style={[styles.authTabText, authMode === 'login' && styles.authTabTextActive]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.authTab, authMode === 'signup' && styles.authTabActive]}
                    onPress={() => { setAuthMode('signup'); clearErrors(); }}
                  >
                    <Text style={[styles.authTabText, authMode === 'signup' && styles.authTabTextActive]}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.authTab, authMode === 'magic-link' && styles.authTabActive]}
                    onPress={() => { setAuthMode('magic-link'); clearErrors(); }}
                  >
                    <Text style={[styles.authTabText, authMode === 'magic-link' && styles.authTabTextActive]}>
                      Magic Link
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sign Up Form */}
                {authMode === 'signup' && (
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="John Doe"
                    autoCapitalize="words"
                    autoComplete="name"
                    error={nameError}
                    leftIcon={
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={20}
                        color={theme.colors.text.secondary}
                      />
                    }
                  />
                )}

                {/* Email Input (all modes) */}
                <Input
                  label={strings.auth.email}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={emailError}
                  leftIcon={
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color={theme.colors.text.secondary}
                    />
                  }
                />

                {/* Password Input (login and signup modes) */}
                {(authMode === 'login' || authMode === 'signup') && (
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    error={passwordError}
                    leftIcon={
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={20}
                        color={theme.colors.text.secondary}
                      />
                    }
                    rightIcon={
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialCommunityIcons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={theme.colors.text.secondary}
                        />
                      </TouchableOpacity>
                    }
                  />
                )}

                {/* Confirm Password (signup mode only) */}
                {authMode === 'signup' && (
                  <Input
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    leftIcon={
                      <MaterialCommunityIcons
                        name="lock-check-outline"
                        size={20}
                        color={theme.colors.text.secondary}
                      />
                    }
                  />
                )}

                {/* Submit Button */}
                <Button
                  title={
                    authMode === 'login' ? 'Sign In' :
                    authMode === 'signup' ? 'Create Account' :
                    'Send Magic Link'
                  }
                  onPress={
                    authMode === 'login' ? handleLogin :
                    authMode === 'signup' ? handleSignUp :
                    handleSendMagicLink
                  }
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  style={{marginTop: 0, paddingVertical: 0, paddingHorizontal: 0}}
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title={strings.auth.continueWithGoogle}
                  onPress={handleGoogleSignIn}
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon={
                    <MaterialCommunityIcons
                      name="google"
                      size={20}
                      color={theme.colors.primary}
                    />
                  }
                  style={{marginTop: 0, paddingVertical: 0, paddingHorizontal: 0}}
                />
              </>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.lg,
  },
  appTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  form: {
    width: '100%',
  },
  authTabs: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
  },
  authTab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  authTabActive: {
    backgroundColor: theme.colors.primary,
  },
  authTabText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  authTabTextActive: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  successBannerText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.success,
  },
  signInButton: {
    marginTop: theme.spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  dividerText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
  },
  successContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  successTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  resendButton: {
    marginTop: theme.spacing.md,
  },
});
