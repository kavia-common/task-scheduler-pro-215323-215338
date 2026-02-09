import React, { useState } from "react";

/**
 * Notification settings modal for configuring alarm preferences.
 */
// PUBLIC_INTERFACE
export default function NotificationSettings({ settings, onSave, onClose, onTestAlarm }) {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [loopSound, setLoopSound] = useState(settings.loopSound || false);
  const [notifyMinutesBefore, setNotifyMinutesBefore] = useState(settings.notifyMinutesBefore);

  const handleSave = () => {
    onSave({
      enabled,
      soundEnabled,
      loopSound,
      notifyMinutesBefore: parseInt(notifyMinutesBefore, 10) || 5,
    });
  };

  return (
    <div className="modal-body">
      <div className="form">
        <div className="field">
          <label htmlFor="notif-enabled" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="notif-enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              style={{ width: "auto" }}
            />
            Enable notifications
          </label>
          <div className="hint">
            Show alerts when tasks are due while the app is open.
          </div>
        </div>

        <div className="field">
          <label htmlFor="sound-enabled" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="sound-enabled"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              disabled={!enabled}
              style={{ width: "auto" }}
            />
            Play alarm sound
          </label>
          <div className="hint">
            Play an audible alert when notifications appear.
          </div>
        </div>

        <div className="field">
          <label htmlFor="loop-sound" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="loop-sound"
              checked={loopSound}
              onChange={(e) => setLoopSound(e.target.checked)}
              disabled={!enabled || !soundEnabled}
              style={{ width: "auto" }}
            />
            Loop alarm sound
          </label>
          <div className="hint">
            Continuously repeat the alarm until dismissed or stopped.
          </div>
        </div>

        <div className="field">
          <label htmlFor="notify-minutes">Notify before due time (minutes)</label>
          <input
            type="number"
            id="notify-minutes"
            className="input"
            value={notifyMinutesBefore}
            onChange={(e) => setNotifyMinutesBefore(e.target.value)}
            min="0"
            max="60"
            disabled={!enabled}
          />
          <div className="hint">
            The alarm will trigger THIS MANY MINUTES before the task's due time. 
            Set to 0 to get notified exactly at due time. Set to 5 to get notified 5 minutes before due time.
          </div>
        </div>

        <div className="field">
          <button
            className="btn btn-ghost"
            onClick={onTestAlarm}
            disabled={!enabled || !soundEnabled}
          >
            🔊 Test alarm sound
          </button>
          <div className="hint">
            Test will play for 3 seconds then stop automatically.
          </div>
        </div>
      </div>

      <div className="notice" style={{ marginTop: "16px", fontSize: "12px" }}>
        <strong>How it works:</strong> When you set "Notify before due time" to {notifyMinutesBefore} minutes, 
        the alarm will trigger {notifyMinutesBefore === 0 ? "exactly at" : `${notifyMinutesBefore} minutes before`} 
        the task's due time. For example, if a task is due at 10:30 AM, the alarm will sound at{" "}
        {notifyMinutesBefore === 0 
          ? "10:30 AM" 
          : `${10 * 60 + 30 - parseInt(notifyMinutesBefore || 0) < 600 ? '0' : ''}${Math.floor((10 * 60 + 30 - parseInt(notifyMinutesBefore || 0)) / 60)}:${String((10 * 60 + 30 - parseInt(notifyMinutesBefore || 0)) % 60).padStart(2, '0')} AM`
        }.
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save settings
        </button>
      </div>
    </div>
  );
}
