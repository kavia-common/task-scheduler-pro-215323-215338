import React, { useMemo } from "react";

function formatDue(dueAt) {
  if (!dueAt) return "—";
  const dt = new Date(dueAt);
  if (Number.isNaN(dt.getTime())) return String(dueAt);
  return dt.toLocaleString();
}

function getPriorityPill(priority) {
  const p = String(priority || "").toLowerCase();
  if (p === "high") return { label: "HIGH", className: "pill pink" };
  if (p === "medium") return { label: "MED", className: "pill cyan" };
  if (p === "low") return { label: "LOW", className: "pill blue" };
  return { label: "—", className: "pill" };
}

function getStatusPill(task) {
  const done = Boolean(task.completed ?? task.is_completed ?? task.done);
  return done
    ? { label: "DONE", className: "pill lime" }
    : { label: "OPEN", className: "pill warn" };
}

// PUBLIC_INTERFACE
export default function TaskTable({ tasks, onEdit, onDelete, onToggleComplete }) {
  const rows = useMemo(() => tasks || [], [tasks]);

  if (!rows.length) {
    return (
      <div className="empty" role="status">
        <h3>No tasks found</h3>
        <p>Add a new task to start scheduling your missions.</p>
      </div>
    );
  }

  return (
    <table className="table" aria-label="Task list">
      <thead>
        <tr>
          <th style={{ width: "34%" }}>Task</th>
          <th style={{ width: "18%" }}>Due</th>
          <th style={{ width: "12%" }}>Priority</th>
          <th style={{ width: "12%" }}>Status</th>
          <th style={{ width: "24%" }} aria-label="Actions"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => {
          const pr = getPriorityPill(t.priority);
          const st = getStatusPill(t);
          return (
            <tr key={t.id ?? `${t.title}-${t.due_at}`}>
              <td>
                <div className="row-title">
                  <span>{t.title || "Untitled"}</span>
                </div>
                {t.description ? <div className="muted">{t.description}</div> : null}
              </td>
              <td>
                <div>{formatDue(t.due_at ?? t.dueAt ?? t.deadline)}</div>
              </td>
              <td>
                <span className={pr.className}>{pr.label}</span>
              </td>
              <td>
                <span className={st.className}>{st.label}</span>
              </td>
              <td>
                <div className="row-actions">
                  <button className="btn btn-small" onClick={() => onToggleComplete(t)}>
                    Toggle
                  </button>
                  <button className="btn btn-small btn-ghost" onClick={() => onEdit(t)}>
                    Edit
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => onDelete(t)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
