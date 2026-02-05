import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasAuthCallback, setHasAuthCallback] = useState(false);
  const [authStatus, setAuthStatus] = useState('Initializing...');
  const redirectAttempted = useRef(false);

  useEffect(() => {
    // Check for OAuth or Magic Link callback in URL
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash.includes('access_token') || hash.includes('type=oauth') || hash.includes('type=email') || search.includes('token=')) {
        // Auth callback detected (OAuth or Magic Link)
        console.log('Auth callback detected in URL, will be handled by AuthContext');
        setHasAuthCallback(true);
        setAuthStatus('Processing login...');
      }
    }
    // Small delay to ensure router is mounted
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Watch for user state changes and redirect when user is loaded
  useEffect(() => {
    if (user && !loading && !redirectAttempted.current) {
      console.log('User authenticated, redirecting to contacts...');
      redirectAttempted.current = true;
      setAuthStatus('Logged in! Redirecting...');
      // Use router.replace to avoid adding to history
      router.replace('/(tabs)');
    }
  }, [user, loading, router]);

  // Timeout for auth callback - if it takes too long, show error or retry
  useEffect(() => {
    if (hasAuthCallback && !user) {
      const timeout = setTimeout(() => {
        if (!user) {
          setAuthStatus('Login may have timed out. Retrying...');
          // Force reload to retry
          if (typeof window !== 'undefined') {
            // Check if URL still has tokens
            if (window.location.hash.includes('access_token')) {
              // Tokens still there, might be stuck - clear and retry
              console.log('Auth callback stuck, clearing URL and reloading...');
              window.history.replaceState({}, document.title, window.location.origin);
              window.location.reload();
            }
          }
        }
      }, 8000); // 8 second timeout for auth callback
      return () => clearTimeout(timeout);
    }
  }, [hasAuthCallback, user]);

  // If user is logged in, redirect to contacts page immediately
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // Show loading only while actively checking auth (briefly)
  // But if we have an auth callback, wait longer for user to load
  if (loading && (checkingAuth || hasAuthCallback) && !user) {
    // Show loading for auth callback or initial check
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00183d' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        {hasAuthCallback && (
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 14 }}>{authStatus}</Text>
        )}
      </View>
    );
  }

  // If user is not logged in, redirect to login page
  // Don't wait indefinitely - show auth screen
  return <Redirect href="/(auth)" />;
}

