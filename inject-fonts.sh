#!/bin/bash
# Post-build hook to inject font interceptor into Expo-generated index.html

DIST_INDEX="./dist/index.html"

# Create the font interceptor script
FONT_INTERCEPTOR='<script>
  if (!window.__fontInterceptorActive) {
    window.__fontInterceptorActive = true;
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      let url = typeof input === "string" ? input : 
                input instanceof URL ? input.toString() : 
                input instanceof Request ? input.url : String(input);
      
      if (url.includes("/assets/node_modules/") && url.includes("vector-icons") && url.includes(".ttf")) {
        console.log("[Font Interceptor] Redirecting to CDN:", url);
        const fontNameMatch = url.match(/Fonts\/([^/?.]+)\.ttf/);
        const fontName = fontNameMatch ? fontNameMatch[1] : "MaterialCommunityIcons";
        const cdnUrl = "https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/" + fontName + ".ttf";
        return originalFetch(cdnUrl, { ...init, mode: "cors", credentials: "omit", cache: "force-cache" });
      }
      return originalFetch(input, init);
    };
  }
</script>'

# Insert the script right after opening <head> tag
sed -i '/<head>/a\    '"$FONT_INTERCEPTOR" "$DIST_INDEX"

echo "✅ Font interceptor injected into dist/index.html"
