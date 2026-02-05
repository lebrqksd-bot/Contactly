import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Checkbox, Card, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { deviceContactsService } from '@/services/deviceContacts';
import { Contact } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { contactsService } from '@/services/contacts';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';

export default function DeviceContactImportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [deviceContacts, setDeviceContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDeviceContacts();
  }, []);

  const loadDeviceContacts = async () => {
    try {
      setLoading(true);
      const contacts = await deviceContactsService.getAll();
      setDeviceContacts(contacts);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load device contacts');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id!)));
    }
  };

  const handleImport = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Error', 'Please select at least one contact to import');
      return;
    }

    try {
      setImporting(true);
      const contactsToImport = filteredContacts.filter(c => selectedContacts.has(c.id!));
      let successCount = 0;
      let duplicateCount = 0;

      for (const contact of contactsToImport) {
        try {
          // Check for duplicates
          const existing = await contactsService.getAll(user!.id);
          const normalizedPhones = contact.phones?.map(
            (p) => p.normalized_phone || p.phone_number
          ) || [];

          const isDuplicate = existing.some((existingContact) =>
            existingContact.phones?.some((p) =>
              normalizedPhones.includes(p.normalized_phone || p.phone_number)
            )
          );

          if (!isDuplicate) {
            await contactsService.create({
              ...contact,
              user_id: user!.id,
            });
            successCount++;
          } else {
            duplicateCount++;
          }
        } catch (error) {
          console.error('Error importing contact:', error);
        }
      }

      Alert.alert(
        'Import Complete',
        `Imported ${successCount} contacts${duplicateCount > 0 ? `, ${duplicateCount} duplicates skipped` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to import contacts');
    } finally {
      setImporting(false);
    }
  };

  const filteredContacts = deviceContacts.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.phones?.some((p) => p.phone_number.includes(query)) ||
      contact.emails?.some((e) => e.email.toLowerCase().includes(query)) ||
      contact.company?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <Loader visible={true} message="Loading device contacts..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search contacts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.headerActions}>
          <Button
            mode="text"
            onPress={toggleSelectAll}
            style={styles.selectAllButton}
          >
            {selectedContacts.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Text style={styles.selectedCount}>
            {selectedContacts.size} selected
          </Text>
        </View>
      </View>

      <ScrollView style={styles.list}>
        {filteredContacts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        ) : (
          filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              style={styles.contactCard}
              onPress={() => toggleSelect(contact.id!)}
            >
              <Card.Content style={styles.cardContent}>
                <Checkbox
                  status={selectedContacts.has(contact.id!) ? 'checked' : 'unchecked'}
                  onPress={() => toggleSelect(contact.id!)}
                />
                <Avatar
                  uri={contact.profile_image_url}
                  label={contact.name}
                  size={48}
                />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.phones && contact.phones.length > 0 && (
                    <Text style={styles.contactPhone}>
                      {contact.phones[0].phone_number}
                    </Text>
                  )}
                  {contact.company && (
                    <Text style={styles.contactCompany}>{contact.company}</Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {selectedContacts.size > 0 && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleImport}
            loading={importing}
            style={styles.importButton}
          >
            Import {selectedContacts.size} Contact{selectedContacts.size !== 1 ? 's' : ''}
          </Button>
        </View>
      )}
    </View>
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
  searchbar: {
    marginBottom: theme.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  selectAllButton: {
    marginLeft: -theme.spacing.sm,
  },
  selectedCount: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
  },
  list: {
    flex: 1,
  },
  contactCard: {
    margin: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  contactPhone: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  contactCompany: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  importButton: {
    ...theme.shadows.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
});

