# Alarm System Documentation

## Overview

The Task Scheduler Pro frontend includes a robust alarm notification system with real audio playback, desktop notifications, and background reliability. The system ensures alarms trigger on time even when the browser tab is in the background.

## Features

### Core Features
- **Real Audio File**: Uses `/public/assets/alarm.mp3` for alarm notifications
- **Loop Control**: Option to continuously loop the alarm until dismissed or stopped
- **Stop Button**: Dedicated "Stop Alarm" button in the notification modal
- **Settings UI**: Configure alarm behavior through the notification settings modal
- **Test Function**: Test the alarm sound before enabling it

### Enhanced Background Reliability
- **Desktop Notifications**: Native OS notifications via Web Notifications API
- **Background Tab Support**: Alarms trigger even when tab is not visible
- **Visibility Detection**: Automatically adapts polling based on tab visibility
- **Catch-up Mechanism**: Checks for missed alarms when tab regains focus
- **Adaptive Polling**: 10s interval when visible, 30s when hidden (less browser throttling)

### Desktop Notification Features
- **Permission Management**: User-friendly permission request flow
- **First-time Prompt**: Automatic prompt for permission after authentication
- **Clickable Notifications**: Click to focus window and view task
- **Persistent Notifications**: Stay visible until user interacts (requireInteraction)
- **No Duplicates**: Tag-based notification management prevents spam

## Architecture

### Components

1. **audioService.js** (`src/services/audioService.js`)
   - Singleton service for playing audio files
   - Uses HTML5 Audio API
   - Supports play, stop, loop, and volume control
   - Methods:
     - `play(audioPath, loop)`: Play an audio file with optional looping
     - `stop()`: Stop currently playing audio
     - `setVolume(volume)`: Set volume (0.0 to 1.0)
     - `getIsPlaying()`: Check if audio is currently playing

2. **notificationScheduler.js** (`src/services/notificationScheduler.js`)
   - Enhanced with desktop notifications and background reliability
   - Manages notification timing and triggering
   - Handles visibility changes and catch-up checks
   - Methods:
     - `playAlarm(loop)`: Play the alarm with optional looping
     - `stopAlarm()`: Stop the alarm
     - `isAlarmPlaying()`: Check alarm status
     - `testAlarm()`: Test alarm for 3 seconds
     - `requestPermission()`: Request desktop notification permission
     - `showDesktopNotification(task, isOverdue, minutesUntil)`: Show native notification
     - `getPermissionState()`: Get current permission status
     - `shouldPromptForPermission()`: Check if we should prompt user

3. **AlarmNotification.js** (`src/components/AlarmNotification.js`)
   - Updated with "Stop Alarm" button
   - Calls `onStop` callback to stop the alarm sound
   - Stops alarm automatically when dismissed

4. **NotificationSettings.js** (`src/components/NotificationSettings.js`)
   - Added "Desktop notifications" toggle
   - Permission request button and status display
   - Visual feedback for permission state
   - Settings saved to localStorage

## Background Reliability Implementation

### Visibility Change Handling

The system listens for `visibilitychange` events to detect when the tab is backgrounded:

```javascript
document.addEventListener("visibilitychange", handleVisibilityChange);
```

When visibility changes:
- **Tab visible**: Switches to 10-second polling, performs catch-up check
- **Tab hidden**: Switches to 30-second polling (less aggressive to avoid throttling)

### Catch-up Mechanism

When the tab regains focus, the system:
1. Records the time since last check
2. Immediately performs a full task check
3. Triggers any missed notifications

This ensures alarms aren't missed if the tab was backgrounded during the reminder time.

### Adaptive Polling

- **Foreground mode**: 10-second interval (responsive, low latency)
- **Background mode**: 30-second interval (avoids aggressive browser throttling)
- Browser throttling can delay background timers, but 30s is more reliable than shorter intervals

## Desktop Notifications

### Permission Flow

1. **First-time**: After authentication, prompt appears automatically (with 2s delay)
2. **User accepts**: Desktop notifications enabled, test notification shown
3. **User declines**: In-app modal notifications still work, can enable later in settings
4. **Permission blocked**: Clear instructions shown to enable in browser settings

### Notification Behavior

When a task reminder triggers:
1. **Desktop notification** shown (if permission granted)
   - Title: "⏰ Task Reminder: [Task Title]"
   - Body: Due time + description
   - Tag: Prevents duplicate notifications for same task
   - Icon: Uses favicon.ico
2. **In-app modal** shown (always)
3. **Audio alarm** plays (if enabled)

Clicking the desktop notification:
- Focuses the browser window
- Closes the desktop notification
- Shows the in-app modal with task details

## Usage

### User Settings

Users can configure the alarm through the notification settings modal (🔔 icon in top bar):

- **Enable notifications**: Toggle all notifications on/off
- **Play alarm sound**: Enable/disable audio playback
- **Loop alarm sound**: Continuously repeat the alarm until stopped
- **Desktop notifications**: Enable/disable native OS notifications
- **Notify before due time**: Set how many minutes before a task's due time to trigger the alarm
- **Test alarm sound**: Preview the alarm (plays for 3 seconds)

### Permission Management

Desktop notification permission states:
- **✅ Granted**: Notifications will work in background
- **⚠️ Not yet requested**: Click "Request Permission" button
- **🚫 Blocked**: Must enable in browser settings (instructions provided)
- **❌ Not supported**: Browser doesn't support Notifications API

### Alarm Controls

When an alarm notification appears:

1. **Stop Alarm** (🔇): Stops the audio immediately while keeping the notification visible
2. **Dismiss**: Closes the notification and stops the audio
3. **View Task**: Opens the task editor and stops the audio

### For Developers

#### Replacing the Alarm Sound

To use a custom alarm sound:

1. Replace `/public/assets/alarm.mp3` with your audio file
2. Supported formats: MP3, WAV, OGG (browser-dependent)
3. Recommended: Keep files under 100KB for fast loading

#### Programmatic Control

```javascript
import { notificationScheduler } from './services/notificationScheduler';

// Request desktop notification permission
const permission = await notificationScheduler.requestPermission();

// Check permission state
const state = notificationScheduler.getPermissionState();

// Show desktop notification manually
notificationScheduler.showDesktopNotification(task, isOverdue, minutesUntil);

// Check if we should prompt for permission
const shouldPrompt = notificationScheduler.shouldPromptForPermission();

// Get current settings
const settings = notificationScheduler.getSettings();
```

## Settings Storage

Settings are stored in localStorage:

- **Key**: `task_scheduler_notification_settings`
- **Structure**:
  ```json
  {
    "enabled": true,
    "soundEnabled": true,
    "loopSound": false,
    "desktopNotifications": true,
    "notifyMinutesBefore": 5,
    "repeatInterval": 0
  }
  ```

Additional storage keys:
- `task_scheduler_dismissed_notifications`: Tracks dismissed notifications (1 hour timeout)
- `task_scheduler_last_check_time`: Used for catch-up mechanism

## Browser Compatibility

### HTML5 Audio API
- Chrome 4+
- Firefox 3.5+
- Safari 3.1+
- Edge (all versions)
- Opera 10.5+

### Web Notifications API
- Chrome 22+
- Firefox 22+
- Safari 7+
- Edge 14+
- Opera 25+

**Note**: Desktop notifications require user permission and HTTPS (or localhost for development).

## Troubleshooting

### Alarm not playing

1. Check browser audio permissions
2. Verify user interacted with the page first (browsers require user gesture for audio)
3. Check browser console for errors
4. Test with the "Test alarm sound" button in settings

### Desktop notifications not working

1. Check permission status in notification settings
2. Ensure HTTPS connection (or localhost)
3. Check browser notification settings (not blocked globally)
4. Try requesting permission again
5. Check browser console for errors

### Alarms missed when tab in background

1. Ensure desktop notifications are enabled and permission granted
2. Check browser console for visibility change logs
3. Try the catch-up mechanism: switch tabs, then return
4. Browser may be aggressively throttling (try keeping tab in foreground)
5. Check "Cleared all dismissed notifications" hasn't been called recently

### Audio file not loading

1. Verify `/public/assets/alarm.mp3` exists
2. Check file permissions
3. Clear browser cache
4. Check browser console for 404 errors

### Alarm won't stop

1. Use the "Stop Alarm" button in the notification
2. Refresh the page as fallback
3. Check browser console for JavaScript errors

## Testing the System

### Manual Tests

1. **Basic alarm**: Set task due in 1 minute, wait for alarm
2. **Background tab**: Set task, switch to another tab, verify desktop notification
3. **Catch-up**: Set task, switch tabs before due time, return after due time, verify catch-up
4. **Permission flow**: Clear site data, reload, test permission prompt
5. **Loop alarm**: Enable loop, verify continuous playback
6. **Stop button**: Verify alarm stops but modal remains

### Console Commands

```javascript
// Clear dismissed notifications (testing)
notificationScheduler.clearDismissedNotifications();

// Check task notification status
notificationScheduler.getTaskNotificationStatus('task_id');

// Force a check
notificationScheduler.checkTasks();

// Test desktop notification
new Notification("Test", { body: "Testing desktop notifications" });
```

## Future Enhancements

Possible future improvements:

- [ ] Multiple alarm sound options
- [ ] Custom audio file upload
- [ ] Volume control slider
- [ ] Snooze functionality (5/10/15 min)
- [ ] Gradual volume increase (crescendo)
- [ ] Different sounds for different priorities
- [ ] Vibration API for mobile devices
- [ ] Service Worker for true background notifications (even when tab closed)
- [ ] Notification action buttons (Complete, Snooze, Dismiss)
- [ ] Notification grouping for multiple simultaneous alarms

## Known Limitations

1. **Browser Throttling**: Background tabs are throttled by browsers; 30s interval is a compromise
2. **Tab Must Be Open**: Notifications only work while the tab is open (Service Worker could solve this)
3. **HTTPS Required**: Desktop notifications require HTTPS in production
4. **Permission Persistence**: User must grant permission; no workaround for denied state
5. **Mobile Limitations**: Background reliability varies by mobile browser
6. **Audio Autoplay**: Initial user interaction required before audio can play
