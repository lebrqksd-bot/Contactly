import { Stack, useRouter } from 'expo-router';
import { QueryClientProvider } from 'react-query';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '@/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { 
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_600SemiBold, 
  Poppins_700Bold 
} from '@expo-google-fonts/poppins';
import { useEffect } from 'react';
import { MaterialCommunityIcons, Ionicons, FontAwesome, Feather, AntDesign, Entypo, MaterialIcons } from '@expo/vector-icons';
import { IconFontLoader } from '@/components/ui/IconFontLoader';
import { queryClient } from '@/utils/api';

export default function RootLayout() {
  // Load all icon fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    ...MaterialCommunityIcons.font,
    ...Ionicons.font,
    ...FontAwesome.font,
    ...Feather.font,
    ...AntDesign.font,
    ...Entypo.font,
    ...MaterialIcons.font,
  });

  // Ensure icons load on web - add CDN fallback for production
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Override fetch IMMEDIATELY to catch all font requests
      if (!(window as any).__fontFetchOverridden) {
        (window as any).__fontFetchOverridden = true;
        const originalFetch = window.fetch;
        window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
          let url: string;
          if (typeof input === 'string') {
            url = input;
          } else if (input instanceof URL) {
            url = input.toString();
          } else if (input instanceof Request) {
            url = input.url;
          } else {
            url = String(input);
          }
          
          // Font CDN map with fallbacks
          const fontCDNMap: Record<string, string> = {
            'MaterialCommunityIcons': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf',
            'Ionicons': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf',
            'FontAwesome': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf',
            'Feather': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Feather.ttf',
            'AntDesign': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf',
            'Entypo': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf',
            'MaterialIcons': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf',
          };
          
          // Redirect all icon font requests to CDN
          for (const fontName in fontCDNMap) {
            if (url.includes(fontName) && (url.includes('.ttf') || url.includes('font'))) {
              console.log('[Font Override] Redirecting ' + fontName + ' to CDN:', url);
              return originalFetch(fontCDNMap[fontName], {
                ...init,
                mode: 'cors',
                credentials: 'omit',
              } as RequestInit);
            }
          }
          
          // Ignore back-icon image requests
          if (url.includes('back-icon') && url.includes('.png')) {
            return Promise.resolve(new Response('', { status: 200, statusText: 'OK' }));
          }
          
          return originalFetch(input as RequestInfo, init);
        };
      }
      
      // Load font-face and preload
      const loadIcons = () => {
        if (typeof document === 'undefined') return;
        
        // Add @font-face declaration
        const existingStyle = document.querySelector('style[data-mci-fallback]');
        if (!existingStyle) {
          const style = document.createElement('style');
          style.setAttribute('data-mci-fallback', 'true');
          style.textContent = `
            @font-face {
              font-family: 'MaterialCommunityIcons';
              src: url('https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype'),
                   url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
            /* Force icon font to load for all icon elements */
            [class*="MaterialCommunityIcons"],
            [data-icon-family="MaterialCommunityIcons"],
            .material-community-icons {
              font-family: 'MaterialCommunityIcons' !important;
            }
          `;
          document.head.appendChild(style);
        }
        
        // Preload the font
        const existingLink = document.querySelector('link[data-mci-preload]');
        if (!existingLink) {
          const link = document.createElement('link');
          link.setAttribute('data-mci-preload', 'true');
          link.rel = 'preload';
          link.as = 'font';
          link.type = 'font/ttf';
          link.crossOrigin = 'anonymous';
          link.href = 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf';
          document.head.appendChild(link);
        }
      };
      
      // Load immediately if document is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadIcons);
      } else {
        loadIcons();
      }
      
      // Also try after a short delay as backup
      setTimeout(loadIcons, 50);
    }
  }, []);

  if (!fontsLoaded) {
    return null; // IconFontLoader will handle the loading screen
  }

  return (
    <IconFontLoader>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <PaperProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <Stack
                screenOptions={({ navigation, route }) => ({
                  headerStyle: {
                    backgroundColor: '#6200ee',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                  headerBackTitleVisible: false,
                  headerBackButtonMenuEnabled: false,
                  // Custom back button for web
                  headerLeft: Platform.OS === 'web' && navigation.canGoBack()
                    ? () => (
                        <TouchableOpacity
                          onPress={() => navigation.goBack()}
                          style={{ marginLeft: 16, padding: 8 }}
                        >
                          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                      )
                    : undefined,
                })}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="contact/[id]"
                  options={{ title: 'Contact Details' }}
                />
                <Stack.Screen
                  name="contact/new"
                  options={{ title: 'New Contact' }}
                />
                <Stack.Screen
                  name="contact/edit/[id]"
                  options={{ title: 'Edit Contact' }}
                />
                <Stack.Screen
                  name="contact/share/[id]"
                  options={{ title: 'Share Contact' }}
                />
                <Stack.Screen
                  name="device-import"
                  options={{ title: 'Import Device Contacts' }}
                />
                <Stack.Screen
                  name="categories"
                  options={{ title: 'Manage Categories' }}
                />
              </Stack>
              </AuthProvider>
            </QueryClientProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </IconFontLoader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

