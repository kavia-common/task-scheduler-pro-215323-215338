#!/bin/bash
# Settings Page Verification Script
# Run this to verify all Settings page functionality

echo "🔍 Verifying Settings Page Implementation..."
echo ""

# Check if files exist
echo "📁 Checking files..."
FILES=(
    "src/pages/Settings.js"
    "SETTINGS_ENHANCEMENT.md"
    "SETTINGS_USER_GUIDE.md"
    "CHANGELOG_SETTINGS.md"
    "IMPLEMENTATION_SUMMARY.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

echo ""
echo "🔨 Building application..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "  ✅ Build successful"
else
    echo "  ❌ Build failed"
    exit 1
fi

echo ""
echo "📊 Checking bundle sizes..."
if [ -f "build/static/js/main.*.js" ]; then
    JS_SIZE=$(du -h build/static/js/main.*.js | cut -f1)
    echo "  📦 JavaScript bundle: $JS_SIZE"
fi

if [ -f "build/static/css/main.*.css" ]; then
    CSS_SIZE=$(du -h build/static/css/main.*.css | cut -f1)
    echo "  🎨 CSS bundle: $CSS_SIZE"
fi

echo ""
echo "🔍 Checking for errors in code..."
ERRORS=$(grep -r "console.error\|throw new Error" src/pages/Settings.js | wc -l)
if [ $ERRORS -eq 0 ]; then
    echo "  ✅ No error calls in Settings.js"
else
    echo "  ⚠️  Found $ERRORS potential error calls"
fi

echo ""
echo "📝 Checking localStorage keys..."
KEYS=$(grep -o "localStorage\.\(get\|set\)Item(['\"][^'\"]*" src/pages/Settings.js | grep -o "['\"][^'\"]*" | tr -d "'\"" | sort -u)
echo "  Keys used:"
while IFS= read -r key; do
    echo "    - $key"
done <<< "$KEYS"

echo ""
echo "🎨 Checking CSS classes..."
CSS_CLASSES=$(grep -o "className=\"[^\"]*settings[^\"]*" src/pages/Settings.js | wc -l)
echo "  Settings-specific classes: $CSS_CLASSES"

echo ""
echo "♿ Checking accessibility features..."
ARIA_COUNT=$(grep -o "aria-[a-z]*=" src/pages/Settings.js | wc -l)
ROLE_COUNT=$(grep -o 'role="' src/pages/Settings.js | wc -l)
echo "  ARIA attributes: $ARIA_COUNT"
echo "  Role attributes: $ROLE_COUNT"

echo ""
echo "📱 Checking responsive breakpoints..."
BREAKPOINTS=$(grep -c "@media" src/App.css)
echo "  Media queries in CSS: $BREAKPOINTS"

echo ""
echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "  1. Start dev server: npm start"
echo "  2. Navigate to Settings (⚙️ gear icon)"
echo "  3. Test each tab:"
echo "     - General: Profile, Session Info, Account Actions"
echo "     - Appearance: Theme selector, Display options"
echo "     - Notifications: All notification settings"
echo "  4. Test responsiveness (resize browser)"
echo "  5. Test accessibility (keyboard navigation)"
echo ""
echo "📚 Documentation:"
echo "  - User guide: SETTINGS_USER_GUIDE.md"
echo "  - Technical docs: SETTINGS_ENHANCEMENT.md"
echo "  - Changelog: CHANGELOG_SETTINGS.md"
echo "  - Summary: IMPLEMENTATION_SUMMARY.md"
