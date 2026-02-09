import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "theme_mode";
const DEFAULT_THEME = "retro-dark";

/**
 * Custom hook for managing application theme
 * Handles theme initialization, persistence, and application
 * 
 * @returns {Object} Theme state and setter function
 */
// PUBLIC_INTERFACE
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    // Initialize from localStorage or use default
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored || DEFAULT_THEME;
  });

  // Apply theme to document when it changes
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    document.body.setAttribute("data-theme", storedTheme);
  }, []);

  // PUBLIC_INTERFACE
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  return { theme, setTheme };
}

/**
 * Get available theme options
 * 
 * @returns {Array} List of theme configurations
 */
// PUBLIC_INTERFACE
export function getThemeOptions() {
  return [
    {
      id: "retro-dark",
      name: "Dark Retro",
      description: "Classic cyberpunk aesthetic",
      colors: ["#0b1020", "#22d3ee", "#fb7185"],
      available: true,
    },
    {
      id: "retro-light",
      name: "Light Retro",
      description: "Bright and clean retro design",
      colors: ["#f9fafb", "#3b82f6", "#06b6d4"],
      available: true,
    },
    {
      id: "neon-purple",
      name: "Neon Purple",
      description: "Coming soon",
      colors: ["#1a0b2e", "#a855f7", "#ec4899"],
      available: false,
    },
  ];
}
