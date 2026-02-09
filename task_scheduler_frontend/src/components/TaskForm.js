import React, { useMemo, useState } from "react";
import { validateRequired } from "../utils/validation";

function toInputDatetimeValue(isoLike) {
  if (!isoLike) return "";
  const dt = new Date(isoLike);
  if (Number.isNaN(dt.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

// PUBLIC_INTERFACE
export default function TaskForm({ mode, initialTask, onSave, onCancel }) {
  const initial = useMemo(() => {
    const t = initialTask || {};
    return {
      title: t.title ?? "",
      description: t.description ?? "",
      due_at: toInputDatetimeValue(t.due_at ?? t.dueAt ?? t.deadline),
      priority: (t.priority ?? "medium").toLowerCase(),
    };
  }, [initialTask]);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [dueAt, setDueAt] = useState(initial.due_at);
  const [priority, setPriority] = useState(initial.priority);

  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!validateRequired(title)) {
      setLocalError("Title is required.");
      return;
    }

    setSubmitting(true);
    try {
      // Normalize payload shape expected by backend
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        priority: priority || "medium",
      };
      await onSave(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={onSubmit} aria-label="Task form">
      {localError ? <div className="error-box">{localError}</div> : null}

      <div className="form-grid">
        <div className="field span-2">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Submit retro UI draft"
            autoFocus
          />
        </div>

        <div className="field span-2">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes, links, details…"
          />
        </div>

        <div className="field">
          <label htmlFor="dueAt">Due</label>
          <input
            id="dueAt"
            className="input"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            type="datetime-local"
          />
          <div className="hint">Stored as ISO timestamp (UTC) when sent to backend.</div>
        </div>

        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            className="select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "edit" ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}
