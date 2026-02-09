/**
 * Background notification/alarm scheduler for task reminders.
 * Runs while the app is open and checks task due times.
 * Triggers alarm sound and on-screen alerts when tasks are due.
 */

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
          notifyMinutesBefore: 5,
          repeatInterval: 0, // 0 = no repeat
        };
  } catch {
    return {
      enabled: true,
      soundEnabled: true,
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

/**
 * Generate alarm sound using Web Audio API
 */
function generateAlarmSound(duration = 2000) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a beeping pattern (alternating frequencies)
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    // Fade in/out for smoother sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + duration / 1000 - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
    
    // Create alternating beep pattern
    setTimeout(() => {
      try {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = "sine";
        gain2.gain.setValueAtTime(0, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      } catch {
        // ignore
      }
    }, 400);
    
    return true;
  } catch (e) {
    console.error("Failed to generate alarm sound:", e);
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
  triggerNotification(task, timeUntilDue, settings) {
    // Play alarm sound if enabled
    if (settings.soundEnabled) {
      generateAlarmSound(1500);
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
        },
      });
    }

    // Mark as notified to avoid repeated notifications within the check interval
    markNotificationDismissed(task.id);
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
  testAlarm() {
    return generateAlarmSound(1500);
  }
}

// PUBLIC_INTERFACE
export const notificationScheduler = new NotificationScheduler();
