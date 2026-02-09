import React from "react";

// PUBLIC_INTERFACE
export default function Sidebar({
  me,
  stats,
  filterStatus,
  filterPriority,
  setFilterStatus,
  setFilterPriority,
  onNewTask,
}) {
  return (
    <aside className="sidebar" aria-label="Sidebar">
      <h2>Operator</h2>
      <div className="meta">
        <div>
          <strong>{me?.name || "Unknown"}</strong>
        </div>
        <div className="muted">{me?.email || "—"}</div>
      </div>

      <button className="btn btn-primary" onClick={onNewTask}>
        + New task
      </button>

      <div className="sidebar-section">
        <h2>Stats</h2>
        <div className="kpi-grid">
          <div className="kpi">
            <div className="label">TOTAL</div>
            <div className="value blue">{stats.total}</div>
          </div>
          <div className="kpi">
            <div className="label">OPEN</div>
            <div className="value cyan">{stats.open}</div>
          </div>
          <div className="kpi">
            <div className="label">DONE</div>
            <div className="value lime">{stats.done}</div>
          </div>
          <div className="kpi">
            <div className="label">HIGH</div>
            <div className="value pink">{stats.high}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h2>Filters</h2>

        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            className="select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="hint">Priority colors: low=blue, medium=cyan, high=pink.</div>
        </div>
      </div>

      <div className="sidebar-section">
        <h2>Tips</h2>
        <div className="meta">
          Use <span className="pill cyan">PATCH</span> toggle for quick completion updates and{" "}
          <span className="pill pink">PUT</span> for edits.
        </div>
      </div>
    </aside>
  );
}
