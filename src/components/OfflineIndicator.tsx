import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Banner, Text } from 'react-native-paper';
import { useSync } from '@/hooks/useSync';

import { theme } from '@/theme';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useSync();

  if (isOnline) {
    return null;
  }

  return (
    <Banner
      visible={!isOnline}
      actions={[]}
      style={styles.banner}
      contentStyle={styles.content}
    >
      <Text variant="bodySmall" style={styles.text}>You're offline. Changes will sync when you're back online.</Text>
    </Banner>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.warning,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: theme.colors.text.inverse,
  },
});

