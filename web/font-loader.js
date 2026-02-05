/**
 * Font Loader Script
 * This script runs before React loads to intercept font requests
 * Place this in web/index.html before the app bundle
 */

(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  // Override fetch IMMEDIATELY to catch font requests
  if (!window.__fontFetchOverridden) {
    window.__fontFetchOverridden = true;
    const originalFetch = window.fetch;
    
    window.fetch = function(input, init) {
      let url = typeof input === 'string' ? input : 
                input instanceof URL ? input.toString() : 
                input instanceof Request ? input.url : String(input);
      
      // Font CDN map with fallbacks
      const fontCDNMap = {
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
          });
        }
      }
      
      // Ignore back-icon image requests
      if (url.includes('back-icon') && url.includes('.png')) {
        return Promise.resolve(new Response('', { status: 200, statusText: 'OK' }));
      }
      
      return originalFetch(input, init);
    };
  }
  
  // Also override XMLHttpRequest for older code paths
  if (!window.__xhrOverridden) {
    window.__xhrOverridden = true;
    const OriginalXHR = window.XMLHttpRequest;
    
    window.XMLHttpRequest = function() {
      const xhr = new OriginalXHR();
      const originalOpen = xhr.open;
      
      xhr.open = function(method, urlParam, ...args) {
        let url = urlParam;
        if (typeof url === 'string') {
          const fontCDNMap = {
            'MaterialCommunityIcons': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf',
            'Ionicons': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf',
            'FontAwesome': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf',
            'Feather': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Feather.ttf',
            'AntDesign': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf',
            'Entypo': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf',
            'MaterialIcons': 'https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf',
          };
          for (const fontName in fontCDNMap) {
            if (url.includes(fontName) && url.includes('.ttf')) {
              console.log('[XHR Override] Redirecting ' + fontName + ' to CDN:', url);
              url = fontCDNMap[fontName];
              break;
            }
          }
        }
        return originalOpen.call(this, method, url, ...args);
      };
      
      return xhr;
    };
  }
})();

