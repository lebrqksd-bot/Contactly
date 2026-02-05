/**
 * ModernInput Component
 * Modern, user-friendly input field with floating label, icons, password toggle, and animations
 * Fully responsive and matches modern design standards
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import typography from '../../../theme/typography';

interface ModernInputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  isRequired?: boolean;
  leftIcon?: 'email' | 'lock' | 'user' | 'phone' | 'search' | React.ReactNode;
  rightIcon?: React.ReactNode;
  showClearButton?: boolean;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  icon,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  containerStyle,
  inputStyle,
  isRequired = false,
  leftIcon,
  rightIcon,
  showClearButton = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Animated values
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const errorAnim = useRef(new Animated.Value(error ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setHasValue(value.length > 0);
    Animated.timing(labelAnim, {
      toValue: value.length > 0 || isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, isFocused]);

  useEffect(() => {
    Animated.timing(errorAnim, {
      toValue: error ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [error]);

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  const getLeftIcon = () => {
    if (leftIcon) {
      if (typeof leftIcon === 'string') {
        const iconMap = {
          email: <MaterialCommunityIcons name="email-outline" size={20} color={isFocused ? colors.primary : colors.textLight} />,
          lock: <MaterialCommunityIcons name="lock-outline" size={20} color={isFocused ? colors.primary : colors.textLight} />,
          user: <MaterialCommunityIcons name="account-outline" size={20} color={isFocused ? colors.primary : colors.textLight} />,
          phone: <MaterialCommunityIcons name="phone-outline" size={20} color={isFocused ? colors.primary : colors.textLight} />,
          search: <MaterialCommunityIcons name="magnify" size={20} color={isFocused ? colors.primary : colors.textLight} />,
        };
        return iconMap[leftIcon as keyof typeof iconMap] || null;
      }
      return leftIcon;
    }
    return icon;
  };

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -8],
  });

  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textLight, isFocused ? colors.primary : colors.textDark],
  });

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.border, error ? colors.error : colors.primary],
  });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const errorOpacity = errorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View
        style={[
          styles.inputWrapper,
            {
              borderColor,
              borderWidth,
            },
          error && styles.inputWrapperError,
        ]}
      >
        {label && (
          <Animated.View
            style={[
              styles.labelContainer,
              {
                top: labelTop,
                transform: [{ scale: labelScale }],
              },
            ]}
            pointerEvents="none"
          >
            <Animated.Text
              style={[
                styles.label,
                {
                  color: labelColor,
                },
              ]}
            >
              {label}
              {isRequired && <Text style={styles.required}> *</Text>}
            </Animated.Text>
          </Animated.View>
        )}

        <View style={styles.inputContainer}>
          {getLeftIcon() && (
            <View style={styles.leftIconContainer}>
              {getLeftIcon()}
            </View>
          )}

          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || secureTextEntry || (showClearButton && hasValue)) && styles.inputWithRightIcon,
              inputStyle,
            ]}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isFocused || !label ? placeholder : ''}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            {...props}
          />

          <View style={styles.rightIconContainer}>
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            )}

            {showClearButton && hasValue && !secureTextEntry && (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            )}

            {rightIcon && <View style={styles.iconButton}>{rightIcon}</View>}
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.errorContainer,
          {
            opacity: errorOpacity,
            maxHeight: errorAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 50],
            }),
          },
        ]}
      >
        {error && (
          <Animated.Text style={[styles.errorText, { opacity: errorOpacity }]}>
            {error}
          </Animated.Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  inputWrapper: {
    borderRadius: 12,
    backgroundColor: '#0A1929',
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    transition: 'all 0.2s ease',
  },
  inputWrapperError: {
    borderColor: '#ff4d4d',
    borderWidth: 1.5,
  },
  labelContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    backgroundColor: '#0A1929',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  required: {
    color: '#ff4d4d',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 0,
    minHeight: 52,
    outlineStyle: 'none',
    outlineWidth: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  rightIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    justifyContent: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    marginTop: 8,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ff4d4d',
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default ModernInput;

