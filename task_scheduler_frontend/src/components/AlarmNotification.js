import React from "react";

/**
 * Alarm notification modal that appears when a task is due.
 * Displays prominently with task details and action buttons.
 */
// PUBLIC_INTERFACE
export default function AlarmNotification({ notification, onDismiss, onViewTask, onSnooze }) {
  if (!notification) return null;

  const { task, isOverdue, minutesUntil } = notification;

  const getTimeText = () => {
    if (isOverdue) {
      return minutesUntil === 0 ? "Due now!" : `Overdue by ${minutesUntil} min`;
    }
    return minutesUntil === 0 ? "Due now!" : `Due in ${minutesUntil} min`;
  };

  const getPriorityClass = () => {
    const p = (task.priority || "").toLowerCase();
    if (p === "high") return "pink";
    if (p === "medium") return "cyan";
    if (p === "low") return "blue";
    return "cyan";
  };

  return (
    <div className="alarm-modal-backdrop" role="alert" aria-live="assertive">
      <div className="alarm-modal">
        <div className="alarm-header">
          <div className="alarm-icon">🔔</div>
          <div>
            <h2 className="alarm-title">Task Reminder</h2>
            <div className={`alarm-time ${isOverdue ? "overdue" : ""}`}>{getTimeText()}</div>
          </div>
        </div>

        <div className="alarm-body">
          <div className="alarm-task-title">{task.title || "Untitled Task"}</div>
          {task.description ? (
            <div className="alarm-task-description">{task.description}</div>
          ) : null}
          <div className="alarm-task-meta">
            <span className={`pill ${getPriorityClass()}`}>
              {(task.priority || "medium").toUpperCase()}
            </span>
            {task.due_at ? (
              <span className="alarm-due-date">
                {new Date(task.due_at).toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>

        <div className="alarm-actions">
          <button className="btn btn-ghost" onClick={onDismiss}>
            Dismiss
          </button>
          <button className="btn btn-primary" onClick={onViewTask}>
            View Task
          </button>
        </div>
      </div>
    </div>
  );
}
