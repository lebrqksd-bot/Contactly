import { Platform } from 'react-native';

export const theme = {
  colors: {
    primary: '#F1A475',
    primaryDark: '#CC835A',
    primaryLight: '#FCD9B8',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    background: {
      default: '#00183d',
      surface: '#00183d', // Or slightly lighter if needed, but base is 00183d
      elevated: '#002a5c', // Lighter blue for elevated surfaces
      overlay: 'rgba(0, 24, 61, 0.8)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A2ADC4',
      disabled: 'rgba(255, 255, 255, 0.5)',
      inverse: '#00183d',
    },
    border: 'rgba(255, 255, 255, 0.1)',
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: {
      regular: Platform.select({
        ios: 'Poppins-Regular',
        android: 'Poppins-Regular',
        web: 'Poppins, sans-serif',
      }),
      medium: Platform.select({
        ios: 'Poppins-Medium',
        android: 'Poppins-Medium',
        web: 'Poppins, sans-serif',
      }),
      semibold: Platform.select({
        ios: 'Poppins-SemiBold',
        android: 'Poppins-SemiBold',
        web: 'Poppins, sans-serif',
      }),
      bold: Platform.select({
        ios: 'Poppins-Bold',
        android: 'Poppins-Bold',
        web: 'Poppins, sans-serif',
      }),
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 40,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
  },
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

export type Theme = typeof theme;

