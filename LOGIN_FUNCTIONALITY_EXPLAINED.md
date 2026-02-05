# Login Functionality - Complete Explanation

## Overview

Your Contactly app implements a **complete authentication system** using **Supabase Auth** with three different login methods. Here's how it all works:

---

## Architecture Overview

```
User Interface (AuthScreen)
    ↓
AuthContext (React Context)
    ↓
AuthService (Business Logic)
    ↓
Supabase Client (Backend)
    ↓
Supabase Database (PostgreSQL)
```

---

## Components Involved

### 1. **AuthScreen** (`src/screens/AuthScreen.tsx`)
- **Purpose**: User interface for authentication
- **Features**:
  - Three tabs: Sign In, Sign Up, OTP
  - Form validation
  - Error handling with alerts
  - Loading states

### 2. **AuthContext** (`src/context/AuthContext.tsx`)
- **Purpose**: Global state management for authentication
- **Features**:
  - Manages user state across the app
  - Provides auth methods to all components
  - Listens to auth state changes
  - Handles session persistence

### 3. **AuthService** (`src/services/auth.ts`)
- **Purpose**: Business logic layer for authentication
- **Features**:
  - All authentication methods
  - Error handling
  - User profile management

### 4. **Supabase Client** (`src/services/supabase.ts`)
- **Purpose**: Connection to Supabase backend
- **Features**:
  - Handles all API calls
  - Session management
  - Token refresh

---

## Three Authentication Methods

### Method 1: Email & Password Sign In

**Flow:**
1. User enters email and password
2. `handleSignIn()` is called
3. Calls `authService.signIn(email, password)`
4. Supabase authenticates the user
5. On success → Redirects to `/(tabs)` (main app)
6. On error → Shows error message

**Code Path:**
```
AuthScreen → handleSignIn()
  → AuthContext.signIn()
    → AuthService.signIn()
      → supabase.auth.signInWithPassword()
```

**Features:**
- ✅ Password-based authentication
- ✅ Session persistence (stored in AsyncStorage)
- ✅ Auto token refresh
- ✅ User-friendly error messages

---

### Method 2: Email & Password Sign Up

**Flow:**
1. User enters full name, email, and password
2. `handleSignUp()` is called
3. Calls `authService.signUp(email, password, fullName)`
4. Supabase creates auth user
5. Database trigger automatically creates user profile
6. Shows success message
7. Switches to Sign In tab

**Code Path:**
```
AuthScreen → handleSignUp()
  → AuthContext.signUp()
    → AuthService.signUp()
      → supabase.auth.signUp()
        → Database trigger creates user profile
```

**Features:**
- ✅ Creates user in Supabase Auth
- ✅ Automatically creates user profile (via database trigger)
- ✅ Stores full_name in user metadata
- ✅ Email confirmation support (if enabled)

**Database Integration:**
- When user signs up, a database trigger (`handle_new_user()`) automatically:
  - Creates a record in `public.users` table
  - Links it to the auth user
  - Stores email and full_name

---

### Method 3: OTP (One-Time Password) Login

**Flow:**
1. User enters email
2. Clicks "Send OTP"
3. `handleSendOTP()` sends OTP to email
4. User receives code in email
5. User enters OTP code
6. `handleVerifyOTP()` verifies the code
7. On success → Redirects to `/(tabs)`

**Code Path:**
```
Step 1: AuthScreen → handleSendOTP()
  → AuthContext.signInWithOTP()
    → AuthService.signInWithOTP()
      → supabase.auth.signInWithOtp()

Step 2: AuthScreen → handleVerifyOTP()
  → AuthContext.verifyOTP()
    → AuthService.verifyOTP()
      → supabase.auth.verifyOtp()
```

**Features:**
- ✅ Passwordless authentication
- ✅ More secure (no password to remember)
- ✅ Email-based verification
- ✅ Can create user automatically if doesn't exist

---

## Authentication State Management

### How User State is Managed

1. **Initial Load:**
   ```typescript
   useEffect(() => {
     loadUser(); // Check if user is already logged in
     // Listen to auth changes
   }, []);
   ```

2. **Auth State Listener:**
   - Listens to Supabase auth events
   - Updates user state automatically when:
     - User signs in
     - User signs out
     - Token is refreshed
     - Session expires

3. **Session Persistence:**
   - Uses AsyncStorage to store session
   - User stays logged in even after app restart
   - Session automatically restored on app load

---

## Navigation Flow

### App Entry Point (`app/index.tsx`)

```typescript
if (loading) → Show nothing (loading state)
if (user) → Redirect to /(tabs) (main app)
if (!user) → Redirect to /(auth) (login screen)
```

**Logic:**
- Checks if user is logged in
- Redirects to appropriate screen
- Handles loading state

---

## User Profile Management

### Getting Current User

```typescript
getCurrentUser():
  1. Gets auth user from Supabase
  2. Fetches user profile from database
  3. Returns combined user data
```

### Updating Profile

```typescript
updateProfile(updates):
  1. Gets current auth user
  2. Updates user record in database
  3. Returns updated user data
```

---

## Security Features

### 1. **Row Level Security (RLS)**
- Database policies ensure users can only access their own data
- Prevents unauthorized access

### 2. **Token Management**
- JWT tokens for authentication
- Automatic token refresh
- Secure storage in AsyncStorage

### 3. **Password Security**
- Passwords are hashed by Supabase
- Never stored in plain text
- Secure password validation

### 4. **Session Management**
- Sessions expire automatically
- Token refresh happens in background
- Secure session storage

---

## Error Handling

### User-Friendly Messages

- "Email not confirmed" → Clear message to check email
- "Invalid credentials" → Generic error for wrong password
- "Failed to sign in" → Fallback error message

### Error Flow

```
AuthService → Catches error
  → Throws with message
    → AuthContext → Catches error
      → AuthScreen → Shows Alert
```

---

## Database Integration

### User Profile Creation

When a user signs up:
1. Supabase Auth creates user in `auth.users`
2. Database trigger fires automatically
3. Creates record in `public.users` table
4. Links via user ID
5. Stores email and full_name

**No manual insert needed!** The trigger handles it.

---

## Complete Login Flow Example

### Sign In Flow:

```
1. User opens app
   ↓
2. app/index.tsx checks auth state
   ↓
3. No user found → Redirect to /(auth)
   ↓
4. User sees AuthScreen
   ↓
5. User enters email & password
   ↓
6. Clicks "Sign In"
   ↓
7. handleSignIn() called
   ↓
8. AuthContext.signIn() called
   ↓
9. AuthService.signIn() called
   ↓
10. Supabase authenticates
    ↓
11. Success → User state updated
    ↓
12. AuthContext.loadUser() fetches profile
    ↓
13. User state set in context
    ↓
14. app/index.tsx detects user
    ↓
15. Redirects to /(tabs) (main app)
```

---

## Key Features Summary

✅ **Three login methods**: Email/Password, Sign Up, OTP
✅ **Session persistence**: User stays logged in
✅ **Auto profile creation**: Database trigger handles it
✅ **Real-time auth updates**: Listens to auth state changes
✅ **Secure**: RLS, token management, password hashing
✅ **User-friendly**: Clear error messages, loading states
✅ **Global state**: AuthContext provides user state everywhere

---

## How to Use in Your Components

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <LoginPrompt />;
  
  return (
    <View>
      <Text>Welcome {user.full_name}!</Text>
      <Button onPress={signOut}>Sign Out</Button>
    </View>
  );
}
```

---

This is a **production-ready authentication system** with all the features you need! 🚀

