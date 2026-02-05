import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';
import { theme } from '@/theme';

export const ContactListSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={48} height={48} borderRadius={theme.borderRadius.round} />
          <View style={styles.textContainer}>
            <Skeleton width="60%" height={16} borderRadius={theme.borderRadius.xs} />
            <Skeleton width="40%" height={14} borderRadius={theme.borderRadius.xs} style={styles.secondLine} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  secondLine: {
    marginTop: theme.spacing.xs,
  },
});

