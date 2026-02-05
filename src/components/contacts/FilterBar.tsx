import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ContactFilter } from '@/types';
import { theme } from '@/theme';
import { strings } from '@/constants/strings';

interface FilterBarProps {
  selectedFilter: ContactFilter['type'];
  onFilterChange: (filter: ContactFilter['type']) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => onFilterChange('all')}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color={selectedFilter === 'all' ? theme.colors.primary : theme.colors.text.secondary}
          />
          <Text style={[
            styles.filterText,
            selectedFilter === 'all' && styles.filterTextSelected
          ]}>
            {strings.filters.all}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={selectedFilter === 'all' ? theme.colors.primary : theme.colors.text.secondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="checkbox-multiple-blank-outline" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="filter" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
  },
  filterTextSelected: {
    color: theme.colors.primary,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
});

