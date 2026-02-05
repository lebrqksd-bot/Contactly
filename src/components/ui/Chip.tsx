import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '@/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const chipStyle = [
    styles.chip,
    styles[`chip_${variant}`],
    styles[`chip_${size}`],
    selected && styles.chipSelected,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    selected && styles.textSelected,
  ];

  return (
    <TouchableOpacity
      style={chipStyle}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chip_default: {
    backgroundColor: theme.colors.background.elevated,
    borderColor: theme.colors.border,
  },
  chip_outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
  },
  chip_sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minHeight: 28,
  },
  chip_md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
  },
  text_default: {
    color: theme.colors.text.secondary,
  },
  text_outline: {
    color: theme.colors.primary,
  },
  text_sm: {
    fontSize: theme.typography.fontSize.xs,
  },
  text_md: {
    fontSize: theme.typography.fontSize.sm,
  },
  textSelected: {
    color: theme.colors.text.inverse,
  },
});

