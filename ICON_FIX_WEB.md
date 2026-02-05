# Fix Icons Not Loading on Web/Production

## Issue
MaterialCommunityIcons from @expo/vector-icons are not loading on the live server.

## Solution

### 1. Ensure Fonts are Bundled
The `@expo/vector-icons` package should automatically bundle fonts, but for web production builds, you may need to ensure they're included.

### 2. Build Command
When building for web, use:
```bash
npx expo export --platform web
```

### 3. Verify dist folder contains:
- Font files in `dist/_expo/static/js/web/` or similar
- All icon font files are included

### 4. If icons still don't load:

**Option A: Use CDN fallback (already added in _layout.tsx)**
The code now loads Material Icons from Google Fonts as a fallback.

**Option B: Ensure fonts are in public folder**
Copy font files to a public directory that's accessible:
```bash
cp node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/*.ttf public/fonts/
```

**Option C: Use react-native-paper icons instead**
React Native Paper has built-in icon support that works better on web.

### 5. Check Network Tab
In browser DevTools, check if font files are being requested and if they return 404 errors.

### 6. Vercel/Static Hosting
If deploying to Vercel or similar, ensure:
- Font files are included in the build
- No CORS issues with font loading
- Proper MIME types for .ttf files

## Current Implementation
- Font loading added in `app/_layout.tsx`
- Material Icons CDN fallback included
- Fonts should auto-load via @expo/vector-icons

## Testing
1. Build: `npm run build:web`
2. Check `dist` folder for font files
3. Test locally: `npx serve dist`
4. Verify icons appear correctly

