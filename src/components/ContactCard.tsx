import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Text, Avatar, Chip } from 'react-native-paper';
import { Contact } from '@/types';
import { phoneUtils } from '@/utils/phone';

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onPress }) => {
  const primaryPhone = contact.phones?.find((p) => p.is_primary) || contact.phones?.[0];
  const primaryEmail = contact.emails?.find((e) => e.is_primary) || contact.emails?.[0];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.content}>
          {contact.profile_image_url ? (
            <Image
              source={{ uri: contact.profile_image_url }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={56}
              label={contact.name.charAt(0).toUpperCase()}
              style={styles.avatar}
            />
          )}
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.name}>
              {contact.name}
            </Text>
            {contact.company && (
              <Text variant="bodySmall" style={styles.company}>
                {contact.company}
                {contact.designation?.name && ` • ${contact.designation.name}`}
              </Text>
            )}
            {primaryPhone && (
              <Text variant="bodySmall" style={styles.phone}>
                {phoneUtils.format(primaryPhone.phone_number)}
              </Text>
            )}
            {primaryEmail && (
              <Text variant="bodySmall" style={styles.email}>
                {primaryEmail.email}
              </Text>
            )}
            {contact.categories && contact.categories.length > 0 && (
              <View style={styles.categories}>
                {contact.categories.slice(0, 3).map((category, index) => (
                  <Chip key={index} style={styles.chip} textStyle={styles.chipText}>
                    {category}
                  </Chip>
                ))}
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 16,
    color: '#1a1a1a',
  },
  company: {
    color: '#666',
    marginBottom: 4,
    fontSize: 13,
  },
  phone: {
    color: '#6200ee',
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  email: {
    color: '#666',
    marginTop: 2,
    fontSize: 13,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  chip: {
    height: 24,
    marginRight: 4,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 10,
  },
});

