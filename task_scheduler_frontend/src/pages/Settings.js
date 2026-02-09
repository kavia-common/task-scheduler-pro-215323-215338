import React, { useState } from "react";
import NotificationSettings from "../components/NotificationSettings";

/**
 * Settings page component - houses all application settings including
 * notification preferences and other future configuration options.
 */
// PUBLIC_INTERFACE
export default function Settings({ 
  notificationSettings, 
  onSaveNotificationSettings, 
  onTestAlarm,
  onBack 
}) {
  const [activeTab, setActiveTab] = useState("notifications");

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
              className={`settings-nav-item ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              🔔 Notifications
            </button>
            <button
              className={`settings-nav-item ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
              disabled
            >
              ⚙️ General
            </button>
            <button
              className={`settings-nav-item ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => setActiveTab("appearance")}
              disabled
            >
              🎨 Appearance
            </button>
          </nav>
        </div>

        <div className="settings-main">
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

          {activeTab === "general" && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>General Settings</h2>
                <p className="muted">Coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Appearance Settings</h2>
                <p className="muted">Coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
