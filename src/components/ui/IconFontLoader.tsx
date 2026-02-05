/**
 * IconFontLoader Component
 * Ensures all Expo Vector Icon fonts are loaded before app renders
 * Works for both web and native platforms
 */

import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons, Ionicons, FontAwesome, Feather, AntDesign, Entypo, MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface IconFontLoaderProps {
  children: React.ReactNode;
}

export const IconFontLoader: React.FC<IconFontLoaderProps> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [webFontsReady, setWebFontsReady] = useState(false);

  // Load all icon fonts using expo-font
  const [loaded] = useFonts({
    ...MaterialCommunityIcons.font,
    ...Ionicons.font,
    ...FontAwesome.font,
    ...Feather.font,
    ...AntDesign.font,
    ...Entypo.font,
    ...MaterialIcons.font,
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // For web, ensure fonts are loaded via CDN as fallback
      const loadWebFonts = () => {
        // Check if MaterialCommunityIcons font is available
        const testElement = document.createElement('span');
        testElement.style.fontFamily = 'MaterialCommunityIcons';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.textContent = '\uE000'; // First icon character
        document.body.appendChild(testElement);

        // Check font availability
        const isFontLoaded = () => {
          const computedStyle = window.getComputedStyle(testElement);
          const fontFamily = computedStyle.fontFamily;
          document.body.removeChild(testElement);
          
          // If font is not loaded, wait a bit more
          if (!fontFamily.includes('MaterialCommunityIcons')) {
            setTimeout(() => {
              setWebFontsReady(true);
            }, 500);
          } else {
            setWebFontsReady(true);
          }
        };

        // Wait for fonts to load
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            setTimeout(isFontLoaded, 100);
          });
        } else {
          setTimeout(isFontLoaded, 500);
        }
      };

      // Load fonts immediately
      loadWebFonts();
    } else {
      // For native, fonts are loaded via expo-font
      setWebFontsReady(true);
    }
  }, []);

  useEffect(() => {
    // Set fonts as loaded when both native and web fonts are ready
    if (loaded && webFontsReady) {
      setFontsLoaded(true);
    }
  }, [loaded, webFontsReady]);

  // Show loader while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
  loadingText: {
    marginTop: 16,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
});

export default IconFontLoader;

