import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const { user } = useAuth();

  // If user is logged in, redirect immediately
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // Show auth screen (AuthScreen will handle its own loading state)
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

