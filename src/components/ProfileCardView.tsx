import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Button } from '@/components/ui/Button';
import * as Sharing from 'expo-sharing';
import { Share, Platform } from 'react-native';

interface ProfileCardViewProps {
  user: any;
}

export const ProfileCardView: React.FC<ProfileCardViewProps> = ({ user }) => {
  const [showBack, setShowBack] = useState(false);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={() => setShowBack(!showBack)} style={styles.flipButton}>
        <MaterialCommunityIcons name="rotate-3d-variant" size={24} color={theme.colors.primary} />
        <Text style={styles.flipText}>{showBack ? 'Show Front' : 'Show Back'}</Text>
      </TouchableOpacity>
      <View style={[styles.card, showBack && styles.cardBack]}>
        {!showBack ? (
          <>
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            <Text style={styles.name}>{user.full_name}</Text>
            <Text style={styles.designation}>{user.designation}</Text>
            <Text style={styles.business}>{user.business}</Text>
            <Text style={styles.education}>{user.education}</Text>
          </>
        ) : (
          <>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user.phone || 'N/A'}</Text>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{user.created_at}</Text>
            <Button
              title="Share Card"
              onPress={async () => {
                const cardText = `Name: ${user.full_name}\nDesignation: ${user.designation}\nBusiness: ${user.business}\nEducation: ${user.education}\nEmail: ${user.email}\nPhone: ${user.phone || ''}`;
                if (Platform.OS === 'web') {
                  await navigator.clipboard.writeText(cardText);
                  alert('Profile card copied to clipboard!');
                } else {
                  try {
                    await Share.share({ message: cardText });
                  } catch (error) {
                    alert('Failed to share card');
                  }
                }
              }}
              style={styles.shareButton}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  card: {
    width: '95%',
    maxWidth: 400,
    minHeight: 220,
    borderRadius: 16,
    backgroundColor: theme.colors.background.surface,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignSelf: 'center',
  },
  cardBack: {
    backgroundColor: theme.colors.background.elevated,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
    alignSelf: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  designation: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  business: {
    fontSize: 15,
    color: theme.colors.text.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  education: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flipText: {
    marginLeft: 6,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  shareButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
});
