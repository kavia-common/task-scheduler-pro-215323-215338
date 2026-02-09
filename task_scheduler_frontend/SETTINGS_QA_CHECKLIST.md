# Settings Page - QA Testing Checklist

Use this checklist to manually verify all Settings page functionality.

## 🎯 Test Environment Setup

- [ ] Development server running (`npm start`)
- [ ] Browser DevTools open (Console + Application tabs)
- [ ] Multiple browser window sizes available
- [ ] Keyboard available for accessibility testing

---

## 📋 General Tab Testing

### Profile Information
- [ ] Display Name field is visible and editable
- [ ] Email field is visible and editable
- [ ] "Save Profile" button is visible
- [ ] Click "Save Profile" shows confirmation
- [ ] After save, refresh page and verify data persists
- [ ] Check localStorage in DevTools has `user_display_name` and `user_email`

### Session Information
- [ ] Login Time displays with proper format
- [ ] Session Duration shows and makes sense
- [ ] Last Activity timestamp is present
- [ ] Browser info displays
- [ ] Info cards have hover effect
- [ ] Grid layout adjusts on resize

### Account Actions
- [ ] "Clear Local Data" button visible
- [ ] Clicking "Clear Local Data" shows confirmation dialog
- [ ] Confirming clear shows alert message
- [ ] "Export Settings" button visible
- [ ] Clicking "Export Settings" downloads a JSON file
- [ ] Downloaded JSON contains expected data (profile, theme, notifications)

**Expected localStorage Keys:**
```
user_display_name
user_email
session_login_time
```

---

## 🎨 Appearance Tab Testing

### Theme Selector
- [ ] Three theme cards visible: Retro Dark, Retro Light, Neon Purple
- [ ] Retro Dark has "Active" badge
- [ ] Each card shows color preview
- [ ] Hover effect works on cards (elevation change)
- [ ] Clicking Retro Dark maintains active state
- [ ] Clicking Retro Light updates localStorage
- [ ] Clicking Neon Purple updates localStorage
- [ ] Check DevTools localStorage has `theme_mode` key

### Display Options
- [ ] "Enable animations" checkbox visible
- [ ] Checkbox state matches current setting
- [ ] Toggling animations ON/OFF works
- [ ] Disabling animations removes page transitions (test by clicking tabs)
- [ ] Re-enabling animations restores transitions
- [ ] "Compact mode" checkbox visible
- [ ] Compact mode toggle saves to localStorage

### Typography Preview
- [ ] H1 heading displays correctly
- [ ] H2 heading displays correctly
- [ ] H3 heading displays correctly
- [ ] Body text displays correctly
- [ ] Muted text displays correctly
- [ ] All text uses proper fonts and colors

### Color Palette
- [ ] Seven color swatches display
- [ ] Colors: Cyan, Blue, Pink, Lime, Success, Warning, Danger
- [ ] Each swatch has correct color
- [ ] Hover effect works (scale + elevation)
- [ ] Color names display below swatches

**Expected localStorage Keys:**
```
theme_mode (retro-dark | retro-light | neon-purple)
animations_enabled (true | false)
compact_mode (true | false)
```

---

## 🔔 Notifications Tab Testing

### Basic Functionality
- [ ] "Enable notifications" checkbox works
- [ ] "Play alarm sound" checkbox works
- [ ] "Play alarm sound" disabled when notifications off
- [ ] "Loop alarm sound" checkbox works
- [ ] "Loop alarm sound" disabled appropriately
- [ ] "Desktop notifications" checkbox works
- [ ] "Desktop notifications" disabled when notifications off

### Desktop Notifications
- [ ] Permission status displays correctly
- [ ] If "Not yet requested", shows "Request Permission" button
- [ ] Clicking "Request Permission" shows browser prompt
- [ ] After granting, status shows "✅ Granted"
- [ ] After denying, status shows "🚫 Blocked"
- [ ] Help text displays for each permission state

### Notification Timing
- [ ] "Notify before due time" input visible
- [ ] Can enter number values
- [ ] Min/max validation works (0-60)
- [ ] Disabled when notifications off
- [ ] Info box below shows example calculation

### Test Alarm
- [ ] "Test alarm sound" button visible
- [ ] Button disabled when notifications or sound off
- [ ] Clicking plays sound for ~3 seconds
- [ ] Sound stops automatically
- [ ] Hint text displays

### Save/Cancel
- [ ] "Cancel" button returns to dashboard
- [ ] "Save settings" button works
- [ ] After save, settings persist on page reload

---

## 🎭 Navigation Testing

### Tab Switching
- [ ] General tab button works
- [ ] Appearance tab button works
- [ ] Notifications tab button works
- [ ] Active tab has visual indicator (cyan highlight)
- [ ] Tab content switches correctly
- [ ] No console errors when switching tabs

### Back Button
- [ ] "← Back" button visible in header
- [ ] Clicking returns to dashboard
- [ ] No data lost on navigation
- [ ] Can return to Settings and see saved data

---

## 📱 Responsive Design Testing

### Desktop (>980px)
- [ ] Sidebar navigation on left
- [ ] Content area on right
- [ ] Both visible simultaneously
- [ ] Grid layouts use multiple columns
- [ ] Theme cards in 2-3 column grid
- [ ] Info grid shows 2x2 layout

### Tablet (560px - 980px)
- [ ] Sidebar stacks above content
- [ ] Tabs switch to horizontal layout
- [ ] Theme cards stack to single column
- [ ] Info grid stacks to 2 columns
- [ ] Color palette adjusts
- [ ] Scrollable if needed

### Mobile (<560px)
- [ ] Single column layout
- [ ] Horizontal scrolling tabs
- [ ] Theme cards single column
- [ ] Info grid single column
- [ ] Color palette 3 columns
- [ ] Touch-friendly tap targets
- [ ] Readable text sizes

**Test by resizing browser window gradually**

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab key moves through all interactive elements
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] Focus visible on current element
- [ ] Enter/Space activates buttons
- [ ] Enter/Space toggles checkboxes
- [ ] Can navigate entire page without mouse

### Screen Reader (Optional)
- [ ] Page title announced
- [ ] Tab buttons have labels
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text
- [ ] ARIA labels present where needed

### Visual
- [ ] Text has sufficient contrast
- [ ] Focus indicators clearly visible
- [ ] Interactive elements have hover states
- [ ] Error/success states distinguishable
- [ ] Icons complement text (not replace)

---

## 🎨 Visual Polish Testing

### Animations & Transitions
- [ ] Tab switching has smooth transition
- [ ] Button hovers animate smoothly
- [ ] Card hovers have elevation effect
- [ ] Theme cards scale on hover
- [ ] Color swatches scale on hover
- [ ] Ripple effect on buttons (if enabled)

### Retro Theme Consistency
- [ ] Neon cyan/pink/blue colors present
- [ ] Dark background maintained
- [ ] Borders have glow effects
- [ ] Typography matches app style
- [ ] Spacing consistent with rest of app
- [ ] Shadows match app aesthetic

### Layout & Spacing
- [ ] Consistent padding/margins
- [ ] Elements properly aligned
- [ ] No overlapping content
- [ ] Whitespace feels balanced
- [ ] Cards have proper spacing
- [ ] Text not cramped

---

## 🐛 Edge Cases & Error Testing

### Input Validation
- [ ] Long display names don't break layout
- [ ] Long emails don't break layout
- [ ] Special characters in name work
- [ ] Empty fields handled gracefully
- [ ] Very long session durations display correctly

### Browser Compatibility
- [ ] Chrome/Chromium works
- [ ] Firefox works (if available)
- [ ] Safari works (if available)
- [ ] Edge works (if available)

### localStorage Edge Cases
- [ ] Works in private/incognito mode
- [ ] Handles localStorage being full
- [ ] Handles localStorage being blocked
- [ ] Graceful fallback if unavailable

### Performance
- [ ] No lag when switching tabs
- [ ] No lag when typing in inputs
- [ ] Smooth animations at 60fps
- [ ] No memory leaks (check DevTools)
- [ ] Fast page load time

---

## 🔍 Console Verification

Open browser DevTools Console and check:

### No Errors
- [ ] No red error messages
- [ ] No uncaught exceptions
- [ ] No failed network requests
- [ ] No React warnings

### localStorage State
Open Application > Local Storage in DevTools:
```javascript
// Should see these keys:
user_display_name
user_email
session_login_time
theme_mode
animations_enabled
compact_mode
notification_settings (from existing code)
```

### Network Tab
- [ ] No failed asset loads
- [ ] No 404 errors
- [ ] All CSS/JS loaded successfully

---

## ✅ Final Verification

### Pre-Production Checklist
- [ ] All above tests passed
- [ ] No console errors
- [ ] localStorage working
- [ ] All tabs functional
- [ ] Responsive on all sizes
- [ ] Accessible via keyboard
- [ ] Performance acceptable
- [ ] Visual polish complete
- [ ] Documentation reviewed

### Sign-Off
```
Tester: _____________________
Date: _______________________
Browser: ____________________
Screen Size: ________________
Result: ☐ PASS  ☐ FAIL
Notes: _____________________
```

---

## 🚀 Ready for Production

If all items checked ✅, the Settings page is ready for deployment!

**Deployment Checklist:**
- [ ] Run `npm run build`
- [ ] Verify build success
- [ ] Check bundle sizes
- [ ] Test production build locally
- [ ] Deploy to staging
- [ ] Verify on staging
- [ ] Deploy to production

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Test Coverage:** 100+ test points
