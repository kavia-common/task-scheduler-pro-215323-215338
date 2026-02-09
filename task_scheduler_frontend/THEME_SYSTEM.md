# Theme System Documentation

## Overview

The Task Scheduler Pro frontend now includes a fully functional theme switcher that allows users to toggle between **Light Retro** and **Dark Retro** themes. The theme is applied app-wide using CSS variables, persisted in localStorage, and updates all components instantly without requiring page refresh.

## Features

✅ **Two Working Themes**:
- **Dark Retro** (default): Classic cyberpunk aesthetic with dark backgrounds and neon accents
- **Light Retro**: Bright and clean retro design with light backgrounds

✅ **One Placeholder Theme**:
- **Neon Purple**: Coming soon (UI shows as disabled)

✅ **Instant Theme Switching**: Changes apply immediately across all components
✅ **Persistent Storage**: Theme preference saved in localStorage
✅ **App-wide Coverage**: All UI elements respond to theme changes (dashboard, modals, settings, tables, buttons, toasts, alarms)
✅ **No Backend Dependencies**: Pure frontend implementation
✅ **Accessible**: Keyboard navigation and ARIA attributes supported

## Architecture

### File Structure

```
src/
├── theme.css                 # Theme CSS variables for all themes
├── hooks/
│   └── useTheme.js          # Theme management hook
├── App.css                   # Component styles using CSS variables
├── App.js                    # App component with theme integration
└── pages/
    └── Settings.js          # Settings page with theme selector UI
```

### Implementation Details

#### 1. CSS Variables (theme.css)

All theme variables are defined using CSS custom properties scoped to `data-theme` attributes:

```css
[data-theme="retro-dark"] {
  --bg: #0b1020;
  --text: #e5e7eb;
  --neon-cyan: #22d3ee;
  /* ... more variables */
}

[data-theme="retro-light"] {
  --bg: #f9fafb;
  --text: #1f2937;
  --neon-cyan: #06b6d4;
  /* ... more variables */
}
```

#### 2. Theme Hook (useTheme.js)

The `useTheme` hook manages theme state and persistence:

```javascript
const { theme, setTheme } = useTheme();
```

- Initializes theme from localStorage or defaults to "retro-dark"
- Applies theme by setting `data-theme` attribute on `<body>`
- Persists theme changes to localStorage
- Returns current theme and setter function

#### 3. Settings Integration

The Appearance tab in Settings displays clickable theme cards:
- Shows preview colors for each theme
- Highlights active theme with badge
- Disables unavailable themes
- Provides instant visual feedback on selection

## Usage

### For Users

1. Click the ⚙️ Settings icon in the top navigation
2. Navigate to the **Appearance** tab
3. Click on either **Dark Retro** or **Light Retro** theme card
4. Theme changes instantly and a success toast confirms the change
5. Your preference is saved automatically

### For Developers

#### Reading Current Theme

```javascript
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { theme } = useTheme();
  
  return <div>Current theme: {theme}</div>;
}
```

#### Changing Theme Programmatically

```javascript
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { setTheme } = useTheme();
  
  const switchToDark = () => {
    setTheme('retro-dark');
  };
  
  return <button onClick={switchToDark}>Switch to Dark</button>;
}
```

#### Getting Available Themes

```javascript
import { getThemeOptions } from './hooks/useTheme';

const themeOptions = getThemeOptions();
// Returns array of theme objects with id, name, description, colors, available
```

#### Using Theme Variables in CSS

All components automatically inherit theme variables. Simply use `var()` in your CSS:

```css
.my-component {
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
}

.my-button {
  background: var(--neon-cyan);
  box-shadow: var(--glow-cyan);
}
```

## Available CSS Variables

### Colors
- `--bg`, `--bg-darker` - Background colors
- `--panel`, `--panel-solid` - Panel/card backgrounds
- `--text`, `--text-bright` - Text colors
- `--muted`, `--muted-light` - Muted/secondary text
- `--neon-cyan`, `--neon-blue`, `--neon-pink`, `--neon-lime` - Accent colors
- `--danger`, `--warning`, `--success` - Status colors

### Borders
- `--border`, `--border-strong`, `--border-subtle` - Border colors

### Effects
- `--shadow-sm`, `--shadow`, `--shadow-lg` - Box shadows
- `--glow-cyan`, `--glow-pink` - Glow effects
- `--bg-gradient` - Background gradient
- `--grid-color`, `--grid-opacity` - Grid overlay

### Layout
- `--radius-sm`, `--radius`, `--radius-lg` - Border radius values
- `--space-xs` through `--space-2xl` - Spacing scale

### Typography
- `--font-sans`, `--font-mono` - Font families

### Transitions
- `--transition-fast`, `--transition`, `--transition-slow` - Duration values

## Adding New Themes

To add a new theme:

1. **Define CSS variables in theme.css**:
```css
[data-theme="my-new-theme"] {
  --bg: #...;
  --text: #...;
  /* ... all required variables */
}
```

2. **Add theme option in useTheme.js**:
```javascript
{
  id: "my-new-theme",
  name: "My New Theme",
  description: "Description here",
  colors: ["#color1", "#color2", "#color3"],
  available: true,
}
```

3. **Add preview class in App.css** (optional):
```css
.my-new-theme-preview {
  background: linear-gradient(135deg, #color1, #color2);
}
```

## Testing

### Manual Testing Checklist

- [x] Theme selector displays all available themes
- [x] Clicking a theme changes the UI instantly
- [x] Theme preference persists after page refresh
- [x] All components (dashboard, modals, tables, buttons) respect theme
- [x] Toast notification confirms theme change
- [x] Settings page displays correctly in both themes
- [x] Dark Retro theme works correctly
- [x] Light Retro theme works correctly
- [x] Disabled themes (Neon Purple) cannot be selected
- [x] Keyboard navigation works for theme selection

### Browser Compatibility

Tested and working in:
- Chrome/Edge (Chromium-based)
- Firefox
- Safari

## Troubleshooting

### Theme doesn't change
- Check browser console for errors
- Verify `data-theme` attribute is set on `<body>` element
- Clear localStorage and try again: `localStorage.removeItem('theme_mode')`

### Theme doesn't persist
- Check if localStorage is enabled in browser
- Verify no browser extensions are blocking storage

### Colors look wrong
- Ensure all CSS variables are defined for the theme
- Check for CSS specificity conflicts
- Verify theme.css is loaded before App.css

## Future Enhancements

Potential improvements:
- [ ] System preference detection (prefers-color-scheme)
- [ ] Custom theme builder
- [ ] Theme preview before applying
- [ ] Smooth color transitions between themes
- [ ] More theme options (Neon Purple, others)
- [ ] Export/import theme settings

## Maintenance Notes

- All theme colors must be defined for each theme
- Maintain consistency in variable naming
- Test new components with all available themes
- Document any new CSS variables added
- Keep theme.css as single source of truth for colors

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready
