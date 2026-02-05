/**
 * Modern Contact Edit Screen
 * Updated to use ModernInput and PrimaryButton components
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
import { ModernInput } from '@/components/ui/ModernInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Chip } from '@/components/ui/Chip';
import { ModernLoader } from '@/components/ui/ModernLoader';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import shadows from '../../theme/shadows';

export default function ModernContactEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { contacts, createContact, updateContact, isCreating, isUpdating } = useContacts();
  const { designations } = useDesignations();
  const { categories } = useCategories();
  const isEditing = id && id !== 'new';

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (existingContact) {
      setContact({
        ...existingContact,
        phones: existingContact.phones || [{ phone_number: '', label: 'mobile', is_primary: true }],
        emails: existingContact.emails || [{ email: '', label: 'work', is_primary: true }],
      });
    }
  }, [existingContact]);

  const handleSave = async () => {
    const validationErrors = validateContact(contact);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    setErrors({});

    try {
      if (isEditing && existingContact) {
        await updateContact({ ...contact, id: existingContact.id });
      } else {
        await createContact(contact);
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save contact');
    }
  };

  const handlePhoneChange = (index: number, field: keyof ContactPhone, value: string) => {
    const newPhones = [...(contact.phones || [])];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setContact({ ...contact, phones: newPhones });
  };

  const handleEmailChange = (index: number, field: keyof ContactEmail, value: string) => {
    const newEmails = [...(contact.emails || [])];
    newEmails[index] = { ...newEmails[index], [field]: value };
    setContact({ ...contact, emails: newEmails });
  };

  const handleAddPhone = () => {
    setContact({
      ...contact,
      phones: [...(contact.phones || []), { phone_number: '', label: 'mobile', is_primary: false }],
    });
  };

  const handleAddEmail = () => {
    setContact({
      ...contact,
      emails: [...(contact.emails || []), { email: '', label: 'work', is_primary: false }],
    });
  };

  const handleRemovePhone = (index: number) => {
    const newPhones = contact.phones?.filter((_, i) => i !== index) || [];
    setContact({ ...contact, phones: newPhones.length > 0 ? newPhones : [{ phone_number: '', label: 'mobile', is_primary: true }] });
  };

  const handleRemoveEmail = (index: number) => {
    const newEmails = contact.emails?.filter((_, i) => i !== index) || [];
    setContact({ ...contact, emails: newEmails.length > 0 ? newEmails : [{ email: '', label: 'work', is_primary: true }] });
  };

  if (isCreating || isUpdating) {
    return (
      <ModernLoader
        visible={true}
        overlay={true}
        message={isEditing ? 'Updating contact...' : 'Creating contact...'}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ModernInput
          label="Full Name"
          placeholder="Enter full name"
          value={contact.name}
          onChangeText={(text) => setContact({ ...contact, name: text })}
          error={errors.name}
          leftIcon="user"
          isRequired
          containerStyle={styles.input}
        />

        <ModernInput
          label="Company"
          placeholder="Enter company name"
          value={contact.company || ''}
          onChangeText={(text) => setContact({ ...contact, company: text })}
          error={errors.company}
          leftIcon="building"
          containerStyle={styles.input}
        />

        {contact.phones?.map((phone, index) => (
          <View key={index} style={styles.phoneRow}>
            <ModernInput
              label={index === 0 ? 'Phone Number' : `Phone ${index + 1}`}
              placeholder="Enter phone number"
              value={phone.phone_number}
              onChangeText={(text) => handlePhoneChange(index, 'phone_number', text)}
              keyboardType="phone-pad"
              leftIcon="phone"
              containerStyle={styles.input}
              rightIcon={
                contact.phones!.length > 1 ? (
                  <TouchableOpacity onPress={() => handleRemovePhone(index)}>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                ) : undefined
              }
            />
          </View>
        ))}

        <PrimaryButton
          title="Add Phone Number"
          onPress={handleAddPhone}
          variant="outline"
          size="sm"
          leftIcon={
            <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
          }
          style={styles.addButton}
        />

        {contact.emails?.map((email, index) => (
          <View key={index} style={styles.emailRow}>
            <ModernInput
              label={index === 0 ? 'Email Address' : `Email ${index + 1}`}
              placeholder="Enter email address"
              value={email.email}
              onChangeText={(text) => handleEmailChange(index, 'email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="email"
              containerStyle={styles.input}
              rightIcon={
                contact.emails!.length > 1 ? (
                  <TouchableOpacity onPress={() => handleRemoveEmail(index)}>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                ) : undefined
              }
            />
          </View>
        ))}

        <PrimaryButton
          title="Add Email Address"
          onPress={handleAddEmail}
          variant="outline"
          size="sm"
          leftIcon={
            <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
          }
          style={styles.addButton}
        />

        <ModernInput
          label="Address"
          placeholder="Enter address"
          value={contact.address || ''}
          onChangeText={(text) => setContact({ ...contact, address: text })}
          leftIcon="map-marker"
          multiline
          numberOfLines={3}
          containerStyle={styles.input}
        />

        <ModernInput
          label="Website"
          placeholder="https://example.com"
          value={contact.website || ''}
          onChangeText={(text) => setContact({ ...contact, website: text })}
          keyboardType="url"
          autoCapitalize="none"
          leftIcon="web"
          containerStyle={styles.input}
        />

        <ModernInput
          label="Birthday"
          placeholder="YYYY-MM-DD"
          value={contact.birthday || ''}
          onChangeText={(text) => setContact({ ...contact, birthday: text })}
          leftIcon="cake"
          containerStyle={styles.input}
        />

        <ModernInput
          label="Notes"
          placeholder="Add notes about this contact"
          value={contact.notes || ''}
          onChangeText={(text) => setContact({ ...contact, notes: text })}
          multiline
          numberOfLines={4}
          leftIcon="note-text"
          containerStyle={styles.input}
        />

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isEditing ? 'Update Contact' : 'Create Contact'}
            onPress={handleSave}
            loading={isCreating || isUpdating}
            fullWidth
            leftIcon={
              <MaterialCommunityIcons
                name={isEditing ? 'check' : 'plus'}
                size={20}
                color={colors.textInverse}
              />
            }
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  input: {
    marginBottom: 20,
  },
  phoneRow: {
    marginBottom: 12,
  },
  emailRow: {
    marginBottom: 12,
  },
  addButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    ...shadows.md,
  },
});

