/**
 * Modern Auth Screen
 * Updated to use ModernInput and PrimaryButton components
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { ModernInput } from '@/components/ui/ModernInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ModernLoader } from '@/components/ui/ModernLoader';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import shadows from '../../theme/shadows';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export default function ModernAuthScreen() {
  const router = useRouter();
  const { signInWithOTP, signInWithGoogle, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      router.replace('/(tabs)');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('type=oauth')) {
        setLoading(true);
      }
    }
  }, []);

  const handleSendMagicLink = async () => {
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await signInWithOTP(email);
      setLinkSent(true);
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      setEmailError(error.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setEmailError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setEmailError(error.message || 'Google sign in failed. Please try again.');
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <ModernLoader
        visible={true}
        overlay={true}
        message="Signing you in..."
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.logoContainer}
        >
          <Image
            source={require('../../assets/image/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
            onError={(e) => {
              console.log('Logo image error:', e.nativeEvent.error);
            }}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.content}
        >
          {linkSent ? (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons
                name="email-check-outline"
                size={64}
                color={colors.success}
                style={styles.successIcon}
              />
              <Text style={styles.successTitle}>Check your email</Text>
              <Text style={styles.successMessage}>
                We've sent a sign-in link to {email}
              </Text>
              <PrimaryButton
                title="Resend Link"
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
              <Text style={styles.title}>Welcome to Contactly</Text>
              <Text style={styles.subtitle}>
                Sign in to manage your contacts
              </Text>

              <View style={styles.form}>
                <ModernInput
                  label="Email Address"
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  error={emailError}
                  leftIcon="email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  isRequired
                  containerStyle={styles.inputContainer}
                />

                <PrimaryButton
                  title="Continue with Email"
                  onPress={handleSendMagicLink}
                  loading={loading}
                  fullWidth
                  leftIcon={
                    <MaterialCommunityIcons
                      name="email"
                      size={20}
                      color={colors.textInverse}
                    />
                  }
                  style={styles.emailButton}
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <PrimaryButton
                  title="Continue with Google"
                  onPress={handleGoogleSignIn}
                  variant="outline"
                  fullWidth
                  leftIcon={
                    <MaterialCommunityIcons
                      name="google"
                      size={20}
                      color={colors.primary}
                    />
                  }
                  style={styles.googleButton}
                />
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isSmallScreen ? 20 : 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: isSmallScreen ? 100 : 120,
    height: isSmallScreen ? 100 : 120,
    borderRadius: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.heading,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.text,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  emailButton: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.small,
    color: colors.textLight,
    marginHorizontal: 16,
  },
  googleButton: {
    marginBottom: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    ...typography.headingSmall,
    color: colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    ...typography.text,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  resendButton: {
    marginTop: 8,
  },
});

