import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCategories } from '@/hooks/useCategories';
import { Chip } from '@/components/ui/Chip';
import { theme } from '@/theme';

interface CategoryFilterProps {
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.selectedChip,
          ]}
          onPress={() => onCategoryChange(undefined)}
        >
          <Text
            style={[
              styles.categoryText,
              !selectedCategory && styles.selectedText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.name && styles.selectedChip,
              { borderColor: category.color },
            ]}
            onPress={() => onCategoryChange(category.name)}
          >
            <View
              style={[styles.colorDot, { backgroundColor: category.color }]}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name && styles.selectedText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 9999, // 50% - fully circular
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.elevated,
    gap: theme.spacing.xs,
    minHeight: 36,
    minWidth: 36,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  selectedText: {
    color: theme.colors.text.inverse,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

