import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { useDesignations } from '@/hooks/useDesignations';
import { useCategories } from '@/hooks/useCategories';
import { Contact, ContactPhone, ContactEmail } from '@/types';
import { validateContact } from '@/utils/validation';
import { storageService } from '@/services/storage';
import { useAuth } from '@/context/AuthContext';
import { phoneUtils } from '@/utils/phone';
import { ModernInput } from '@/components/ui/ModernInput';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';
import { strings } from '@/constants/strings';

export default function ContactEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { contacts, createContact, updateContact, isCreating, isUpdating } = useContacts();
  const { designations } = useDesignations();
  const { categories } = useCategories();
  const isEditing = id && id !== 'new';
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDesignationPicker, setShowDesignationPicker] = useState(false);

  const existingContact = isEditing ? contacts.find((c) => c.id === id) : null;

  const [contact, setContact] = useState<Contact>({
    name: '',
    company: '',
    phones: [{ phone_number: '', label: 'mobile', is_primary: true }],
    emails: [{ email: '', label: 'work', is_primary: true }],
    categories: [],
    tags: [],
    address: '',
    website: '',
    birthday: '',
    notes: '',
    local_updated_at: new Date().toISOString(),
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (existingContact) {
      setContact({
        ...existingContact,
        phones: existingContact.phones?.length
          ? existingContact.phones
          : [{ phone_number: '', label: 'mobile', is_primary: true }],
        emails: existingContact.emails?.length
          ? existingContact.emails
          : [{ email: '', label: 'work', is_primary: true }],
      });
    }
  }, [existingContact]);

  const handleSave = async () => {
    // Basic validation - only name is required
    if (!contact.name || contact.name.trim() === '') {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    // Filter out empty phones and emails before saving
    const phonesToSave = (contact.phones || []).filter(p => p.phone_number && p.phone_number.trim() !== '');
    const emailsToSave = (contact.emails || []).filter(e => e.email && e.email.trim() !== '');

    // Normalize phone numbers
    const normalizedPhones = phonesToSave.map(phone => ({
      ...phone,
      normalized_phone: phone.normalized_phone || phoneUtils.normalize(phone.phone_number),
    }));

    // Prepare contact data
    const contactToSave: Contact = {
      ...contact,
      phones: normalizedPhones.length > 0 ? normalizedPhones : [],
      emails: emailsToSave.length > 0 ? emailsToSave : [],
    };

    try {
      if (isEditing) {
        await updateContact(contactToSave);
      } else {
        await createContact({ ...contactToSave, user_id: user?.id });
      }
      router.back();
    } catch (error: any) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', error.message || 'Failed to save contact. Please try again.');
    }
  };

  const handleAddPhone = () => {
    setContact({
      ...contact,
      phones: [
        ...(contact.phones || []),
        { phone_number: '', label: 'mobile', is_primary: false },
      ],
    });
  };

  const handleRemovePhone = (index: number) => {
    const newPhones = contact.phones?.filter((_, i) => i !== index) || [];
    if (newPhones.length === 0) {
      newPhones.push({ phone_number: '', label: 'mobile', is_primary: true });
    }
    setContact({ ...contact, phones: newPhones });
  };

  const handlePhoneChange = (index: number, field: keyof ContactPhone, value: any) => {
    const newPhones = [...(contact.phones || [])];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setContact({ ...contact, phones: newPhones });
  };

  const handleAddEmail = () => {
    setContact({
      ...contact,
      emails: [
        ...(contact.emails || []),
        { email: '', label: 'work', is_primary: false },
      ],
    });
  };

  const handleRemoveEmail = (index: number) => {
    const newEmails = contact.emails?.filter((_, i) => i !== index) || [];
    if (newEmails.length === 0) {
      newEmails.push({ email: '', label: 'work', is_primary: true });
    }
    setContact({ ...contact, emails: newEmails });
  };

  const handleEmailChange = (index: number, field: keyof ContactEmail, value: any) => {
    const newEmails = [...(contact.emails || [])];
    newEmails[index] = { ...newEmails[index], [field]: value };
    setContact({ ...contact, emails: newEmails });
  };


  const handleRemoveCategory = (category: string) => {
    setContact({
      ...contact,
      categories: contact.categories?.filter((c) => c !== category) || [],
    });
  };

  const handlePickImage = async () => {
    try {
      setUploadingImage(true);
      const imageUri = await storageService.pickImage();
      if (imageUri && contact.id) {
        const publicUrl = await storageService.uploadImage(imageUri, contact.id);
        setContact({ ...contact, profile_image_url: publicUrl });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <ModernInput
          label="Name *"
          value={contact.name}
          onChangeText={(text) => setContact({ ...contact, name: text })}
          containerStyle={styles.input}
          leftIcon="user"
          isRequired
        />

        <ModernInput
          label="Company"
          value={contact.company || ''}
          onChangeText={(text) => setContact({ ...contact, company: text })}
          containerStyle={styles.input}
          leftIcon={<MaterialCommunityIcons name="office-building" size={20} color={theme.colors.text.secondary} />}
        />

        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDesignationPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.pickerText}>
            {contact.designation_id
              ? designations.find((d) => d.id === contact.designation_id)?.name || 'Select Designation'
              : 'Select Designation'}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phone Numbers</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPhone}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          {contact.phones?.map((phone, index) => (
            <View key={index} style={styles.phoneRow}>
              <ModernInput
                label={index === 0 ? "Phone Number" : `Phone ${index + 1}`}
                placeholder="Enter phone number"
                value={phone.phone_number}
                onChangeText={(text) => handlePhoneChange(index, 'phone_number', text)}
                keyboardType="phone-pad"
                containerStyle={styles.phoneInput}
                leftIcon="phone"
                rightIcon={
                  contact.phones!.length > 1 ? (
                    <TouchableOpacity onPress={() => handleRemovePhone(index)}>
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  ) : undefined
                }
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Email Addresses</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddEmail}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          {contact.emails?.map((email, index) => (
            <View key={index} style={styles.emailRow}>
              <ModernInput
                label={index === 0 ? "Email Address" : `Email ${index + 1}`}
                placeholder="Enter email address"
                value={email.email}
                onChangeText={(text) => handleEmailChange(index, 'email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={styles.emailInput}
                leftIcon="email"
                rightIcon={
                  contact.emails!.length > 1 ? (
                    <TouchableOpacity onPress={() => handleRemoveEmail(index)}>
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  ) : undefined
                }
              />
            </View>
          ))}
        </View>

        <ModernInput
          label="Address"
          value={contact.address || ''}
          onChangeText={(text: string) => setContact({ ...contact, address: text })}
          containerStyle={styles.input}
          multiline
          numberOfLines={3}
          leftIcon={<MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.text.secondary} />}
        />

        <ModernInput
          label="Website"
          value={contact.website || ''}
          onChangeText={(text: string) => setContact({ ...contact, website: text })}
          containerStyle={styles.input}
          keyboardType="url"
          autoCapitalize="none"
          placeholder="https://example.com"
          leftIcon={<MaterialCommunityIcons name="web" size={20} color={theme.colors.text.secondary} />}
        />

        <ModernInput
          label="Birthday (YYYY-MM-DD)"
          value={contact.birthday || ''}
          onChangeText={(text: string) => setContact({ ...contact, birthday: text })}
          containerStyle={styles.input}
          placeholder="2000-01-15"
          leftIcon={<MaterialCommunityIcons name="cake" size={20} color={theme.colors.text.secondary} />}
        />

        <ModernInput
          label="Tags (comma-separated)"
          value={contact.tags?.join(', ') || ''}
          onChangeText={(text: string) => {
            const tags = text.split(',').map((t: string) => t.trim()).filter(Boolean);
            setContact({ ...contact, tags });
          }}
          containerStyle={styles.input}
          placeholder="tag1, tag2, tag3"
          leftIcon={<MaterialCommunityIcons name="tag-multiple" size={20} color={theme.colors.text.secondary} />}
        />

        <ModernInput
          label="Notes"
          value={contact.notes || ''}
          onChangeText={(text: string) => setContact({ ...contact, notes: text })}
          containerStyle={styles.input}
          multiline
          numberOfLines={4}
          leftIcon={<MaterialCommunityIcons name="note-text" size={20} color={theme.colors.text.secondary} />}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCategoryPicker(true)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.categories}>
            {contact.categories?.map((category, index) => {
              const categoryData = categories.find(c => c.name === category);
              const chipStyle = categoryData 
                ? { ...styles.categoryChip, backgroundColor: categoryData.color + '20', borderColor: categoryData.color }
                : styles.categoryChip;
              return (
                <Chip
                  key={index}
                  label={category}
                  selected={true}
                  onPress={() => handleRemoveCategory(category)}
                  style={chipStyle}
                />
              );
            })}
          </View>
        </View>

        <Button
          title={contact.profile_image_url ? 'Change Profile Image' : 'Add Profile Image'}
          onPress={handlePickImage}
          loading={uploadingImage}
          variant="outline"
          style={styles.input}
          icon={
            <MaterialCommunityIcons
              name="image"
              size={20}
              color={theme.colors.primary}
            />
          }
        />

        <Button
          title={isEditing ? strings.actions.save : strings.contacts.addContact}
          onPress={handleSave}
          loading={isCreating || isUpdating}
          variant="primary"
          style={styles.saveButton}
          fullWidth
        />
      </View>

      {showCategoryPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Categories</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {categories.map((category) => {
                const isSelected = contact.categories?.includes(category.name);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      isSelected && styles.categoryOptionSelected,
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        handleRemoveCategory(category.name);
                      } else {
                        setContact({
                          ...contact,
                          categories: [...(contact.categories || []), category.name],
                        });
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.categoryColorDot,
                        { backgroundColor: category.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        isSelected && styles.categoryOptionTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Button
                title="Done"
                onPress={() => setShowCategoryPicker(false)}
                variant="primary"
                fullWidth
              />
            </View>
          </View>
        </View>
      )}

      {showDesignationPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Designation</Text>
              <TouchableOpacity onPress={() => setShowDesignationPicker(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity
                style={styles.designationOption}
                onPress={() => {
                  setContact({ ...contact, designation_id: undefined });
                  setShowDesignationPicker(false);
                }}
              >
                <Text style={styles.designationOptionText}>None</Text>
                {!contact.designation_id && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
              {designations.map((designation) => {
                const isSelected = contact.designation_id === designation.id;
                return (
                  <TouchableOpacity
                    key={designation.id}
                    style={[
                      styles.designationOption,
                      isSelected && styles.designationOptionSelected,
                    ]}
                    onPress={() => {
                      setContact({ ...contact, designation_id: designation.id });
                      setShowDesignationPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.designationOptionText,
                        isSelected && styles.designationOptionTextSelected,
                      ]}
                    >
                      {designation.name}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  form: {
    padding: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  addButton: {
    padding: theme.spacing.xs,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#0A1929',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: theme.spacing.lg,
    minHeight: 52,
  },
  pickerText: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#FFFFFF',
  },
  phoneRow: {
    marginBottom: theme.spacing.sm,
  },
  phoneInput: {
    flex: 1,
  },
  emailRow: {
    marginBottom: theme.spacing.sm,
  },
  emailInput: {
    flex: 1,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    borderWidth: 1,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: 'flex-end',
    zIndex: theme.zIndex.modalBackdrop,
  },
  modalContent: {
    backgroundColor: theme.colors.background.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  modalScroll: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    gap: theme.spacing.md,
  },
  categoryOptionSelected: {
    backgroundColor: theme.colors.background.elevated,
  },
  categoryColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryOptionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
  categoryOptionTextSelected: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  designationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  designationOptionSelected: {
    backgroundColor: theme.colors.background.elevated,
  },
  designationOptionText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
  designationOptionTextSelected: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  modalFooter: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
});

