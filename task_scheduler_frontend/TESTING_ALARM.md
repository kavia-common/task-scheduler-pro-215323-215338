# Testing the Alarm System

## Manual Testing Guide

### Prerequisites

1. Start the development server: `npm start`
2. Open the app in your browser
3. Sign in or create an account

### Test 1: Basic Alarm Settings

1. Click the 🔔 (bell) icon in the top navigation bar
2. Verify all settings are visible:
   - ✅ Enable notifications
   - ✅ Play alarm sound
   - ✅ Loop alarm sound
   - Minutes before notification (input field)
   - Test alarm sound button
3. Click "Test alarm sound" button
4. **Expected**: You should hear a 3-second alarm sound
5. Click "Save settings" to close the modal

### Test 2: Create a Task with Near-Future Due Date

1. Click "+ Add task" button
2. Fill in the form:
   - Title: "Test Alarm Task"
   - Description: "Testing the alarm notification"
   - Due: Set to 1-2 minutes from now
   - Priority: High
3. Click "Create task"
4. Wait for the due time

**Expected Results:**
- Alarm notification modal appears with task details
- Alarm sound plays once (if loop is disabled)
- Modal shows "Stop Alarm", "Dismiss", and "View Task" buttons

### Test 3: Stop Alarm Button

1. While an alarm is playing (from Test 2):
2. Click the "🔇 Stop Alarm" button
3. **Expected**: 
   - Sound stops immediately
   - Notification modal remains visible
   - You can still interact with "Dismiss" or "View Task"

### Test 4: Loop Alarm

1. Open notification settings (🔔 icon)
2. Enable "Loop alarm sound" checkbox
3. Save settings
4. Create another task with a near-future due date
5. Wait for the alarm to trigger

**Expected Results:**
- Alarm sound plays continuously (loops)
- Sound continues until you click "Stop Alarm", "Dismiss", or "View Task"

### Test 5: Disable Sound

1. Open notification settings
2. Uncheck "Play alarm sound"
3. Save settings
4. Create a task with near-future due date
5. Wait for the notification

**Expected Results:**
- Notification modal appears (visual notification)
- No sound plays
- All buttons still work normally

### Test 6: Notification Timing

1. Open notification settings
2. Set "Notify before due time" to 10 minutes
3. Save settings
4. Create a task due in 10 minutes
5. Wait

**Expected Results:**
- Notification triggers when the task is 10 minutes from due
- Shows "Due in 10 min" in the notification

### Test 7: Dismiss and Re-notification

1. Create a task due in 2 minutes
2. Wait for the notification
3. Click "Dismiss"
4. **Expected**: 
   - Notification disappears
   - Alarm stops
   - Same task won't trigger notification again for 1 hour (anti-spam protection)

### Test 8: View Task from Alarm

1. Wait for an alarm notification
2. Click "View Task" button
3. **Expected**:
   - Alarm stops
   - Notification closes
   - Task edit modal opens with the task details

## Automated Testing Checklist

### Unit Tests Needed

- [ ] `audioService.play()` returns true on success
- [ ] `audioService.stop()` stops active audio
- [ ] `audioService.getIsPlaying()` reflects current state
- [ ] `notificationScheduler.playAlarm()` calls audioService
- [ ] `notificationScheduler.stopAlarm()` stops audio
- [ ] Settings are saved to localStorage correctly
- [ ] Settings are loaded from localStorage on init

### Integration Tests Needed

- [ ] AlarmNotification renders with stop button
- [ ] Stop button calls onStop callback
- [ ] NotificationSettings saves loop option
- [ ] Test alarm button triggers 3-second playback
- [ ] Alarm stops when notification dismissed

## Known Limitations

1. **Browser Autoplay Policy**: Some browsers block audio autoplay. The alarm requires user interaction with the page first.
2. **Background Tabs**: Browser may throttle timers in background tabs, potentially delaying notifications.
3. **Mobile**: On mobile devices, the app must be in the foreground for alarms to work.
4. **Safari**: Safari may require additional user permissions for audio playback.

## Debugging Tips

1. **Open Browser Console** (F12) to see any error messages
2. **Check localStorage** (Application tab in DevTools) for saved settings
3. **Network Tab**: Verify `/assets/alarm.mp3` loads successfully (should show 200 status)
4. **Audio Element**: In console, run `audioService.getIsPlaying()` to check state

## Success Criteria

All tests should pass with:
- ✅ Alarm sound plays when notification triggers
- ✅ Stop button stops the alarm immediately
- ✅ Loop option works correctly
- ✅ Settings persist across page reloads
- ✅ Test button previews the alarm sound
- ✅ No console errors during normal operation
