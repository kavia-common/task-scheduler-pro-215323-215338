/**
 * Background notification/alarm scheduler for task reminders.
 * Runs while the app is open and checks task due times.
 * Triggers alarm sound and on-screen alerts when tasks are due.
 * 
 * ENHANCED FEATURES:
 * - Desktop notifications via Web Notifications API
 * - Background tab reliability (visibilitychange event)
 * - Catch-up checks when tab regains focus
 * - Adaptive polling based on visibility
 */

import { audioService } from "./audioService";

const NOTIFICATION_SETTINGS_KEY = "task_scheduler_notification_settings";
const DISMISSED_NOTIFICATIONS_KEY = "task_scheduler_dismissed_notifications";
const LAST_CHECK_TIME_KEY = "task_scheduler_last_check_time";

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
          desktopNotifications: true, // NEW: desktop notifications enabled by default
        };
  } catch {
    return {
      enabled: true,
      soundEnabled: true,
      loopSound: false,
      notifyMinutesBefore: 5,
      repeatInterval: 0,
      desktopNotifications: true,
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

/**
 * Get last check time
 */
function getLastCheckTime() {
  try {
    const time = localStorage.getItem(LAST_CHECK_TIME_KEY);
    return time ? parseInt(time, 10) : Date.now();
  } catch {
    return Date.now();
  }
}

/**
 * Save last check time
 */
function saveLastCheckTime(time) {
  try {
    localStorage.setItem(LAST_CHECK_TIME_KEY, time.toString());
  } catch {
    // ignore
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
    this.checkInterval = 10000; // Check every 10 seconds when visible
    this.backgroundCheckInterval = 30000; // Check every 30 seconds when hidden (browsers throttle less aggressively)
    this.isPageVisible = !document.hidden;
    this.permissionState = "default";
    this.hasRequestedPermission = false;
    
    // Bind visibility change handler
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    
    // Check current notification permission
    if ("Notification" in window) {
      this.permissionState = Notification.permission;
    }
  }

  /**
   * Request desktop notification permission
   * @returns {Promise<string>} Permission state: "granted", "denied", or "default"
   */
  async requestPermission() {
    if (!("Notification" in window)) {
      console.warn("Desktop notifications not supported in this browser");
      return "denied";
    }

    if (Notification.permission === "granted") {
      this.permissionState = "granted";
      return "granted";
    }

    if (Notification.permission === "denied") {
      this.permissionState = "denied";
      return "denied";
    }

    try {
      this.hasRequestedPermission = true;
      const permission = await Notification.requestPermission();
      this.permissionState = permission;
      return permission;
    } catch (e) {
      console.error("Failed to request notification permission:", e);
      return "denied";
    }
  }

  /**
   * Show desktop notification
   * @param {object} task - Task object
   * @param {boolean} isOverdue - Whether task is overdue
   * @param {number} minutesUntil - Minutes until/past due
   */
  showDesktopNotification(task, isOverdue, minutesUntil) {
    if (!("Notification" in window)) {
      return null;
    }

    if (Notification.permission !== "granted") {
      return null;
    }

    try {
      const title = `⏰ Task Reminder: ${task.title || "Untitled"}`;
      const body = isOverdue
        ? `Overdue by ${minutesUntil} minutes${task.description ? `\n${task.description}` : ""}`
        : minutesUntil === 0
        ? `Due now!${task.description ? `\n${task.description}` : ""}`
        : `Due in ${minutesUntil} minutes${task.description ? `\n${task.description}` : ""}`;

      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `task-${task.id}`, // Prevents duplicate notifications
        requireInteraction: true, // Keep notification visible until user interacts
        silent: false, // Allow system sound (but we play our own)
      });

      // Handle notification click - focus window and show task
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Trigger the in-app notification/modal
        if (this.onNotification) {
          const settings = getNotificationSettings();
          const timeUntilDue = new Date(task.due_at).getTime() - Date.now();
          this.onNotification({
            task,
            isOverdue: timeUntilDue < 0,
            minutesUntil: Math.abs(Math.round(timeUntilDue / 60000)),
            reminderMinutesBefore: settings.notifyMinutesBefore,
            onDismiss: () => {
              markNotificationDismissed(task.id);
              this.stopAlarm();
            },
            onStop: () => {
              this.stopAlarm();
            },
          });
        }
      };

      return notification;
    } catch (e) {
      console.error("Failed to show desktop notification:", e);
      return null;
    }
  }

  /**
   * Handle page visibility changes (tab switching, minimizing)
   */
  handleVisibilityChange() {
    this.isPageVisible = !document.hidden;
    
    console.log(`Page visibility changed: ${this.isPageVisible ? "visible" : "hidden"}`);
    
    if (this.isPageVisible) {
      // Page became visible - perform catch-up check
      console.log("Performing catch-up check after page became visible");
      this.performCatchUpCheck();
      
      // Restart with foreground interval
      if (this.intervalId) {
        this.restartScheduler();
      }
    } else {
      // Page became hidden - switch to background interval
      if (this.intervalId) {
        this.restartScheduler();
      }
    }
  }

  /**
   * Perform catch-up check for missed notifications
   * This runs when the page regains focus
   */
  performCatchUpCheck() {
    const lastCheckTime = getLastCheckTime();
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTime;
    
    console.log(`Catch-up check: ${Math.round(timeSinceLastCheck / 1000)}s since last check`);
    
    // Perform immediate check
    this.checkTasks();
  }

  /**
   * Restart scheduler with appropriate interval based on visibility
   */
  restartScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    const interval = this.isPageVisible ? this.checkInterval : this.backgroundCheckInterval;
    console.log(`Restarting scheduler with ${interval}ms interval (${this.isPageVisible ? "foreground" : "background"})`);
    
    this.intervalId = setInterval(() => {
      this.checkTasks();
    }, interval);
  }

  /**
   * Start the background scheduler
   */
  start(tasks, onNotification) {
    this.tasks = tasks || [];
    this.onNotification = onNotification;

    // Clear any existing interval
    this.stop();

    // Listen for visibility changes
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    
    // Also listen for focus events as a backup
    window.addEventListener("focus", () => {
      if (this.isPageVisible) {
        this.performCatchUpCheck();
      }
    });

    // Start checking for due tasks with appropriate interval
    const interval = this.isPageVisible ? this.checkInterval : this.backgroundCheckInterval;
    this.intervalId = setInterval(() => {
      this.checkTasks();
    }, interval);

    // Initial check
    this.checkTasks();
    
    console.log(`Notification scheduler started (${this.isPageVisible ? "foreground" : "background"} mode)`);
  }

  /**
   * Stop the background scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Remove visibility listener
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    
    // Stop any playing alarm sound
    this.stopAlarm();
    
    console.log("Notification scheduler stopped");
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
    
    // Save check time for catch-up mechanism
    saveLastCheckTime(now);

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
        console.warn(`Task ${task.id} has invalid due_at:`, task.due_at);
        return;
      }

      // Calculate the reminder time (due time minus the notification threshold)
      const reminderTime = dueTime - notifyThreshold;
      const timeUntilReminder = reminderTime - now;
      const timeUntilDue = dueTime - now;
      
      // Trigger notification if:
      // 1. Current time has passed or reached the reminder time (timeUntilReminder <= 0)
      // 2. We haven't gone too far past the reminder time (within 2 minutes after reminder time)
      // 3. Task is not overdue by more than 5 minutes
      const twoMinutesInMs = 2 * 60 * 1000;
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      if (timeUntilReminder <= 0 && 
          timeUntilReminder >= -twoMinutesInMs &&
          timeUntilDue >= -fiveMinutesInMs) {
        // Log for debugging
        console.log(`Triggering notification for task "${task.title}":`, {
          reminderTime: new Date(reminderTime).toLocaleString(),
          dueTime: new Date(dueTime).toLocaleString(),
          minutesUntilDue: Math.round(timeUntilDue / 60000),
          notifyMinutesBefore: settings.notifyMinutesBefore,
          isPageVisible: this.isPageVisible
        });
        
        this.triggerNotification(task, timeUntilDue, settings);
      }
    });
  }

  /**
   * Trigger notification for a task
   */
  async triggerNotification(task, timeUntilDue, settings) {
    console.log(`Notification triggered for task "${task.title}" at ${new Date().toLocaleString()}`);
    
    const isOverdue = timeUntilDue < 0;
    const minutesUntil = Math.abs(Math.round(timeUntilDue / 60000));
    
    // Show desktop notification if enabled and permission granted
    if (settings.desktopNotifications && this.permissionState === "granted") {
      this.showDesktopNotification(task, isOverdue, minutesUntil);
    }
    
    // Play alarm sound if enabled
    if (settings.soundEnabled) {
      const soundPlayed = await this.playAlarm(settings.loopSound);
      console.log(`Alarm sound ${soundPlayed ? 'played successfully' : 'failed to play'}`);
    }

    // Trigger on-screen notification (modal)
    if (this.onNotification) {
      this.onNotification({
        task,
        isOverdue,
        minutesUntil,
        reminderMinutesBefore: settings.notifyMinutesBefore,
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
   * Get desktop notification permission state
   * @returns {string} "granted", "denied", or "default"
   */
  getPermissionState() {
    return this.permissionState;
  }

  /**
   * Check if we should prompt for permission
   * @returns {boolean}
   */
  shouldPromptForPermission() {
    return (
      "Notification" in window &&
      Notification.permission === "default" &&
      !this.hasRequestedPermission
    );
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

  /**
   * Clear all dismissed notifications (useful for testing)
   */
  clearDismissedNotifications() {
    try {
      localStorage.removeItem(DISMISSED_NOTIFICATIONS_KEY);
      console.log("Cleared all dismissed notifications");
    } catch (e) {
      console.error("Failed to clear dismissed notifications:", e);
    }
  }

  /**
   * Get status of a task's notification state
   */
  getTaskNotificationStatus(taskId) {
    const dismissed = getDismissedNotifications();
    const dismissedTime = dismissed[taskId];
    if (!dismissedTime) {
      return { dismissed: false };
    }
    
    const minutesAgo = Math.round((Date.now() - dismissedTime) / 60000);
    return {
      dismissed: true,
      dismissedAt: new Date(dismissedTime).toLocaleString(),
      minutesAgo: minutesAgo
    };
  }
}

// PUBLIC_INTERFACE
export const notificationScheduler = new NotificationScheduler();
