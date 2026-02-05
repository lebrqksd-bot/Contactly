import React from 'react';
import { StyleSheet, TextProps } from 'react-native';
import { GradientText } from './GradientText';
import { theme } from '@/theme';

export const SectionHeading: React.FC<TextProps> = ({ style, ...props }) => {
  return (
    <GradientText
      style={[styles.heading, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: theme.typography.fontFamily.bold,
  },
});
