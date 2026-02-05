import { supabase } from './supabase';
import { User } from '@/types';

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName?: string) {
    // Get the current origin (works for both web and mobile)
    let redirectUrl: string | undefined;
    
    if (typeof window !== 'undefined') {
      // Web environment - use current origin
      redirectUrl = `${window.location.origin}`;
    } else {
      // Mobile environment - use the app scheme
      redirectUrl = 'contactly://';
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) throw error;

    // User profile will be automatically created by database trigger
    // No need to manually insert - the trigger handles it server-side
    
    // Note: If email confirmation is enabled, user needs to confirm email before signing in
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Provide user-friendly error messages
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      throw new Error(error.message || 'Failed to sign in. Please try again.');
    }
    return data;
  },

  // Sign in with OTP (Magic Link)
  async signInWithOTP(email: string) {
    // Get the current origin (works for both web and mobile)
    let redirectUrl: string | undefined;
    
    if (typeof window !== 'undefined') {
      // Web environment - redirect to home screen after clicking link
      // Use the base URL, the app will handle routing to /(tabs)
      redirectUrl = `${window.location.origin}`;
    } else {
      // Mobile environment - use the app scheme
      redirectUrl = 'contactly://';
    }

    // Send magic link - user will be created in auth.users but NOT in public.users until link is clicked
    // The database trigger checks email_confirmed_at before creating user profile
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Create in auth.users, but trigger prevents public.users creation until verified
        emailRedirectTo: redirectUrl, // Redirect to home screen after clicking link
      },
    });

    if (error) {
      console.error('Magic link send error:', error);
      // Provide more helpful error messages
      if (error.message?.includes('email') || error.message?.includes('invalid')) {
        throw new Error('Failed to send email. Please check your email address and try again.');
      }
      if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error.message?.includes('SMTP') || error.message?.includes('email')) {
        throw new Error('Email service error. Please check your Supabase email configuration (SMTP settings).');
      }
      throw new Error(error.message || 'Failed to send email. Please check your email settings in Supabase.');
    }
    
    console.log('Magic link sent successfully to:', email);
    return data;
  },

  // Verify OTP
  async verifyOTP(email: string, token: string) {
    // Verify OTP - this will create the user if they don't exist (when shouldCreateUser was false)
    // But we need to handle the case where user doesn't exist
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      // If verification fails and user doesn't exist, we need to create them first
      if (error.message?.includes('User not found') || error.message?.includes('Invalid token')) {
        // User doesn't exist, need to send OTP with shouldCreateUser first
        throw new Error('Please request a new OTP code. User account will be created when you verify the code.');
      }
      throw error;
    }

    // User is created only after successful OTP verification
    console.log('OTP verified successfully, user authenticated');
    return data;
  },

  // Verify OTP or OAuth from URL (for magic link clicks and OAuth redirects)
  async verifyOTPFromURL() {
    if (typeof window === 'undefined') return null;

    try {
      // Check URL hash for Supabase auth tokens
      const hash = window.location.hash;
      
      // Early exit if no hash
      if (!hash || hash.length < 2) {
        return null;
      }
      
      const params = new URLSearchParams(hash.substring(1));
      
      // Check query params as well
      const queryParams = new URLSearchParams(window.location.search);
      
      // Supabase puts tokens in hash like: #access_token=xxx&type=email or #access_token=xxx&type=oauth
      const accessToken = params.get('access_token') || queryParams.get('access_token');
      const refreshToken = params.get('refresh_token') || queryParams.get('refresh_token');
      const token = params.get('token') || queryParams.get('token');
      const type = params.get('type') || queryParams.get('type');

      // Handle OAuth callback (Google, etc.) or Magic Link
      if (accessToken && refreshToken) {
        console.log('Auth callback detected (OAuth or Magic Link), setting session...');
        console.log('Access token length:', accessToken.length);
        
        // Clear URL FIRST to prevent reprocessing on re-render
        try {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          console.log('URL cleaned before session set');
        } catch (e) {
          console.warn('Could not clear URL hash:', e);
        }
        
        // Set the session directly
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error setting session from URL:', error);
          // Try to get session anyway - Supabase might have already processed it
          const existingSession = await supabase.auth.getSession();
          if (existingSession.data?.session) {
            console.log('Found existing session, using that instead');
            return existingSession.data;
          }
          return null;
        }

        console.log('Session set successfully from auth callback');
        return data;
      }

      // If we have a token and type, verify OTP (fallback for code-based OTP)
      if (token && type === 'email') {
        // Extract email from URL
        const email = params.get('email') || queryParams.get('email');
        
        // Clear URL first
        try {
          window.history.replaceState({}, document.title, window.location.origin);
        } catch (e) {
          console.warn('Could not clear URL:', e);
        }
        
        const { data, error } = await supabase.auth.verifyOtp({
          email: email || '',
          token,
          type: 'email',
        });

        if (error) {
          console.error('Error verifying OTP from URL:', error);
          return null;
        }

        return data;
      }

      return null;
    } catch (error) {
      console.error('Error processing auth from URL:', error);
      // Try to recover by checking if session exists anyway
      try {
        const existingSession = await supabase.auth.getSession();
        if (existingSession.data?.session) {
          console.log('Recovered session after error');
          // Clear URL
          try {
            window.history.replaceState({}, document.title, window.location.origin);
          } catch (e) {}
          return existingSession.data;
        }
      } catch (e) {}
      return null;
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    // Get the current origin (works for both web and mobile)
    let redirectUrl: string | undefined;
    
    if (typeof window !== 'undefined') {
      // Web environment - redirect to root, which will handle routing
      // The root index.tsx will detect the auth callback and redirect appropriately
      redirectUrl = `${window.location.origin}`;
    } else {
      // Mobile environment - use the app scheme
      redirectUrl = 'contactly://';
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    try {
      console.log('Starting sign out process...');
      
      // Clear ALL local storage FIRST (web) - be more aggressive
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          // Clear ALL localStorage (not just Supabase keys)
          window.localStorage.clear();
          
          // Also clear ALL sessionStorage
          if (window.sessionStorage) {
            window.sessionStorage.clear();
          }
          
          console.log('All storage cleared');
        } catch (e) {
          console.warn('Error clearing storage:', e);
        }
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
        // Continue anyway - we've already cleared local state
      }
      
      // Double-check: Clear storage again after Supabase sign out
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.clear();
          if (window.sessionStorage) {
            window.sessionStorage.clear();
          }
        } catch (e) {
          console.warn('Error clearing storage after sign out:', e);
        }
      }
      
      console.log('Sign out completed successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even on error, clear storage
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.clear();
          if (window.sessionStorage) {
            window.sessionStorage.clear();
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      // Check if auth user exists and is valid
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // If auth user doesn't exist or was deleted, sign out and return null
      if (!user || authError) {
        if (authError) {
          console.log('Auth user not found or invalid, signing out...', authError);
          // User was deleted or session is invalid, sign out
          await supabase.auth.signOut();
        }
        return null;
      }

      console.log('Auth user found:', user.id, user.email);

      // Try to get user profile with timeout
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      let data, error;
      try {
        const result = await Promise.race([profilePromise, timeoutPromise]) as any;
        data = result.data;
        error = result.error;
      } catch (timeoutError) {
        console.warn('Profile fetch timed out, using basic user object');
        // Return basic user if profile fetch times out
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as User;
      }

      // If user profile doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        console.log('User profile not found in database, creating...');
        // User profile doesn't exist - create it
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          console.log('Returning basic user object from auth user');
          // Return basic user info if profile creation fails (RLS might block it)
          // This ensures user can still access the app
          const basicUser = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User;
          console.log('Returning user:', basicUser.email);
          return basicUser;
        }

        console.log('User profile created successfully');
        return newProfile;
      }

      if (error) {
        console.error('Error fetching user profile:', error);
        console.log('Returning basic user object due to error');
        // Return basic user info if fetch fails
        // This ensures authenticated users can still access the app
        const basicUser = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as User;
        console.log('Returning user:', basicUser.email);
        return basicUser;
      }

      console.log('User profile found:', data.email);
      return data;
    } catch (error) {
      console.error('Unexpected error in getCurrentUser:', error);
      // Return null on unexpected errors
      return null;
    }
  },

  // Get session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(updates: Partial<User>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

