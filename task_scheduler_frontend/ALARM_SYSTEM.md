# Alarm System Documentation

## Overview

The Task Scheduler Pro frontend now uses a real audio file (MP3/WAV) for alarm notifications instead of Web Audio API synthesized beeps. This provides a more professional and customizable alarm experience.

## Features

- **Real Audio File**: Uses `/public/assets/alarm.mp3` for alarm notifications
- **Loop Control**: Option to continuously loop the alarm until dismissed or stopped
- **Stop Button**: Dedicated "Stop Alarm" button in the notification modal
- **Settings UI**: Configure alarm behavior through the notification settings modal
- **Test Function**: Test the alarm sound before enabling it

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
   - Updated to use audioService instead of Web Audio API
   - Manages notification timing and triggering
   - Methods:
     - `playAlarm(loop)`: Play the alarm with optional looping
     - `stopAlarm()`: Stop the alarm
     - `isAlarmPlaying()`: Check alarm status
     - `testAlarm()`: Test alarm for 3 seconds

3. **AlarmNotification.js** (`src/components/AlarmNotification.js`)
   - Updated with "Stop Alarm" button
   - Calls `onStop` callback to stop the alarm sound
   - Stops alarm automatically when dismissed

4. **NotificationSettings.js** (`src/components/NotificationSettings.js`)
   - Added "Loop alarm sound" checkbox option
   - Test button plays alarm for 3 seconds
   - Settings saved to localStorage

## Usage

### User Settings

Users can configure the alarm through the notification settings modal (🔔 icon in top bar):

- **Enable notifications**: Toggle all notifications on/off
- **Play alarm sound**: Enable/disable audio playback
- **Loop alarm sound**: Continuously repeat the alarm until stopped
- **Notify before due time**: Set how many minutes before a task's due time to trigger the alarm
- **Test alarm sound**: Preview the alarm (plays for 3 seconds)

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
import { audioService } from './services/audioService';

// Play alarm once
await audioService.play('/assets/alarm.mp3', false);

// Play alarm with looping
await audioService.play('/assets/alarm.mp3', true);

// Stop alarm
audioService.stop();

// Check if playing
const isPlaying = audioService.getIsPlaying();

// Set volume (0.0 to 1.0)
audioService.setVolume(0.7);
```

## Audio File Details

- **Location**: `/public/assets/alarm.mp3`
- **Source**: Mixkit (royalty-free under Mixkit License)
- **Duration**: ~5 seconds
- **Format**: MP3
- **Size**: ~63KB

## Settings Storage

Settings are stored in localStorage:

- **Key**: `task_scheduler_notification_settings`
- **Structure**:
  ```json
  {
    "enabled": true,
    "soundEnabled": true,
    "loopSound": false,
    "notifyMinutesBefore": 5,
    "repeatInterval": 0
  }
  ```

## Browser Compatibility

The HTML5 Audio API is supported in all modern browsers:
- Chrome 4+
- Firefox 3.5+
- Safari 3.1+
- Edge (all versions)
- Opera 10.5+

## Troubleshooting

### Alarm not playing

1. Check browser audio permissions
2. Verify user interacted with the page first (browsers require user gesture for audio)
3. Check browser console for errors
4. Test with the "Test alarm sound" button in settings

### Audio file not loading

1. Verify `/public/assets/alarm.mp3` exists
2. Check file permissions
3. Clear browser cache
4. Check browser console for 404 errors

### Alarm won't stop

1. Use the "Stop Alarm" button in the notification
2. Refresh the page as fallback
3. Check browser console for JavaScript errors

## Future Enhancements

Possible future improvements:

- Multiple alarm sound options
- Custom audio file upload
- Volume control slider
- Snooze functionality
- Gradual volume increase (crescendo)
- Different sounds for different priorities
