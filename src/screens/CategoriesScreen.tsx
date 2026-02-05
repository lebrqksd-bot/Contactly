import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCategories } from '@/hooks/useCategories';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Loader } from '@/components/ui/Loader';
import { Chip } from '@/components/ui/Chip';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, isLoading, createCategory, updateCategory, deleteCategory, isCreating } = useCategories();
  const [showDialog, setShowDialog] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const defaultCategories = categories.filter(c => c.is_default);
  const userCategories = categories.filter(c => !c.is_default);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    try {
      await createCategory({
        name: categoryName.trim(),
        color: '', // Will be auto-generated
        is_default: false,
      });
      setCategoryName('');
      setShowDialog(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? This will not remove the category from contacts, but you won't be able to use it for new contacts.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: any) => {
    return category.color || theme.colors.primary;
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Loader visible={true} message="Loading categories..." />
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Default Categories</Text>
            <Text style={styles.sectionDescription}>
              These categories are available to all users and cannot be deleted.
            </Text>
            <View style={styles.categoriesGrid}>
              {defaultCategories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: getCategoryColor(category) },
                    ]}
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Categories</Text>
              <Button
                mode="contained"
                onPress={() => setShowDialog(true)}
                style={styles.addButton}
                icon="plus"
              >
                Add Category
              </Button>
            </View>
            {userCategories.length === 0 ? (
              <Text style={styles.emptyText}>No custom categories yet. Create one to get started!</Text>
            ) : (
              <View style={styles.categoriesGrid}>
                {userCategories.map((category) => (
                  <View key={category.id} style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                      <View
                        style={[
                          styles.colorIndicator,
                          { backgroundColor: getCategoryColor(category) },
                        ]}
                      />
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    <View style={styles.categoryActions}>
                      <TouchableOpacity
                        onPress={() => handleDeleteCategory(category.id, category.name)}
                        style={styles.deleteButton}
                      >
                        <MaterialCommunityIcons
                          name="delete-outline"
                          size={20}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Create Category</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Category Name"
              value={categoryName}
              onChangeText={setCategoryName}
              mode="outlined"
              autoFocus
              onSubmitEditing={handleCreateCategory}
            />
            <Text style={styles.dialogHint}>
              A color will be automatically assigned to this category.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onPress={handleCreateCategory}
              loading={isCreating}
              mode="contained"
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    minWidth: 120,
    gap: theme.spacing.sm,
  },
  categoryCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    minWidth: 150,
    ...theme.shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  addButton: {
    marginLeft: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    padding: theme.spacing.xl,
  },
  dialogHint: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
});

