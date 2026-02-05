/**
 * ModernLoader Component
 * Enhanced loader with Lottie animations and multiple display modes
 */

import React from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import colors from '../../../theme/colors';
import typography from '../../../theme/typography';

interface ModernLoaderProps {
  visible: boolean;
  message?: string;
  overlay?: boolean;
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'lottie';
  lottieSource?: any; // Lottie animation JSON
}

export const ModernLoader: React.FC<ModernLoaderProps> = ({
  visible,
  message,
  overlay = false,
  size = 'large',
  type = 'spinner',
  lottieSource,
}) => {
  if (!visible) return null;

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'medium':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'large';
    }
  };

  const renderLoader = () => {
    if (type === 'lottie' && lottieSource) {
      return (
        <LottieView
          source={lottieSource}
          autoPlay
          loop
          style={styles.lottie}
        />
      );
    }

    return (
      <ActivityIndicator
        size={getSpinnerSize()}
        color={colors.primary}
      />
    );
  };

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            {renderLoader()}
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      {renderLoader()}
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  lottie: {
    width: 120,
    height: 120,
  },
  message: {
    marginTop: 16,
    ...typography.textMedium,
    color: colors.textDark,
    textAlign: 'center',
  },
});

export default ModernLoader;

