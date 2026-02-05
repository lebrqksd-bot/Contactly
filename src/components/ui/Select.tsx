/**
 * Modern Select/Dropdown Component
 * User-friendly, responsive dropdown with search support
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  Platform,
  TextInput,
  ViewStyle,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface SelectOption {
  id: string | number;
  label: string;
  value: string | number;
  color?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | number;
  onValueChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  searchable?: boolean;
  multiLine?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onValueChange,
  error,
  required = false,
  disabled = false,
  containerStyle,
  searchable = true,
  multiLine = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchText.toLowerCase())
      )
    : options;

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setIsFocused(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFocused(false);
    setSearchText('');
    Animated.spring(scaleAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleSelect = (selectedValue: string | number) => {
    onValueChange(selectedValue);
    handleClose();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          error ? styles.selectButtonError : undefined,
          isFocused && !error ? styles.selectButtonFocused : undefined,
          disabled ? styles.selectButtonDisabled : undefined,
        ]}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.selectContent}>
          <View style={styles.selectTextContainer}>
            <Text
              style={[
                styles.selectText,
                !selectedOption && styles.selectPlaceholder,
                disabled && styles.selectTextDisabled,
              ]}
              numberOfLines={multiLine ? 2 : 1}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </Text>
          </View>

          {selectedOption && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                onValueChange('');
                setSearchText('');
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#9e9e9e"
              />
            </TouchableOpacity>
          )}

          <MaterialCommunityIcons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={error ? '#ff4d4d' : '#4A56E2'}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.modal,
              {
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
                opacity: scaleAnim,
              },
            ]}
          >
            {searchable && (
              <View style={styles.searchContainer}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color="#9e9e9e"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search options..."
                  placeholderTextColor="#9e9e9e"
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus
                />
                {searchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchText('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color="#9e9e9e"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <ScrollView
              style={styles.optionsList}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <TouchableOpacity
                    key={`${option.id}-${index}`}
                    style={[
                      styles.option,
                      value === option.value && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(option.value)}
                    activeOpacity={0.6}
                  >
                    {option.color && (
                      <View
                        style={[
                          styles.optionColorDot,
                          { backgroundColor: option.color },
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        value === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="#4A56E2"
                        style={styles.optionCheck}
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No options found</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalClose}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color="#1e1e1e"
              />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  required: {
    color: '#ff4d4d',
    fontWeight: '600',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1929',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    minHeight: 52,
  } as any,
  selectButtonFocused: {
    borderColor: '#4A56E2',
    backgroundColor: '#0D2137',
  },
  selectButtonError: {
    borderColor: '#ff4d4d',
    borderWidth: 1.5,
  },
  selectButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#0A1929',
  },
  selectContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  selectText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  selectPlaceholder: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  selectTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  clearButton: {
    marginRight: 8,
    padding: 4,
  },
  chevron: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ff4d4d',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: '70%',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#1e1e1e',
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  } as any,
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: {
    backgroundColor: '#f9f9fb',
  },
  optionColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#1e1e1e',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#4A56E2',
  },
  optionCheck: {
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9e9e9e',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
});

export default Select;
