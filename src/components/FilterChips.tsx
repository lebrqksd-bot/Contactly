import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ContactFilter } from '@/types';

interface FilterChipsProps {
  selectedFilter: ContactFilter['type'];
  onFilterChange: (filter: ContactFilter['type']) => void;
}

const filters: { label: string; value: ContactFilter['type'] }[] = [
  { label: 'All contacts', value: 'all' },
  { label: 'Staff', value: 'staff' },
  { label: 'Company', value: 'company' },
  { label: 'Shared', value: 'shared' },
  { label: 'Recent', value: 'recent' },
];

export const FilterChips: React.FC<FilterChipsProps> = ({
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
            color={selectedFilter === 'all' ? '#2196F3' : '#9E9E9E'} 
          />
          <Text style={[
            styles.filterText,
            selectedFilter === 'all' && styles.filterTextSelected
          ]}>
            All contacts
          </Text>
          <MaterialCommunityIcons 
            name="chevron-down" 
            size={20} 
            color={selectedFilter === 'all' ? '#2196F3' : '#9E9E9E'} 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="checkbox-multiple-blank-outline" size={24} color="#9E9E9E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="filter" size={24} color="#9E9E9E" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  filterTextSelected: {
    color: '#2196F3',
  },
  iconButton: {
    padding: 4,
  },
});

