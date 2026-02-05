import React from 'react';
import { View, StyleSheet, Image, ImageStyle } from 'react-native';
import { Avatar as PaperAvatar } from 'react-native-paper';
import { theme } from '@/theme';

interface AvatarProps {
  name?: string;
  uri?: string | null;
  imageUri?: string | null; // Deprecated, use uri
  label?: string; // Alternative to name
  size?: number;
  backgroundColor?: string;
}

const getAvatarColor = (name: string): string => {
  const colors = [
    '#4CAF50',
    '#2196F3',
    '#9C27B0',
    '#F44336',
    '#FF9800',
    '#00BCD4',
    '#795548',
    '#607D8B',
    '#E91E63',
    '#3F51B5',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  uri,
  imageUri,
  label,
  size = 48,
  backgroundColor,
}) => {
  const displayName = name || label || '?';
  const imageUrl = uri || imageUri;
  const color = backgroundColor || getAvatarColor(displayName);
  const initial = displayName.charAt(0).toUpperCase();

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
      />
    );
  }

  return (
    <PaperAvatar.Text
      size={size}
      label={initial}
      style={[styles.avatar, { backgroundColor: color }]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {},
  image: {
    borderWidth: 0,
  },
});

