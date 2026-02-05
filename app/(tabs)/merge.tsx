import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Checkbox, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContacts } from '@/hooks/useContacts';
import { mergeUtils } from '@/utils/merge';
import { MergeCandidate } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { theme } from '@/theme';
import { Loader } from '@/components/ui/Loader';

export default function MergeScreen() {
  const { contacts, updateContact, deleteContact, isLoading } = useContacts();
  const [duplicateGroups, setDuplicateGroups] = useState<MergeCandidate[][]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set());
  const [merging, setMerging] = useState(false);

  React.useEffect(() => {
    if (contacts.length > 0) {
      const groups = mergeUtils.findDuplicates(contacts);
      setDuplicateGroups(groups);
    }
  }, [contacts]);

  const handleSelectGroup = (index: number) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedGroups(newSelected);
  };

  const handleMergeSelected = async () => {
    if (selectedGroups.size === 0) {
      Alert.alert('Error', 'Please select contacts to merge');
      return;
    }

    setMerging(true);
    let successCount = 0;
    let errorCount = 0;
    let errorMessages: string[] = [];

    try {
      for (const groupIndex of selectedGroups) {
        const group = duplicateGroups[groupIndex];
        if (group.length < 2) {
          errorMessages.push(`Group ${groupIndex + 1}: Less than 2 contacts to merge.`);
          continue;
        }

        try {
          const merged = mergeUtils.merge(group.map((g) => g.contact));
          if (!group[0].contact.id) {
            errorMessages.push(`Group ${groupIndex + 1}: First contact missing ID.`);
            errorCount++;
            continue;
          }
          const contactsToDelete = group.slice(1).map((g) => g.contact.id).filter(Boolean);

          // Update first contact with merged data
          await updateContact({ ...merged, id: group[0].contact.id });

          // Delete other contacts
          for (const id of contactsToDelete) {
            if (!id) {
              errorMessages.push(`Group ${groupIndex + 1}: Contact to delete missing ID.`);
              continue;
            }
            await deleteContact(id);
          }
          successCount++;
        } catch (error: any) {
          console.error('Error merging group:', error);
          errorMessages.push(`Group ${groupIndex + 1}: ${error?.message || error}`);
          errorCount++;
        }
      }

      if (successCount > 0) {
        Alert.alert(
          'Merge Complete',
          `Successfully merged ${successCount} group(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}\n${errorMessages.join('\n')}`
        );
      } else {
        Alert.alert('Error', `Failed to merge contacts.\n${errorMessages.join('\n')}`);
      }
      setSelectedGroups(new Set());
    } finally {
      setMerging(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loader visible={true} message="Analyzing contacts for duplicates..." />
      </View>
    );
  }

  if (duplicateGroups.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No duplicates found"
          message="All your contacts are unique"
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Found {duplicateGroups.length} duplicate group(s)
        </Text>
        {selectedGroups.size > 0 && (
          <Button
            mode="contained"
            onPress={handleMergeSelected}
            loading={merging}
            disabled={merging}
            icon="merge"
            style={{paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignSelf: 'flex-end', marginTop: 8}}
          >
            Merge Selected ({selectedGroups.size})
          </Button>
        )}
      </View>

      {duplicateGroups.map((group, groupIndex) => (
        <Card key={groupIndex} style={styles.card}>
          <Card.Content>
            <View style={styles.groupHeader}>
              <Checkbox
                status={selectedGroups.has(groupIndex) ? 'checked' : 'unchecked'}
                onPress={() => handleSelectGroup(groupIndex)}
              />
              <Text variant="titleMedium" style={styles.groupTitle}>
                Group {groupIndex + 1} ({group.length} contacts)
              </Text>
            </View>

            {group.map((candidate, contactIndex) => (
              <View key={contactIndex} style={styles.contactItem}>
                <View style={styles.contactHeader}>
                  <Avatar
                    uri={candidate.contact.profile_image_url}
                    label={candidate.contact.name}
                    size={40}
                  />
                  <View style={styles.contactDetails}>
                    <Text variant="bodyLarge" style={styles.contactName}>
                      {candidate.contact.name}
                    </Text>
                    {candidate.contact.company && (
                      <Text variant="bodySmall" style={styles.contactCompany}>
                        {candidate.contact.company}
                      </Text>
                    )}
                    {candidate.contact.phones && candidate.contact.phones.length > 0 && (
                      <Text variant="bodySmall" style={styles.contactInfo}>
                        <MaterialCommunityIcons name="phone" size={12} color={theme.colors.text.secondary} />{' '}
                        {candidate.contact.phones[0].phone_number}
                      </Text>
                    )}
                  </View>
                </View>
                {candidate.reasons.length > 0 && (
                  <View style={styles.reasons}>
                    {candidate.reasons.map((reason, reasonIndex) => (
                      <Chip key={reasonIndex} style={styles.reasonChip}>
                        {reason}
                      </Chip>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  card: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background.surface,
    ...theme.shadows.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  groupTitle: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.text.primary,
  },
  contactItem: {
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  contactCompany: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  contactInfo: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  reasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  reasonChip: {
    height: 24,
  },
});

