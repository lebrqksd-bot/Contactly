import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Platform } from 'react-native';

// Get credentials from environment variables (Expo requires EXPO_PUBLIC_ prefix)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

// Get storage adapter - use AsyncStorage for native, localStorage for web
let storageAdapter: any;
if (Platform.OS === 'web') {
  // For web, use localStorage directly
  storageAdapter = {
    getItem: (key: string) => {
      if (typeof window !== 'undefined') {
        return Promise.resolve(window.localStorage.getItem(key));
      }
      return Promise.resolve(null);
    },
    setItem: (key: string, value: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    },
  };
} else {
  // For native, use AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storageAdapter = AsyncStorage;
}

// Debug: Log if values are loaded (only in development)
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('🔧 Supabase Config:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
  });
}

// Validate that we have proper credentials (only on client side)
if (typeof window !== 'undefined' || Platform.OS !== 'web') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL or Anon Key is missing!');
    console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
    throw new Error('Supabase configuration is missing. Please check your .env file.');
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format. Must start with http:// or https://');
    console.error('Received URL:', supabaseUrl);
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof window !== 'undefined', // Enable for web to auto-detect sessions from URL
  },
});

