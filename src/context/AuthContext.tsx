import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = React.useRef(false); // Prevent multiple simultaneous loads

  useEffect(() => {
    let mounted = true;
    let timeout: NodeJS.Timeout;
    
    // Check for OTP or OAuth callback in URL first
    const handleAuthFromURL = async () => {
      try {
        if (typeof window !== 'undefined') {
          const result = await authService.verifyOTPFromURL();
          if (result) {
            // OAuth or OTP was verified, session is set
            console.log('Auth callback detected (OAuth or Magic Link), setting session...');
            // Wait a moment for session to be fully set, then load user
            // Also trigger loadUser directly to ensure it happens
            setTimeout(async () => {
              if (mounted) {
                console.log('Loading user after auth callback...');
                await loadUser();
              }
            }, 500);
            return;
          }
        }
      } catch (error) {
        console.error('Error handling auth from URL:', error);
      }
      // If no auth callback in URL, just load user normally
      if (mounted) {
        await loadUser();
      }
    };

    handleAuthFromURL();

    // Fallback: if loading takes too long, set loading to false
    timeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth loading timeout, setting loading to false');
        setLoading(false);
        loadingRef.current = false;
      }
    }, 10000); // 10 second timeout

    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user ? 'User in session' : 'No user');
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // When user signs in or token is refreshed, load user
        console.log('User signed in or token refreshed, loading user...');
        if (mounted) {
          await loadUser();
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log('User signed out or deleted');
        if (mounted) {
          setUser(null);
          setLoading(false);
          loadingRef.current = false;
        }
      }
    });

    return () => {
      mounted = false;
      if (timeout) clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log('loadUser already in progress, skipping...');
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      console.log('Loading user...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log('Load user timeout, assuming no user');
          resolve(null);
        }, 5000);
      });

      const userPromise = authService.getCurrentUser();
      const currentUser = await Promise.race([userPromise, timeoutPromise]);
      
      console.log('Current user loaded:', currentUser ? `User found: ${currentUser.email}` : 'No user');
      
      // If user is null, it means they were deleted or session is invalid
      if (!currentUser) {
        // Check if we have a session anyway - user profile might not exist yet
        try {
          const session = await authService.getSession();
          if (session?.session?.user) {
            // We have a session but user profile doesn't exist yet
            // Create a basic user object from session
            console.log('Session exists but user profile not found, creating basic user object');
            const basicUser = {
              id: session.session.user.id,
              email: session.session.user.email || '',
              full_name: session.session.user.user_metadata?.full_name || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as User;
            setUser(basicUser);
            setLoading(false);
            loadingRef.current = false;
            return;
          }
        } catch (sessionError) {
          console.error('Error checking session:', sessionError);
        }
        
        // No session either, user is not authenticated
        console.log('No user found, setting user to null');
        setUser(null);
      } else {
        console.log('Setting user:', currentUser.email);
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // If there's an error, check if we have a session anyway
      try {
        const session = await authService.getSession();
        if (session?.session?.user) {
          // We have a session but getCurrentUser failed
          // Create a basic user object from session
          console.log('Session exists but getCurrentUser failed, creating basic user object');
          const basicUser = {
            id: session.session.user.id,
            email: session.session.user.email || '',
            full_name: session.session.user.user_metadata?.full_name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User;
          setUser(basicUser);
        } else {
          setUser(null);
        }
      } catch (sessionError) {
        console.error('Error checking session:', sessionError);
        setUser(null);
      }
    } finally {
      // Always set loading to false, even if there's an error
      setLoading(false);
      loadingRef.current = false;
      console.log('Load user completed, loading set to false');
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Signing in...');
    const result = await authService.signIn(email, password);
    console.log('Sign in result:', result?.user ? 'User found' : 'No user');
    // Immediately load user after sign in
    await loadUser();
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const result = await authService.signUp(email, password, fullName);
    // If user is automatically confirmed (email confirmation disabled), load user
    // If email confirmation is enabled, user will need to confirm email first
    if (result.user && result.session) {
      // User is automatically logged in (email confirmation disabled)
      console.log('User signed up and logged in automatically');
      await loadUser();
    } else if (result.user && !result.session) {
      // User created but needs email confirmation
      // Don't load user yet - they need to confirm email first
      console.log('User created. Please confirm your email to sign in.');
      // Still try to load user in case session exists
      await loadUser();
    } else {
      // Try to load user anyway (in case session was created)
      console.log('Sign up completed, loading user...');
      await loadUser();
    }
  };

  const signInWithOTP = async (email: string) => {
    await authService.signInWithOTP(email);
  };

  const verifyOTP = async (email: string, token: string) => {
    console.log('Verifying OTP...');
    const result = await authService.verifyOTP(email, token);
    console.log('OTP verification result:', result?.user ? 'User found' : 'No user');
    // Immediately load user after OTP verification
    await loadUser();
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
    // Google OAuth will redirect, so we'll load user after redirect
    setTimeout(async () => {
      await loadUser();
    }, 1000);
  };

  const signOut = async () => {
    try {
      console.log('Signing out from AuthContext...');
      
      // Clear user state immediately (before service sign out)
      setUser(null);
      setLoading(false);
      loadingRef.current = false;
      
      // Sign out from service (this will clear Supabase session and storage)
      await authService.signOut();
      
      // Ensure state is cleared after service sign out
      setUser(null);
      setLoading(false);
      loadingRef.current = false;
      
      // Force a small delay to ensure state is fully cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Sign out successful - state cleared');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if signOut fails, clear local state
      setUser(null);
      setLoading(false);
      loadingRef.current = false;
      // Don't throw - we want to ensure navigation happens
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithOTP,
        verifyOTP,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

