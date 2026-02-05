import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Text as RNText, Platform, Modal, TouchableOpacity } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/hooks/useSync';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { performSync, isSyncing, isOnline } = useSync();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Starting sign out process...');
      
      // Sign out and clear state
      await signOut();
      
      console.log('Sign out successful, forcing navigation...');
      
      // Wait a moment to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force full page reload on web to ensure everything is cleared
      if (typeof window !== 'undefined') {
        // Clear any remaining state one more time
        try {
          window.localStorage.clear();
          if (window.sessionStorage) {
            window.sessionStorage.clear();
          }
        } catch (e) {
          console.warn('Error clearing storage:', e);
        }
        
        // Force full page reload - use replace to prevent back button issues
        window.location.replace('/');
      } else {
        // For native, use router
        router.replace('/(auth)');
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if there's an error, force navigation
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.clear();
          if (window.sessionStorage) {
            window.sessionStorage.clear();
          }
        } catch (e) {
          // Ignore
        }
        // Force navigation even on error
        window.location.replace('/');
      } else {
        router.replace('/(auth)');
      }
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleSignOut = async () => {
    // Use native Alert for mobile, custom modal for web
    if (Platform.OS === 'web') {
      setShowLogoutConfirm(true);
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  const handleSync = async () => {
    try {
      const result = await performSync();
      Alert.alert(
        'Sync Complete',
        `Uploaded: ${result.uploaded}, Downloaded: ${result.downloaded}, Errors: ${result.errors}`
      );
    } catch (error: any) {
      Alert.alert('Sync Failed', error.message || 'Failed to sync');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/image/logo.jpeg')}
          style={styles.logoImage}
          resizeMode="contain"
          onError={(e) => {
            console.log('Logo image error:', e.nativeEvent.error);
          }}
        />
        <RNText style={styles.logoText}>Contactly</RNText>
        <RNText style={styles.logoTagline}>Your Digital Contact Hub</RNText>
      </View>
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Email"
          description={user?.email}
          left={(props) => <List.Icon {...props} icon="email" />}
        />
        <List.Item
          title="Full Name"
          description={user?.full_name || 'Not set'}
          left={(props) => <List.Icon {...props} icon="account" />}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Sync</List.Subheader>
        <List.Item
          title="Network Status"
          description={isOnline ? 'Online' : 'Offline'}
          left={(props) => (
            <List.Icon {...props} icon={isOnline ? 'wifi' : 'wifi-off'} />
          )}
        />
        <List.Item
          title="Sync Now"
          description="Sync contacts with cloud"
          left={(props) => <List.Icon {...props} icon="sync" />}
          right={() => (
            <Button
              title="Sync"
              onPress={handleSync}
              loading={isSyncing}
              disabled={!isOnline || isSyncing}
              variant="outline"
              size="sm"
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Categories</List.Subheader>
        <List.Item
          title="Manage Categories"
          description="Create and manage contact categories"
          left={(props) => <List.Icon {...props} icon="tag-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/categories')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="App Name"
          description="Contactly"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="tag" />}
        />
        <List.Item
          title="Tagline"
          description="Your Digital Contact Hub"
          left={(props) => <List.Icon {...props} icon="message-text" />}
        />
      </List.Section>

      <View style={styles.signOutButton}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="primary"
          fullWidth
          loading={isLoggingOut}
          style={styles.signOutButtonStyle}
        />
      </View>

      {/* Web Logout Confirmation Modal */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showLogoutConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sign Out</Text>
              <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLogoutConfirm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.logoutButton]}
                  onPress={performLogout}
                  disabled={isLoggingOut}
                >
                  <Text style={styles.logoutButtonText}>
                    {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  signOutButton: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  signOutButtonStyle: {
    backgroundColor: theme.colors.error,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  logoText: {
    fontSize: theme.typography.fontSize.xxxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  logoTagline: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 16,
    padding: theme.spacing.xl,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  modalMessage: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
  },
  logoutButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#FFFFFF',
  },
});

