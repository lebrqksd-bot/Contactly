const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Reduce memory usage by limiting workers
config.maxWorkers = 2;

// Add transformer options to reduce memory pressure
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      reduce_funcs: false,
    },
  },
};

// Add web-specific resolver configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure font files are included in the asset bundle
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

// Provide web-compatible alternatives for native modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, use mock files for native-only modules
  if (platform === 'web') {
    if (moduleName === 'expo-contacts') {
      return {
        filePath: path.resolve(__dirname, 'web-mocks/expo-contacts.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'expo-sqlite') {
      return {
        filePath: path.resolve(__dirname, 'web-mocks/expo-sqlite.js'),
        type: 'sourceFile',
      };
    }
  }
  
  // Use default resolution for other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

