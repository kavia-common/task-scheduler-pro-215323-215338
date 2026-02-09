/**
 * Mock task storage for frontend-only mode.
 * Stores tasks in localStorage without backend dependency.
 */

const TASKS_KEY = "task_scheduler_tasks";

/**
 * Get tasks for current user
 */
function getUserTasks(userId) {
  try {
    const tasksJson = localStorage.getItem(TASKS_KEY);
    const allTasks = tasksJson ? JSON.parse(tasksJson) : [];
    return allTasks.filter((t) => t.userId === userId);
  } catch {
    return [];
  }
}

/**
 * Save all tasks
 */
function saveAllTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export const mockTasks = {
  /**
   * Get all tasks for current user
   */
  getTasks(userId) {
    return getUserTasks(userId);
  },

  /**
   * Create a new task
   */
  createTask(userId, taskData) {
    try {
      const tasksJson = localStorage.getItem(TASKS_KEY);
      const allTasks = tasksJson ? JSON.parse(tasksJson) : [];

      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: taskData.title,
        description: taskData.description || null,
        due_at: taskData.due_at || null,
        priority: taskData.priority || "medium",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      allTasks.push(newTask);
      saveAllTasks(allTasks);

      return newTask;
    } catch (e) {
      throw new Error("Failed to create task");
    }
  },

  /**
   * Update a task
   */
  updateTask(userId, taskId, updates) {
    try {
      const tasksJson = localStorage.getItem(TASKS_KEY);
      const allTasks = tasksJson ? JSON.parse(tasksJson) : [];

      const taskIndex = allTasks.findIndex((t) => t.id === taskId && t.userId === userId);
      if (taskIndex === -1) {
        throw new Error("Task not found");
      }

      allTasks[taskIndex] = {
        ...allTasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      saveAllTasks(allTasks);
      return allTasks[taskIndex];
    } catch (e) {
      throw new Error(e.message || "Failed to update task");
    }
  },

  /**
   * Patch a task (partial update)
   */
  patchTask(userId, taskId, patch) {
    return this.updateTask(userId, taskId, patch);
  },

  /**
   * Delete a task
   */
  deleteTask(userId, taskId) {
    try {
      const tasksJson = localStorage.getItem(TASKS_KEY);
      const allTasks = tasksJson ? JSON.parse(tasksJson) : [];

      const taskIndex = allTasks.findIndex((t) => t.id === taskId && t.userId === userId);
      if (taskIndex === -1) {
        throw new Error("Task not found");
      }

      allTasks.splice(taskIndex, 1);
      saveAllTasks(allTasks);

      return { ok: true };
    } catch (e) {
      throw new Error(e.message || "Failed to delete task");
    }
  },

  /**
   * Clear all tasks for a user (for testing)
   */
  clearUserTasks(userId) {
    try {
      const tasksJson = localStorage.getItem(TASKS_KEY);
      const allTasks = tasksJson ? JSON.parse(tasksJson) : [];
      const filtered = allTasks.filter((t) => t.userId !== userId);
      saveAllTasks(filtered);
    } catch {
      // ignore
    }
  },
};
