import React, { useState, useEffect } from "react";
import NotificationSettings from "../components/NotificationSettings";

/**
 * Settings page component - houses all application settings including
 * General, Appearance, and Notifications tabs with functional controls.
 */
// PUBLIC_INTERFACE
export default function Settings({ 
  notificationSettings, 
  onSaveNotificationSettings, 
  onTestAlarm,
  onBack 
}) {
  const [activeTab, setActiveTab] = useState("general");
  
  // General settings state
  const [userProfile, setUserProfile] = useState({
    displayName: localStorage.getItem("user_display_name") || "",
    email: localStorage.getItem("user_email") || "user@example.com"
  });
  const [sessionInfo] = useState({
    loginTime: localStorage.getItem("session_login_time") || new Date().toISOString(),
    lastActivity: new Date().toISOString()
  });

  // Appearance settings state
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem("theme_mode") || "retro-dark"
  );
  const [animations, setAnimations] = useState(
    localStorage.getItem("animations_enabled") !== "false"
  );
  const [compactMode, setCompactMode] = useState(
    localStorage.getItem("compact_mode") === "true"
  );

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setThemeMode(newTheme);
    localStorage.setItem("theme_mode", newTheme);
    // Apply theme class to body (for future theme implementation)
    document.body.setAttribute("data-theme", newTheme);
  };

  // Handle animations toggle
  const handleAnimationsToggle = (enabled) => {
    setAnimations(enabled);
    localStorage.setItem("animations_enabled", enabled);
    if (!enabled) {
      document.body.style.setProperty("--transition-fast", "0ms");
      document.body.style.setProperty("--transition", "0ms");
      document.body.style.setProperty("--transition-slow", "0ms");
    } else {
      document.body.style.removeProperty("--transition-fast");
      document.body.style.removeProperty("--transition");
      document.body.style.removeProperty("--transition-slow");
    }
  };

  // Handle compact mode toggle
  const handleCompactModeToggle = (enabled) => {
    setCompactMode(enabled);
    localStorage.setItem("compact_mode", enabled);
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    localStorage.setItem("user_display_name", userProfile.displayName);
    localStorage.setItem("user_email", userProfile.email);
    alert("Profile updated successfully!");
  };

  // Initialize session login time
  useEffect(() => {
    if (!localStorage.getItem("session_login_time")) {
      localStorage.setItem("session_login_time", new Date().toISOString());
    }
  }, []);

  const formatDateTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  const getSessionDuration = () => {
    try {
      const start = new Date(sessionInfo.loginTime);
      const now = new Date();
      const diffMs = now - start;
      const minutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days} day${days > 1 ? 's' : ''}, ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-left">
          <button 
            className="btn btn-ghost btn-small" 
            onClick={onBack}
            aria-label="Back to dashboard"
          >
            ← Back
          </button>
          <h1 className="page-title">Settings</h1>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav" aria-label="Settings navigation">
            <button
              className={`settings-nav-item ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              ⚙️ General
            </button>
            <button
              className={`settings-nav-item ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => setActiveTab("appearance")}
            >
              🎨 Appearance
            </button>
            <button
              className={`settings-nav-item ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              🔔 Notifications
            </button>
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === "general" && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>General Settings</h2>
                <p className="muted">
                  Manage your profile information and session details.
                </p>
              </div>
              
              <div className="settings-section-content">
                {/* Profile Information */}
                <div className="settings-group">
                  <h3 className="settings-group-title">Profile Information</h3>
                  
                  <div className="form">
                    <div className="field">
                      <label htmlFor="display-name">Display Name</label>
                      <input
                        id="display-name"
                        type="text"
                        className="input"
                        value={userProfile.displayName}
                        onChange={(e) => setUserProfile({...userProfile, displayName: e.target.value})}
                        placeholder="Enter your name"
                      />
                      <div className="hint">
                        This name will be displayed in the application.
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        className="input"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        placeholder="user@example.com"
                      />
                      <div className="hint">
                        Your email address for notifications and account recovery.
                      </div>
                    </div>

                    <div className="field">
                      <button 
                        className="btn btn-primary"
                        onClick={handleProfileUpdate}
                      >
                        Save Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Session Information */}
                <div className="settings-group">
                  <h3 className="settings-group-title">Session Information</h3>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Login Time</div>
                      <div className="info-value">{formatDateTime(sessionInfo.loginTime)}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Session Duration</div>
                      <div className="info-value">{getSessionDuration()}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Last Activity</div>
                      <div className="info-value">{formatDateTime(sessionInfo.lastActivity)}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Browser</div>
                      <div className="info-value">{navigator.userAgent.split(' ').slice(-1)[0]}</div>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="settings-group">
                  <h3 className="settings-group-title">Account Actions</h3>
                  
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button 
                      className="btn btn-ghost"
                      onClick={() => {
                        if (window.confirm("Clear all local data? This will reset your preferences.")) {
                          localStorage.clear();
                          alert("Local data cleared. Please refresh the page.");
                        }
                      }}
                    >
                      Clear Local Data
                    </button>
                    
                    <button 
                      className="btn btn-ghost"
                      onClick={() => {
                        const data = {
                          profile: userProfile,
                          theme: themeMode,
                          animations: animations,
                          compactMode: compactMode,
                          notifications: notificationSettings
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `settings-backup-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Appearance Settings</h2>
                <p className="muted">
                  Customize the look and feel of your application.
                </p>
              </div>
              
              <div className="settings-section-content">
                {/* Theme Selection */}
                <div className="settings-group">
                  <h3 className="settings-group-title">Theme</h3>
                  
                  <div className="theme-selector">
                    <div 
                      className={`theme-option ${themeMode === "retro-dark" ? "active" : ""}`}
                      onClick={() => handleThemeChange("retro-dark")}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && handleThemeChange("retro-dark")}
                    >
                      <div className="theme-preview retro-dark-preview">
                        <div className="preview-colors">
                          <span style={{ background: "#0b1020" }}></span>
                          <span style={{ background: "#22d3ee" }}></span>
                          <span style={{ background: "#fb7185" }}></span>
                        </div>
                      </div>
                      <div className="theme-name">Retro Dark</div>
                      <div className="theme-description">Classic cyberpunk aesthetic</div>
                      {themeMode === "retro-dark" && <div className="theme-badge">Active</div>}
                    </div>

                    <div 
                      className={`theme-option ${themeMode === "retro-light" ? "active" : ""}`}
                      onClick={() => handleThemeChange("retro-light")}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && handleThemeChange("retro-light")}
                    >
                      <div className="theme-preview retro-light-preview">
                        <div className="preview-colors">
                          <span style={{ background: "#f9fafb" }}></span>
                          <span style={{ background: "#3b82f6" }}></span>
                          <span style={{ background: "#06b6d4" }}></span>
                        </div>
                      </div>
                      <div className="theme-name">Retro Light</div>
                      <div className="theme-description">Coming soon</div>
                      {themeMode === "retro-light" && <div className="theme-badge">Active</div>}
                    </div>

                    <div 
                      className={`theme-option ${themeMode === "neon-purple" ? "active" : ""}`}
                      onClick={() => handleThemeChange("neon-purple")}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && handleThemeChange("neon-purple")}
                    >
                      <div className="theme-preview neon-purple-preview">
                        <div className="preview-colors">
                          <span style={{ background: "#1a0b2e" }}></span>
                          <span style={{ background: "#a855f7" }}></span>
                          <span style={{ background: "#ec4899" }}></span>
                        </div>
                      </div>
                      <div className="theme-name">Neon Purple</div>
                      <div className="theme-description">Coming soon</div>
                      {themeMode === "neon-purple" && <div className="theme-badge">Active</div>}
                    </div>
                  </div>
                </div>

                {/* Display Options */}
                <div className="settings-group">
                  <h3 className="settings-group-title">Display Options</h3>
                  
                  <div className="form">
                    <div className="field">
                      <label htmlFor="animations" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="checkbox"
                          id="animations"
                          checked={animations}
                          onChange={(e) => handleAnimationsToggle(e.target.checked)}
                          style={{ width: "auto" }}
                        />
                        Enable animations
                      </label>
                      <div className="hint">
                        Enable smooth transitions and animations throughout the app. Disable for better performance on slower devices.
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="compact-mode" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="checkbox"
                          id="compact-mode"
                          checked={compactMode}
                          onChange={(e) => handleCompactModeToggle(e.target.checked)}
                          style={{ width: "auto" }}
                        />
                        Compact mode
                      </label>
                      <div className="hint">
                        Reduce spacing and padding for a more dense layout. Useful for smaller screens or to see more content at once.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="settings-group">
                  <h3 className="settings-group-title">Typography</h3>
                  
                  <div className="typography-preview">
                    <div className="typography-sample">
                      <h1 style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", color: "var(--text-bright)" }}>
                        Heading 1
                      </h1>
                      <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px", color: "var(--text-bright)" }}>
                        Heading 2
                      </h2>
                      <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text)" }}>
                        Heading 3
                      </h3>
                      <p style={{ fontSize: "14px", color: "var(--text)", marginBottom: "8px" }}>
                        Body text - This is how your regular content will appear in the application.
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                        Muted text - Used for hints and secondary information.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="settings-group">
                  <h3 className="settings-group-title">Color Palette</h3>
                  
                  <div className="color-palette">
                    <div className="color-swatch">
                      <div className="color-sample" style={{ background: "var(--neon-cyan)" }}></div>
                      <div className="color-name">Cyan</div>
                    </div>
                    <div className="color-swatch">
                      <div className="color-sample" style={{ background: "var(--neon-blue)" }}></div>
                      <div className="color-name">Blue</div>
                    </div>
                    <div className="color-swatch">
                      <div className="color-sample" style={{ background: "var(--neon-pink)" }}></div>
                      <div className="color-name">Pink</div>
                    </div>
                    <div className="color-swatch">
                      <div className="color-sample" style={{ background: "var(--neon-lime)" }}></div>
                      <div className="color-name">Lime</div>
                    </div>
                    <div className="color-swatch">
                      <div className="color-sample" style={{ background: "var(--success)" }}></div>
                      <div className="color-name">Success</div>
                    </div>
                    <div className="color-swatch">
                      <div className="color-sample" style={{ background: "var(--warning)" }}></div>
                      <div className="color-name">Warning</div>
                    </div>
                    <div className="color-swatch">
                      <div className="color-sample" style={{ background: "var(--danger)" }}></div>
                      <div className="color-name">Danger</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Notification Settings</h2>
                <p className="muted">
                  Configure how and when you receive notifications for your tasks.
                </p>
              </div>
              <div className="settings-section-content">
                <NotificationSettings
                  settings={notificationSettings}
                  onSave={onSaveNotificationSettings}
                  onClose={onBack}
                  onTestAlarm={onTestAlarm}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
