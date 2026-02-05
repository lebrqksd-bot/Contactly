import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { GradientText } from '@/components/ui/GradientText';
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/image/logo.jpeg')}
        style={styles.logo}
        resizeMode="contain"
        onError={(e) => {
          console.log('Logo image error:', e.nativeEvent.error);
        }}
      />
        <GradientText style={[styles.title, {fontSize: 24}]}> 
          {title}
        </GradientText>
      {message && (
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#121212',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  message: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
});

