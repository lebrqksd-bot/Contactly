import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { theme } from '@/theme';

interface ContactRowProps {
  contact: {
    id?: string;
    name: string;
    profile_image_url?: string | null;
  };
  onPress: () => void;
  index?: number;
}

export const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  onPress,
  index = 0,
}) => {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(theme.animation.duration.normal)}
      exiting={FadeOut.duration(theme.animation.duration.fast)}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Avatar
          label={contact.name}
          uri={contact.profile_image_url}
          size={48}
        />
        <Text style={styles.name}>{contact.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
});

