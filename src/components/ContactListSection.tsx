import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import { Contact } from '@/types';

interface ContactRowProps {
  contact: Contact;
  onPress: () => void;
}

// Generate consistent color for avatar based on name
export const getAvatarColor = (name: string): string => {
  const colors = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#F44336', // Red
    '#FF9800', // Orange
    '#00BCD4', // Cyan
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#E91E63', // Pink
    '#3F51B5', // Indigo
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const ContactRow: React.FC<ContactRowProps> = ({ contact, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.contactRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {contact.profile_image_url ? (
        <Image
          source={{ uri: contact.profile_image_url }}
          style={styles.avatar}
        />
      ) : (
        <Avatar.Text
          size={48}
          label={contact.name.charAt(0).toUpperCase()}
          style={[styles.avatar, { backgroundColor: getAvatarColor(contact.name) }]}
        />
      )}
      <Text style={styles.contactName}>{contact.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#121212',
  },
  avatar: {
    marginRight: 16,
    borderRadius: 24,
    width: 48,
    height: 48,
  },
  contactName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
});

