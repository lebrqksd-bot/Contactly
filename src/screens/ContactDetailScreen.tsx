import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useContacts } from '@/hooks/useContacts';
import { phoneUtils } from '@/utils/phone';
import { activitiesService } from '@/services/activities';
import { ProfileCardView } from '@/components/ProfileCardView';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';
import { strings } from '@/constants/strings';

export default function ContactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts, isLoading } = useContacts();
  const contact = contacts.find((c) => c.id === id);
  const [activityStats, setActivityStats] = useState<{
    total_calls: number;
    total_messages: number;
    total_emails: number;
    last_activity?: string;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (contact?.id) {
      setLoadingStats(true);
      activitiesService.getStats(contact.id)
        .then(setActivityStats)
        .catch(console.error)
        .finally(() => setLoadingStats(false));
    }
  }, [contact?.id]);

  if (isLoading) {
    return <Loader visible={true} message={strings.loading.loading} />;
  }

  if (!contact) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{strings.errors.notFound}</Text>
      </View>
    );
  }

  const handleCall = async (phone: string) => {
    if (contact?.id) {
      try {
        await activitiesService.logCall(contact.id, `Called ${phone}`);
      } catch (error) {
        console.error('Error logging call:', error);
      }
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = async (email: string) => {
    if (contact?.id) {
      try {
        await activitiesService.logEmail(contact.id, `Emailed ${email}`);
      } catch (error) {
        console.error('Error logging email:', error);
      }
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handleSMS = async (phone: string) => {
    if (contact?.id) {
      try {
        await activitiesService.logMessage(contact.id, `Sent SMS to ${phone}`);
      } catch (error) {
        console.error('Error logging message:', error);
      }
    }
    Linking.openURL(`sms:${phone}`);
  };

  const handleEdit = () => {
    router.push(`/contact/edit/${contact.id}`);
  };

  const handleShare = () => {
    router.push(`/contact/share/${contact.id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(theme.animation.duration.normal)}>
        <View style={styles.header}>
          <ProfileCardView user={{
            full_name: contact.name,
            email: contact.emails && contact.emails.length > 0 ? contact.emails[0].email : '',
            avatar_url: contact.profile_image_url,
            designation: contact.designation?.name || '',
            business: contact.company || '',
            education: contact.education || '',
            phone: contact.phones && contact.phones.length > 0 ? contact.phones[0].phone_number : '',
            created_at: contact.created_at || '',
          }} />
          {/* ...existing code for categories, etc. can be added below if needed ... */}
        </View>

        <View style={styles.divider} />

        {contact.phones && contact.phones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.contacts.phoneNumbers}</Text>
            {contact.phones.map((phone, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactItem}
                onPress={() => handleCall(phone.phone_number)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="phone"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactValue}>
                    {phoneUtils.format(phone.phone_number)}
                  </Text>
                  <Text style={styles.contactLabel}>{phone.label}</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {contact.emails && contact.emails.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.contacts.emails}</Text>
            {contact.emails.map((email, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactItem}
                onPress={() => handleEmail(email.email)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="email"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactValue}>{email.email}</Text>
                  <Text style={styles.contactLabel}>{email.label}</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {contact.website && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Website</Text>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => {
                const url = contact.website!.startsWith('http') 
                  ? contact.website 
                  : `https://${contact.website}`;
                Linking.openURL(url).catch(() => {
                  Alert.alert('Error', 'Could not open website');
                });
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="web"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.contactValue, { color: theme.colors.primary }]}>
                {contact.website}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {contact.birthday && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Birthday</Text>
            <View style={styles.contactItem}>
              <MaterialCommunityIcons
                name="cake"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.contactValue}>
                {new Date(contact.birthday).toLocaleDateString()}
                {(() => {
                  const today = new Date();
                  const birthDate = new Date(contact.birthday!);
                  const age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    return ` (Age: ${age - 1})`;
                  }
                  return ` (Age: ${age})`;
                })()}
              </Text>
            </View>
          </View>
        )}

        {contact.tags && contact.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.categories}>
              {contact.tags.map((tag, index) => (
                <Chip key={index} label={tag} variant="outline" size="sm" />
              ))}
            </View>
          </View>
        )}

        {contact.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.contacts.address}</Text>
            <View style={styles.contactItem}>
              <MaterialCommunityIcons
                name="map-marker"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.contactValue}>{contact.address}</Text>
            </View>
          </View>
        )}

        {contact.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.contacts.notes}</Text>
            <Text style={styles.notes}>{contact.notes}</Text>
          </View>
        )}

        {activityStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Insights</Text>
            <View style={styles.insightsContainer}>
              <View style={styles.insightItem}>
                <MaterialCommunityIcons
                  name="phone"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.insightLabel}>Calls</Text>
                <Text style={styles.insightValue}>{activityStats.total_calls}</Text>
              </View>
              <View style={styles.insightItem}>
                <MaterialCommunityIcons
                  name="message"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.insightLabel}>Messages</Text>
                <Text style={styles.insightValue}>{activityStats.total_messages}</Text>
              </View>
              <View style={styles.insightItem}>
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.insightLabel}>Emails</Text>
                <Text style={styles.insightValue}>{activityStats.total_emails}</Text>
              </View>
            </View>
            {activityStats.last_activity && (
              <Text style={styles.lastActivity}>
                Last activity: {new Date(activityStats.last_activity).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title={strings.actions.edit}
            onPress={handleEdit}
            variant="primary"
            icon={<MaterialCommunityIcons name="pencil" size={20} color={theme.colors.text.primary} />}
            style={styles.actionButton}
          />
          <Button
            title={strings.actions.share}
            onPress={handleShare}
            variant="outline"
            icon={<MaterialCommunityIcons name="share" size={20} color={theme.colors.primary} />}
            style={styles.actionButton}
          />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.surface,
  },
  name: {
    fontSize: theme.typography.fontSize.xxxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  company: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  designation: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.md,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  contactLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  notes: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  insightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  insightItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  insightLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  insightValue: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  lastActivity: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
