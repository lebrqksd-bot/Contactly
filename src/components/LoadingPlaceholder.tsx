import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { Skeleton } from '@/components/ui/Skeleton';
import { theme } from '@/theme';

export const LoadingPlaceholder: React.FC = () => {
  return (
    <View style={styles.container}>
      {[...Array(6)].map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton width={48} height={48} borderRadius={theme.borderRadius.round} />
          <View style={styles.textContainer}>
            <Skeleton width={150} height={16} borderRadius={theme.borderRadius.xs} />
            <View style={{ height: theme.spacing.xs }} />
            <Skeleton width={100} height={14} borderRadius={theme.borderRadius.xs} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
});

