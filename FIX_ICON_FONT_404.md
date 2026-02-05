# Fix MaterialCommunityIcons 404 Error on Web

## Problem

The MaterialCommunityIcons font file is returning a 404 error on production web builds:
```
GET https://www.contactly.in/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.b62641afc9ab487008e996a5c5865e56.ttf
Status: 404 Not Found
```

## Solution

I've implemented multiple fixes to ensure icons load correctly:

### 1. CDN Fallback in HTML (web/index.html)
Added a `@font-face` declaration in the HTML head that loads the font from multiple CDN sources:
- unpkg.com (primary)
- jsdelivr.net (fallback)
- GitHub raw (backup)

### 2. Runtime Fallback in app/_layout.tsx
Added a `useEffect` hook that injects the font-face CSS at runtime if the bundled font fails to load.

### 3. Metro Config Update
Updated `metro.config.js` to include font file extensions (ttf, otf, woff, woff2) in the asset bundle.

## How It Works

1. **Development**: Fonts load from the bundled assets
2. **Production**: If bundled fonts fail, the CDN fallbacks automatically kick in
3. **Multiple Sources**: Three different CDN sources ensure high availability

## Testing

After deploying, check the browser console:
- If you see font loading errors, the CDN fallbacks should handle them
- Icons should display correctly even if the bundled font fails

## Alternative: Use Material Icons Web Font

If CDN fallbacks don't work, you can use Google's Material Icons web font instead:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
```

However, this requires changing all `MaterialCommunityIcons` to `MaterialIcons` throughout the app, which is not recommended.

## Current Status

✅ CDN fallbacks configured
✅ Runtime font injection added
✅ Metro config updated
✅ Multiple CDN sources for reliability

The icons should now load correctly on your production site!

