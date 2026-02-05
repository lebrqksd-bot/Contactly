import React from 'react';
import { Text, TextProps, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { theme } from '@/theme';

interface GradientTextProps extends TextProps {
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const GradientText: React.FC<GradientTextProps> = ({
  colors = ['#F1A475', '#FCD9B8', '#CC835A'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  children,
  ...props
}) => {
  if (Platform.OS === 'web') {
    // Web implementation using CSS gradient text
    return (
      <Text
        style={[
          style,
          {
            backgroundImage: `linear-gradient(93.26deg, ${colors[0]} 20%, ${colors[1]} 50%, ${colors[2]} 80%)`,
            // @ts-ignore
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          },
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }

  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]} {...props}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
      >
        <Text style={[style, { opacity: 0 }]} {...props}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};
