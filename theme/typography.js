/**
 * Modern Typography System
 * Using Inter font family (loaded via web fonts)
 */

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'Poppins-Regular',
  android: 'Poppins-Regular',
  web: 'Poppins, sans-serif',
});

const fontFamilyMedium = Platform.select({
  ios: 'Poppins-Medium',
  android: 'Poppins-Medium',
  web: 'Poppins, sans-serif',
});

const fontFamilyBold = Platform.select({
  ios: 'Poppins-Bold',
  android: 'Poppins-Bold',
  web: 'Poppins, sans-serif',
});

const fontFamilySemiBold = Platform.select({
  ios: 'Poppins-SemiBold',
  android: 'Poppins-SemiBold',
  web: 'Poppins, sans-serif',
});

export const typography = {
  // Font families
  fontFamily: {
    regular: fontFamily,
    medium: fontFamilyMedium,
    semibold: fontFamilySemiBold,
    bold: fontFamilyBold,
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Predefined text styles
  heading: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fontFamilyBold,
    fontWeight: '700',
  },
  
  headingSmall: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fontFamilyBold,
    fontWeight: '700',
  },
  
  text: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamily,
    fontWeight: '400',
  },
  
  textMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamilyMedium,
    fontWeight: '500',
  },
  
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily,
    fontWeight: '400',
  },
  
  smallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamilyMedium,
    fontWeight: '500',
  },
  
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily,
    fontWeight: '400',
  },
};

export default typography;

