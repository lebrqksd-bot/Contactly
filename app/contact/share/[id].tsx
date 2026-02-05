import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, Platform, Image } from 'react-native';
import { Text, Button, Card, SegmentedButtons } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { vcardUtils } from '@/utils/vcard';
import { qrcodeUtils } from '@/utils/qrcode';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { phoneUtils } from '@/utils/phone';
import { theme } from '@/theme';

export default function ShareContactScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts } = useContacts();
  const contact = contacts.find((c) => c.id === id);
  const [method, setMethod] = useState<'whatsapp' | 'sms' | 'email' | 'vcard' | 'qrcode'>('whatsapp');

  if (!contact) {
    return (
      <View style={styles.container}>
        <Text>Contact not found</Text>
      </View>
    );
  }

  const primaryPhone = contact.phones?.find((p) => p.is_primary) || contact.phones?.[0];

  const handleShareWhatsApp = () => {
    if (!primaryPhone) {
      Alert.alert('Error', 'No phone number available');
      return;
    }

    const message = `Contact: ${contact.name}\nPhone: ${phoneUtils.format(primaryPhone.phone_number)}`;
    const url = `whatsapp://send?phone=${primaryPhone.phone_number.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed');
    });
  };

  const handleShareSMS = () => {
    if (!primaryPhone) {
      Alert.alert('Error', 'No phone number available');
      return;
    }

    const message = `Contact: ${contact.name}\nPhone: ${phoneUtils.format(primaryPhone.phone_number)}`;
    Linking.openURL(`sms:${primaryPhone.phone_number}?body=${encodeURIComponent(message)}`);
  };

  const handleShareEmail = () => {
    const primaryEmail = contact.emails?.find((e) => e.is_primary) || contact.emails?.[0];
    if (!primaryEmail) {
      Alert.alert('Error', 'No email address available');
      return;
    }

    const subject = `Contact: ${contact.name}`;
    const body = `Name: ${contact.name}\nPhone: ${primaryPhone ? phoneUtils.format(primaryPhone.phone_number) : 'N/A'}\nEmail: ${primaryEmail.email}`;
    Linking.openURL(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleShareVCard = async () => {
    try {
      const vcardContent = vcardUtils.generate(contact);
      const fileUri = `${FileSystem.cacheDirectory}${contact.name.replace(/\s/g, '_')}_${Date.now()}.vcf`;

      await FileSystem.writeAsStringAsync(fileUri, vcardContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/vcard',
          dialogTitle: 'Share Contact',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share vCard');
    }
  };

  const handleShare = () => {
    switch (method) {
      case 'whatsapp':
        handleShareWhatsApp();
        break;
      case 'sms':
        handleShareSMS();
        break;
      case 'email':
        handleShareEmail();
        break;
      case 'vcard':
        handleShareVCard();
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.contactCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.contactName}>
              {contact.name}
            </Text>
            {primaryPhone && (
              <Text variant="bodyMedium" style={styles.contactInfo}>
                {phoneUtils.format(primaryPhone.phone_number)}
              </Text>
            )}
            {contact.emails && contact.emails.length > 0 && (
              <Text variant="bodyMedium" style={styles.contactInfo}>
                {contact.emails[0].email}
              </Text>
            )}
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Share Method
        </Text>

        <SegmentedButtons
          value={method}
          onValueChange={(value) => setMethod(value as typeof method)}
          buttons={[
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'sms', label: 'SMS' },
            { value: 'email', label: 'Email' },
            { value: 'vcard', label: 'vCard' },
            { value: 'qrcode', label: 'QR Code' },
          ]}
          style={styles.segmentedButtons}
        />

        {method === 'qrcode' ? (
          <View style={styles.qrContainer}>
            <Text variant="bodyMedium" style={styles.qrTitle}>
              Scan this QR code to add contact
            </Text>
            <View style={styles.qrCodeWrapper}>
              <Image
                source={{ uri: qrcodeUtils.generateContactQRCode(contact) }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            <Text variant="bodySmall" style={styles.qrHint}>
              Share this QR code or let others scan it to add this contact
            </Text>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={handleShare}
            style={styles.shareButton}
          >
            Share Contact
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  contactCard: {
    marginBottom: 24,
  },
  contactName: {
    fontWeight: '600',
    marginBottom: 8,
  },
  contactInfo: {
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  shareButton: {
    marginTop: 8,
  },
  qrContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  qrTitle: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  qrCodeWrapper: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  qrHint: {
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
});

