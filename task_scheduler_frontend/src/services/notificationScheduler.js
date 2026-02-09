/**
 * Background notification/alarm scheduler for task reminders.
 * Runs while the app is open and checks task due times.
 * Triggers alarm sound and on-screen alerts when tasks are due.
 */

import { audioService } from "./audioService";

const NOTIFICATION_SETTINGS_KEY = "task_scheduler_notification_settings";
const DISMISSED_NOTIFICATIONS_KEY = "task_scheduler_dismissed_notifications";

/**
 * Get notification settings from localStorage
 */
function getNotificationSettings() {
  try {
    const settings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings
      ? JSON.parse(settings)
      : {
          enabled: true,
          soundEnabled: true,
          loopSound: false,
          notifyMinutesBefore: 5,
          repeatInterval: 0, // 0 = no repeat
        };
  } catch {
    return {
      enabled: true,
      soundEnabled: true,
      loopSound: false,
      notifyMinutesBefore: 5,
      repeatInterval: 0,
    };
  }
}

/**
 * Save notification settings to localStorage
 */
function saveNotificationSettings(settings) {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * Get dismissed notifications from localStorage
 */
function getDismissedNotifications() {
  try {
    const dismissed = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
    return dismissed ? JSON.parse(dismissed) : {};
  } catch {
    return {};
  }
}

/**
 * Mark a notification as dismissed
 */
function markNotificationDismissed(taskId) {
  try {
    const dismissed = getDismissedNotifications();
    dismissed[taskId] = Date.now();
    localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(dismissed));
  } catch {
    // ignore
  }
}

/**
 * Check if a notification was recently dismissed (within last hour)
 */
function wasRecentlyDismissed(taskId) {
  try {
    const dismissed = getDismissedNotifications();
    const dismissedTime = dismissed[taskId];
    if (!dismissedTime) return false;
    
    const hourAgo = Date.now() - 60 * 60 * 1000;
    return dismissedTime > hourAgo;
  } catch {
    return false;
  }
}

// PUBLIC_INTERFACE
export class NotificationScheduler {
  /**
   * Initialize notification scheduler
   */
  constructor() {
    this.intervalId = null;
    this.tasks = [];
    this.onNotification = null;
    this.checkInterval = 10000; // Check every 10 seconds
  }

  /**
   * Start the background scheduler
   */
  start(tasks, onNotification) {
    this.tasks = tasks || [];
    this.onNotification = onNotification;

    // Clear any existing interval
    this.stop();

    // Start checking for due tasks
    this.intervalId = setInterval(() => {
      this.checkTasks();
    }, this.checkInterval);

    // Initial check
    this.checkTasks();
  }

  /**
   * Stop the background scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Stop any playing alarm sound
    this.stopAlarm();
  }

  /**
   * Update tasks list
   */
  updateTasks(tasks) {
    this.tasks = tasks || [];
  }

  /**
   * Check tasks and trigger notifications for due items
   */
  checkTasks() {
    const settings = getNotificationSettings();
    
    if (!settings.enabled) {
      return;
    }

    const now = Date.now();
    const notifyThreshold = settings.notifyMinutesBefore * 60 * 1000; // Convert to ms

    this.tasks.forEach((task) => {
      // Skip completed tasks
      if (task.completed || task.is_completed || task.done) {
        return;
      }

      // Skip tasks without due dates
      if (!task.due_at) {
        return;
      }

      // Skip recently dismissed notifications
      if (wasRecentlyDismissed(task.id)) {
        return;
      }

      const dueTime = new Date(task.due_at).getTime();
      if (Number.isNaN(dueTime)) {
        return;
      }

      const timeUntilDue = dueTime - now;
      
      // Trigger notification if task is due within threshold or overdue
      if (timeUntilDue <= notifyThreshold && timeUntilDue >= -60000) {
        // Only notify if due in next X minutes or up to 1 minute overdue
        this.triggerNotification(task, timeUntilDue, settings);
      }
    });
  }

  /**
   * Trigger notification for a task
   */
  async triggerNotification(task, timeUntilDue, settings) {
    // Play alarm sound if enabled
    if (settings.soundEnabled) {
      await this.playAlarm(settings.loopSound);
    }

    // Trigger on-screen notification
    if (this.onNotification) {
      const isOverdue = timeUntilDue < 0;
      const minutesUntil = Math.abs(Math.round(timeUntilDue / 60000));
      
      this.onNotification({
        task,
        isOverdue,
        minutesUntil,
        onDismiss: () => {
          markNotificationDismissed(task.id);
          this.stopAlarm();
        },
        onStop: () => {
          this.stopAlarm();
        },
      });
    }

    // Mark as notified to avoid repeated notifications within the check interval
    markNotificationDismissed(task.id);
  }

  /**
   * Play alarm sound
   * @param {boolean} loop - Whether to loop the alarm
   * @returns {Promise<boolean>}
   */
  async playAlarm(loop = false) {
    try {
      return await audioService.play("/assets/alarm.mp3", loop);
    } catch (e) {
      console.error("Failed to play alarm:", e);
      return false;
    }
  }

  /**
   * Stop alarm sound
   */
  stopAlarm() {
    audioService.stop();
  }

  /**
   * Check if alarm is currently playing
   * @returns {boolean}
   */
  isAlarmPlaying() {
    return audioService.getIsPlaying();
  }

  /**
   * Get current notification settings
   */
  getSettings() {
    return getNotificationSettings();
  }

  /**
   * Update notification settings
   */
  updateSettings(newSettings) {
    const current = getNotificationSettings();
    const updated = { ...current, ...newSettings };
    saveNotificationSettings(updated);
    return updated;
  }

  /**
   * Test alarm sound
   */
  async testAlarm() {
    try {
      // Play for 3 seconds then stop
      const success = await audioService.play("/assets/alarm.mp3", false);
      if (success) {
        setTimeout(() => {
          audioService.stop();
        }, 3000);
      }
      return success;
    } catch (e) {
      console.error("Test alarm failed:", e);
      return false;
    }
  }
}

// PUBLIC_INTERFACE
export const notificationScheduler = new NotificationScheduler();
