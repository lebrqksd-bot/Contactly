import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, SectionList, RefreshControl } from 'react-native';
import { FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { ContactRow } from '@/components/contacts/ContactRow';
import { SearchBar } from '@/components/contacts/SearchBar';
import { CategoryFilter } from '@/components/contacts/CategoryFilter';
import { ContactListSkeleton } from '@/components/contacts/ContactListSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ContactFilter, Contact } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/theme';
import { strings } from '@/constants/strings';
import { Text } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  // Memoize filter object to prevent unnecessary re-renders
  const filter = useMemo<ContactFilter>(() => ({
    type: 'all',
    search: searchQuery || undefined,
    category: selectedCategory,
  }), [searchQuery, selectedCategory]);

  const { contacts = [], isLoading = true, refetch, error } = useContacts(filter);
  const [refreshing, setRefreshing] = useState(false);

  // Group contacts by first letter and separate favorites
  const groupedContacts = useMemo(() => {
    const favorites: Contact[] = [];
    const regular: { [key: string]: Contact[] } = {};

    contacts.forEach((contact) => {
      // Check if contact is favorite (you can add a favorite field to Contact type)
      const isFavorite = contact.categories?.includes('favorite') || false;
      
      if (isFavorite) {
        favorites.push(contact);
      } else {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!/[A-Z]/.test(firstLetter)) {
          // Non-alphabetic names go to '#'
          if (!regular['#']) regular['#'] = [];
          regular['#'].push(contact);
        } else {
          if (!regular[firstLetter]) regular[firstLetter] = [];
          regular[firstLetter].push(contact);
        }
      }
    });

    // Sort regular contacts by letter
    const sortedLetters = Object.keys(regular).sort();
    
    // Create sections for SectionList
    const sections: Array<{ title: string; data: Contact[] }> = [];
    
    if (favorites.length > 0) {
      sections.push({ title: 'Favourites', data: favorites });
    }
    
    sortedLetters.forEach((letter) => {
      sections.push({ title: letter, data: regular[letter] });
    });

    return sections;
  }, [contacts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);


  const handleContactPress = useCallback((contactId: string) => {
    router.push(`/contact/${contactId}`);
  }, [router]);

  const handleAddContact = useCallback(() => {
    router.push('/contact/new');
  }, [router]);

  if (isLoading && contacts.length === 0) {
    return (
      <View style={styles.container}>
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <ContactListSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineIndicator />
      <SearchBar onSearch={handleSearch} />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      {contacts.length === 0 ? (
        <EmptyState
          icon="account-off-outline"
          title={strings.contacts.noContacts}
          message={strings.contacts.noContactsMessage}
          actionLabel={strings.contacts.addContact}
          onAction={handleAddContact}
        />
      ) : (
        <SectionList
          sections={groupedContacts}
          keyExtractor={(item, index) => item.id || `contact-${item.name}-${index}`}
          renderItem={({ item, index }) => (
            <ContactRow
              contact={item}
              onPress={() => handleContactPress(item.id!)}
              index={index}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              {title === strings.contacts.favorites ? (
                <View style={styles.favoritesHeader}>
                  <MaterialCommunityIcons name="star" size={16} color={theme.colors.warning} />
                  <Text style={styles.sectionTitle}>{title}</Text>
                </View>
              ) : (
                <Text style={styles.sectionTitle}>{title}</Text>
              )}
            </View>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddContact}
        color={theme.colors.text.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  list: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.surface,
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    ...theme.shadows.lg,
  },
});

