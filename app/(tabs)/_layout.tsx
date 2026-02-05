import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { theme } from '@/theme';

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          display: 'flex',
          height: 72,
          backgroundColor: theme.colors.background.default,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          elevation: 12,
          shadowColor: '#CC835A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
        },
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Contacts',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="contacts" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="merge"
        options={{
          title: 'Merge',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="merge" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="import-export"
        options={{
          title: 'Import/Export',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-export" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

