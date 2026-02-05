/**
 * Modern Shadow System
 * iOS and Android compatible shadows
 */

import { Platform } from 'react-native';

const createShadow = (elevation, shadowOpacity = 0.1) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity,
      shadowRadius: elevation,
    };
  } else {
    return {
      elevation,
      shadowColor: '#000',
    };
  }
};

export const shadows = {
  // Small shadow - for cards, inputs
  sm: createShadow(2, 0.08),
  
  // Medium shadow - for buttons, elevated cards
  md: createShadow(4, 0.12),
  
  // Large shadow - for modals, dropdowns
  lg: createShadow(8, 0.16),
  
  // Extra large shadow - for overlays
  xl: createShadow(12, 0.2),
  
  // Custom shadows
  input: createShadow(1, 0.05),
  button: createShadow(3, 0.1),
  card: createShadow(2, 0.08),
  modal: createShadow(16, 0.24),
};

export default shadows;

