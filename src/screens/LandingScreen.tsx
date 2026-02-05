import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Platform, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

// Responsive dimensions
const getResponsiveDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isMobile = width < 768;
  const isSmallMobile = width < 400;
  const isLargeDesktop = width >= 1440;
  
  return {
    width,
    height,
    isTablet,
    isMobile,
    isSmallMobile,
    isLargeDesktop,
  };
};

interface LandingScreenProps {
  onGetStarted: () => void;
}

export default function LandingScreen({ onGetStarted }: LandingScreenProps) {
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());
  
  const { width, isTablet, isMobile, isSmallMobile } = dimensions;
  
  // Responsive animation distances
  const getTranslateDistance = (base: number) => {
    if (isSmallMobile) return base * 0.5;
    if (isMobile) return base * 0.7;
    if (isTablet) return base * 0.9;
    return base;
  };

  // Animation values for logo image (coming from bottom)
  const imageOpacity = useSharedValue(0);
  const imageTranslateY = useSharedValue(200); // Start 200px below

  // Animation values for Contactly text (coming from left)
  const contactlyTextOpacity = useSharedValue(0);
  const contactlyTextTranslateX = useSharedValue(-100); // Start from left

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimensions(getResponsiveDimensions());
    });
    return () => subscription?.remove();
  }, []);

  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);

  useEffect(() => {
    // Animate hero text first
    textOpacity.value = withTiming(1, { duration: 800 });

    // Animate logo image from bottom (smooth spring animation)
    imageOpacity.value = withDelay(400, withTiming(1, { duration: 1000 }));
    imageTranslateY.value = withDelay(400, withSpring(0, { damping: 15, stiffness: 100 }));

    // Animate Contactly text from left (smooth spring animation)
    contactlyTextOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    contactlyTextTranslateX.value = withDelay(600, withSpring(0, { damping: 15, stiffness: 100 }));

    // Animate button last
    buttonOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    buttonScale.value = withDelay(800, withSpring(1, { damping: 12, stiffness: 150 }));
  }, []);

  // Animated style for logo image (coming from bottom)
  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [
      { translateY: imageTranslateY.value },
    ],
  }));

  // Animated style for Contactly text (coming from left)
  const contactlyTextStyle = useAnimatedStyle(() => ({
    opacity: contactlyTextOpacity.value,
    transform: [
      { translateX: contactlyTextTranslateX.value },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  // Responsive styles
  const responsiveStyles = getResponsiveStyles(dimensions);

  return (
    <View style={[styles.container, responsiveStyles.container]}>
      {/* Hero Text - Positioned at top */}
      <Animated.View style={[styles.textContainer, responsiveStyles.textContainer, textStyle]}>
        <Text style={[styles.heroText, responsiveStyles.heroText]}>
          Your contacts,
        </Text>
        <Text style={[styles.heroText, responsiveStyles.heroText]}>
          organized and
        </Text>
        <Text style={[styles.heroTextHighlight, responsiveStyles.heroTextHighlight]}>
          synced with <Text style={styles.workText}>Contactly.</Text>
        </Text>
      </Animated.View>

      {/* Main Content */}
      <View style={[styles.content, responsiveStyles.content]}>
        {/* Logo Image - Animates from bottom */}
        <Animated.View style={[styles.logoContainer, responsiveStyles.logoContainer, imageStyle]}>
          <Image
            source={require('@assets/image/logo.jpeg')}
            style={[styles.logoImage, responsiveStyles.logoImage]}
            resizeMode="cover"
          />
        </Animated.View>
        
        {/* Contactly Text - Animates from left, below the box */}
        <Animated.View style={[styles.contactlyTextContainer, contactlyTextStyle]}>
          <Text style={[styles.contactlyText, responsiveStyles.contactlyText]}>
            Contactly
          </Text>
        </Animated.View>
        
        {/* Powered by Text - Below Contactly */}
        <Text style={[styles.poweredByText, responsiveStyles.poweredByText]}>
          POWERED @ BRQ ASSOCIATES
        </Text>
      </View>

      {/* Get Started Button */}
      <Animated.View style={[styles.buttonContainer, responsiveStyles.buttonContainer, buttonStyle]}>
        <TouchableOpacity
          style={[styles.getStartedButton, responsiveStyles.getStartedButton]}
          onPress={onGetStarted}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, responsiveStyles.buttonText]}>Get started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Responsive style generator
const getResponsiveStyles = (dims: ReturnType<typeof getResponsiveDimensions>) => {
  const { width, height, isTablet, isMobile, isSmallMobile, isLargeDesktop } = dims;
  
  // Calculate responsive font sizes
  const getFontSize = (base: number) => {
    if (isSmallMobile) return base * 0.5;
    if (isMobile) return base * 0.65;
    if (isTablet) return base * 0.85;
    if (isLargeDesktop) return base * 1.1;
    return base;
  };

  // Calculate responsive spacing
  const getSpacing = (base: number) => {
    if (isSmallMobile) return base * 0.5;
    if (isMobile) return base * 0.7;
    if (isTablet) return base * 0.9;
    return base;
  };

  return StyleSheet.create({
    container: {
      paddingTop: isSmallMobile ? 10 : isMobile ? 20 : isTablet ? 40 : 50,
      paddingBottom: isSmallMobile ? 10 : isMobile ? 15 : isTablet ? 30 : 40,
      paddingHorizontal: isSmallMobile ? 16 : isMobile ? 20 : isTablet ? 32 : 48,
      minHeight: Platform.OS === 'web' ? '100vh' : height,
      maxHeight: Platform.OS === 'web' ? '100vh' : height,
    },
    content: {
      flexShrink: 1,
      maxWidth: isLargeDesktop ? 1400 : isTablet ? 1000 : '100%',
      paddingHorizontal: isSmallMobile ? 8 : isMobile ? 12 : 0,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: isSmallMobile ? 10 : isMobile ? 15 : isTablet ? 20 : 30,
    },
    textContainer: {
      marginTop: isSmallMobile ? 5 : isMobile ? 10 : isTablet ? 20 : 30,
      marginBottom: isSmallMobile ? 5 : isMobile ? 8 : isTablet ? 15 : 20,
      paddingHorizontal: isSmallMobile ? 16 : isMobile ? 20 : isTablet ? 32 : 48,
      width: '100%',
      alignSelf: 'flex-start',
      flexShrink: 1,
    },
    heroText: {
      fontSize: isSmallMobile ? 20 : isMobile ? 24 : isTablet ? 36 : 48,
      marginBottom: isSmallMobile ? 4 : isMobile ? 6 : isTablet ? 8 : 10,
      textAlign: 'left',
      lineHeight: isSmallMobile ? 26 : isMobile ? 30 : isTablet ? 44 : 56,
    },
    heroTextHighlight: {
      fontSize: isSmallMobile ? 20 : isMobile ? 24 : isTablet ? 36 : 48,
      textAlign: 'left',
      lineHeight: isSmallMobile ? 26 : isMobile ? 30 : isTablet ? 44 : 56,
    },
    poweredByText: {
      fontSize: isSmallMobile ? 10 : isMobile ? 12 : isTablet ? 14 : 16,
      color: '#FFFFFF',
      textAlign: 'center',
      marginTop: isSmallMobile ? 4 : isMobile ? 6 : isTablet ? 8 : 12,
      marginBottom: isSmallMobile ? 4 : isMobile ? 6 : isTablet ? 8 : 12,
      opacity: 0.8,
      textTransform: 'uppercase',
      fontFamily: Platform.OS === 'web' 
        ? 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        : undefined, // Use system default for iOS/Android
      fontWeight: '400',
      letterSpacing: 0.5,
      lineHeight: isSmallMobile ? 14 : isMobile ? 16 : isTablet ? 20 : 22,
      width: '100%',
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      flexShrink: 0,
    },
    logoImage: {
      width: isSmallMobile ? 120 : isMobile ? 140 : isTablet ? 180 : 200,
      height: isSmallMobile ? 120 : isMobile ? 140 : isTablet ? 180 : 200,
      borderRadius: isSmallMobile ? 20 : isMobile ? 24 : isTablet ? 28 : 32,
      overflow: 'hidden',
    },
    contactlyText: {
      fontSize: isSmallMobile ? 18 : isMobile ? 24 : isTablet ? 32 : 40,
      fontWeight: '700',
      color: '#4A148C', // Dark purple text
      marginTop: isSmallMobile ? 6 : isMobile ? 8 : isTablet ? 12 : 16,
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' 
        ? 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        : undefined, // Use system default for iOS/Android
      letterSpacing: -0.5,
      lineHeight: isSmallMobile ? 22 : isMobile ? 28 : isTablet ? 38 : 46,
    },
    buttonContainer: {
      maxWidth: isLargeDesktop ? 1400 : isTablet ? 1000 : '100%',
      paddingBottom: isSmallMobile ? 30 : isMobile ? 40 : isTablet ? 50 : 60,
      paddingTop: isSmallMobile ? 8 : isMobile ? 10 : isTablet ? 12 : 15,
      paddingHorizontal: isSmallMobile ? 8 : isMobile ? 12 : 0,
      flexShrink: 0,
      width: '100%',
    },
    getStartedButton: {
      borderRadius: isSmallMobile ? 10 : isMobile ? 12 : isTablet ? 14 : 16,
      paddingVertical: isSmallMobile ? 12 : isMobile ? 14 : isTablet ? 16 : 18,
      paddingHorizontal: isSmallMobile ? 24 : isMobile ? 32 : isTablet ? 40 : 44,
      maxWidth: isSmallMobile ? '100%' : isMobile ? '100%' : isTablet ? 380 : 400,
      minHeight: isSmallMobile ? 44 : isMobile ? 48 : 52,
    },
    buttonText: {
      fontSize: isSmallMobile ? 14 : isMobile ? 16 : isTablet ? 17 : 18,
    },
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C', // Dark purple background
    justifyContent: 'space-between',
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    flexShrink: 1,
  },
  textContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  heroText: {
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'left',
    fontFamily: Platform.OS === 'web' 
      ? 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      : undefined, // Use system default for iOS/Android
    letterSpacing: -0.5,
    lineHeight: 48,
  },
  heroTextHighlight: {
    fontWeight: '600',
    color: '#FFD700', // Golden yellow
    textAlign: 'left',
    fontFamily: Platform.OS === 'web' 
      ? 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      : undefined, // Use system default for iOS/Android
    letterSpacing: -0.5,
  },
  workText: {
    color: '#FFD700',
  },
  poweredByText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' 
      ? 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      : undefined, // Use system default for iOS/Android
    fontWeight: '400',
    letterSpacing: 0.5,
    opacity: 0.8,
    textTransform: 'uppercase',
    lineHeight: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logoImage: {
    width: 200,
    height: 200,
    borderRadius: 32,
    overflow: 'hidden',
  },
  contactlyTextContainer: {
    width: '100%',
    alignItems: 'center',
  },
  contactlyText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#4A148C', // Dark purple text
    marginTop: 24,
    fontFamily: Platform.OS === 'web' 
      ? 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      : undefined, // Use system default for iOS/Android
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 46,
  },
  buttonContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#4A148C',
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'web' 
      ? 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      : undefined, // Use system default for iOS/Android
  },
});

