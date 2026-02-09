import React, { useEffect, useMemo, useReducer, useState } from "react";
import "./App.css";

import { apiRequest, getApiBaseUrl } from "./api/client";
import { authStorage } from "./auth/storage";
import { validateEmail, validatePassword, validateRequired } from "./utils/validation";
import ToastStack from "./components/ToastStack";
import Modal from "./components/Modal";
import TaskForm from "./components/TaskForm";
import Sidebar from "./components/Sidebar";
import TaskTable from "./components/TaskTable";
import AlarmNotification from "./components/AlarmNotification";
import NotificationSettings from "./components/NotificationSettings";
import { notificationScheduler } from "./services/notificationScheduler";

/**
 * NOTE ABOUT BACKEND INTEGRATION
 * The provided backend OpenAPI in this environment only exposes "/" health-check.
 * This frontend implements integration against a conventional auth/tasks REST API
 * (documented in src/api/contracts.js). When backend routes are available, update
 * src/api/contracts.js to match exactly.
 */

const ROUTES = {
  LOGIN: "login",
  SIGNUP: "signup",
  DASHBOARD: "dashboard",
};

const initialToasts = [];

/** @typedef {{ id: string, type: 'info'|'success'|'error'|'warn', title: string, message?: string, ttlMs?: number }} Toast */

function toastReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [action.toast, ...state].slice(0, 4);
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
function App() {
  /** "Route" is local state to avoid adding a router dependency. */
  const [route, setRoute] = useState(ROUTES.LOGIN);

  const [authToken, setAuthToken] = useState(() => authStorage.getToken());
  const isAuthed = Boolean(authToken);

  const [toasts, dispatchToast] = useReducer(toastReducer, initialToasts);

  const [me, setMe] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all|open|done
  const [filterPriority, setFilterPriority] = useState("all"); // all|low|medium|high

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState("create"); // create|edit
  const [activeTask, setActiveTask] = useState(null);

  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);

  const [alarmNotification, setAlarmNotification] = useState(null);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(() =>
    notificationScheduler.getSettings()
  );

  const apiBase = getApiBaseUrl();

  // PUBLIC_INTERFACE
  const addToast = (toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    dispatchToast({
      type: "ADD",
      toast: {
        id,
        ttlMs: 4000,
        ...toast,
      },
    });
  };

  const authedHeaders = useMemo(() => {
    if (!authToken) return {};
    return { Authorization: `Bearer ${authToken}` };
  }, [authToken]);

  useEffect(() => {
    // On initial load decide route
    if (isAuthed) setRoute(ROUTES.DASHBOARD);
  }, [isAuthed]);

  useEffect(() => {
    // Fetch current user if token exists (best-effort)
    let cancelled = false;

    async function loadMe() {
      if (!authToken) {
        setMe(null);
        return;
      }
      try {
        const res = await apiRequest({
          path: "/auth/me",
          method: "GET",
          headers: authedHeaders,
        });
        if (!cancelled) setMe(res);
      } catch (e) {
        // Token might be invalid; keep UI functional but force logout
        if (!cancelled) {
          setMe(null);
          authStorage.clearToken();
          setAuthToken(null);
          setRoute(ROUTES.LOGIN);
          addToast({
            type: "warn",
            title: "Session expired",
            message: "Please sign in again.",
          });
        }
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  useEffect(() => {
    if (!isAuthed) return;
    refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  useEffect(() => {
    // Start notification scheduler when authenticated with tasks
    if (isAuthed && tasks.length > 0) {
      notificationScheduler.start(tasks, (notification) => {
        setAlarmNotification(notification);
      });
    }

    return () => {
      // Stop scheduler on unmount or when logging out
      notificationScheduler.stop();
    };
  }, [isAuthed, tasks]);

  // Expose notificationScheduler to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.notificationScheduler = notificationScheduler;
      console.log("Debug: notificationScheduler available in console. Try: notificationScheduler.clearDismissedNotifications()");
    }
  }, []);

  // PUBLIC_INTERFACE
  const refreshTasks = async () => {
    setTasksError("");
    setTasksLoading(true);
    try {
      const res = await apiRequest({
        path: "/tasks",
        method: "GET",
        headers: authedHeaders,
      });

      // Accept either {items:[...]} or raw array
      const items = Array.isArray(res) ? res : res?.items ?? [];
      setTasks(items);
    } catch (e) {
      setTasksError(e.message || "Failed to load tasks.");
      addToast({
        type: "error",
        title: "Could not load tasks",
        message: e.message || "Try again.",
      });
    } finally {
      setTasksLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const onLogout = () => {
    authStorage.clearToken();
    setAuthToken(null);
    setMe(null);
    setRoute(ROUTES.LOGIN);
    addToast({ type: "info", title: "Logged out", message: "See you soon." });
  };

  // PUBLIC_INTERFACE
  const openCreateTask = () => {
    setActiveTask(null);
    setTaskModalMode("create");
    setTaskModalOpen(true);
  };

  // PUBLIC_INTERFACE
  const openEditTask = (task) => {
    setActiveTask(task);
    setTaskModalMode("edit");
    setTaskModalOpen(true);
  };

  // PUBLIC_INTERFACE
  const requestDeleteTask = (task) => {
    setConfirmDeleteTask(task);
  };

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tasks
      .filter((t) => {
        if (!q) return true;
        const hay = `${t.title ?? ""} ${t.description ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .filter((t) => {
        if (filterStatus === "all") return true;
        const done = Boolean(t.completed ?? t.is_completed ?? t.done);
        return filterStatus === "done" ? done : !done;
      })
      .filter((t) => {
        if (filterPriority === "all") return true;
        const p = (t.priority ?? "").toLowerCase();
        return p === filterPriority;
      });
  }, [tasks, query, filterStatus, filterPriority]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => Boolean(t.completed ?? t.is_completed ?? t.done)).length;
    const open = total - done;
    const high = tasks.filter((t) => (t.priority ?? "").toLowerCase() === "high").length;
    return { total, open, done, high };
  }, [tasks]);

  // PUBLIC_INTERFACE
  const handleAuth = async ({ mode, email, password, name }) => {
    const errors = [];

    if (!validateEmail(email)) errors.push("Enter a valid email.");
    if (!validatePassword(password)) errors.push("Password must be at least 8 characters.");
    if (mode === "signup" && !validateRequired(name)) errors.push("Name is required.");

    if (errors.length) {
      addToast({ type: "error", title: "Check your input", message: errors[0] });
      return;
    }

    try {
      const path = mode === "signup" ? "/auth/signup" : "/auth/login";
      const body = mode === "signup" ? { email, password, name } : { email, password };

      const res = await apiRequest({
        path,
        method: "POST",
        body,
      });

      const token = res?.access_token ?? res?.token ?? res?.jwt;
      if (!token) {
        throw new Error("No token received from server.");
      }

      authStorage.setToken(token);
      setAuthToken(token);
      setRoute(ROUTES.DASHBOARD);
      addToast({
        type: "success",
        title: mode === "signup" ? "Account created" : "Welcome back",
        message: "You're in. Loading your dashboard…",
      });
    } catch (e) {
      addToast({ type: "error", title: "Auth failed", message: e.message || "Try again." });
    }
  };

  // PUBLIC_INTERFACE
  const handleSaveTask = async (payload) => {
    // Basic validation
    const titleOk = validateRequired(payload.title);
    if (!titleOk) {
      addToast({ type: "error", title: "Missing title", message: "Task title is required." });
      return;
    }

    if (payload.due_at) {
      const due = new Date(payload.due_at);
      if (Number.isNaN(due.getTime())) {
        addToast({ type: "error", title: "Invalid date", message: "Due date format is invalid." });
        return;
      }
    }

    const isEdit = taskModalMode === "edit" && activeTask;
    const path = isEdit ? `/tasks/${activeTask.id}` : "/tasks";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await apiRequest({
        path,
        method,
        headers: authedHeaders,
        body: payload,
      });

      // Update local list optimistically using response if possible
      if (isEdit) {
        const updated = res ?? { ...activeTask, ...payload };
        setTasks((prev) => prev.map((t) => (t.id === activeTask.id ? updated : t)));
        addToast({ type: "success", title: "Task updated", message: "Changes saved." });
      } else {
        const created = res ?? { id: `${Date.now()}`, ...payload, completed: false };
        setTasks((prev) => [created, ...prev]);
        addToast({ type: "success", title: "Task added", message: "New mission queued." });
      }

      setTaskModalOpen(false);
      setActiveTask(null);
    } catch (e) {
      addToast({ type: "error", title: "Save failed", message: e.message || "Try again." });
    }
  };

  // PUBLIC_INTERFACE
  const handleToggleComplete = async (task) => {
    const current = Boolean(task.completed ?? task.is_completed ?? task.done);
    const next = !current;

    // Update local UI immediately for responsiveness
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: next, is_completed: next, done: next } : t))
    );

    try {
      await apiRequest({
        path: `/tasks/${task.id}`,
        method: "PATCH",
        headers: authedHeaders,
        body: { completed: next },
      });
      addToast({
        type: "success",
        title: next ? "Marked done" : "Reopened",
        message: next ? "Nice work. Mission complete." : "Back to the backlog.",
      });
    } catch (e) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: current, is_completed: current, done: current } : t
        )
      );
      addToast({ type: "error", title: "Update failed", message: e.message || "Try again." });
    }
  };

  // PUBLIC_INTERFACE
  const handleConfirmDelete = async () => {
    const task = confirmDeleteTask;
    if (!task) return;

    setConfirmDeleteTask(null);

    // Optimistic remove
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    try {
      await apiRequest({
        path: `/tasks/${task.id}`,
        method: "DELETE",
        headers: authedHeaders,
      });
      addToast({ type: "success", title: "Task deleted", message: "Removed from the timeline." });
    } catch (e) {
      addToast({ type: "error", title: "Delete failed", message: e.message || "Try again." });
      // Re-fetch to ensure consistency
      refreshTasks();
    }
  };

  const onSwitchAuthMode = () => {
    setRoute((r) => (r === ROUTES.LOGIN ? ROUTES.SIGNUP : ROUTES.LOGIN));
  };

  // PUBLIC_INTERFACE
  const handleDismissAlarm = () => {
    if (alarmNotification?.onDismiss) {
      alarmNotification.onDismiss();
    }
    setAlarmNotification(null);
  };

  // PUBLIC_INTERFACE
  const handleViewAlarmTask = () => {
    if (alarmNotification?.task) {
      openEditTask(alarmNotification.task);
    }
    setAlarmNotification(null);
  };

  // PUBLIC_INTERFACE
  const handleSaveNotificationSettings = (newSettings) => {
    const updated = notificationScheduler.updateSettings(newSettings);
    setNotificationSettings(updated);
    setNotificationSettingsOpen(false);
    addToast({
      type: "success",
      title: "Settings saved",
      message: "Notification preferences updated.",
    });
  };

  // PUBLIC_INTERFACE
  const handleTestAlarm = async () => {
    const success = await notificationScheduler.testAlarm();
    if (success) {
      addToast({
        type: "info",
        title: "Test alarm",
        message: "Playing for 3 seconds. If you heard it, sound is working!",
      });
    } else {
      addToast({
        type: "error",
        title: "Sound test failed",
        message: "Unable to play alarm sound. Check browser console.",
      });
    }
  };

  return (
    <div className="App">
      <div className="retro-grid" />

      <div className="topbar">
        <div className="container topbar-inner">
          <a className="brand" href="#home" onClick={(e) => e.preventDefault()}>
            <div className="brand-title">TASK SCHEDULER PRO</div>
            <div className="badge">RETRO</div>
          </a>

          <div className="topbar-actions">
            <button
              className="btn btn-small btn-ghost"
              onClick={() =>
                addToast({
                  type: "info",
                  title: "Backend target",
                  message: `API base: ${apiBase}`,
                })
              }
              aria-label="Show current backend API base URL"
            >
              API
            </button>

            {isAuthed ? (
              <>
                <button
                  className="btn btn-small btn-ghost"
                  onClick={() => setNotificationSettingsOpen(true)}
                  title="Notification settings"
                >
                  🔔
                </button>
                <button className="btn btn-small btn-ghost" onClick={refreshTasks}>
                  Refresh
                </button>
                <button className="btn btn-small btn-danger" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="btn btn-small btn-primary" onClick={onSwitchAuthMode}>
                {route === ROUTES.LOGIN ? "Create account" : "Sign in"}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isAuthed ? (
        <AuthScreen route={route} onAuth={handleAuth} onToggleMode={onSwitchAuthMode} />
      ) : (
        <div className="container">
          <div className="layout">
            <Sidebar
              me={me}
              stats={stats}
              filterStatus={filterStatus}
              filterPriority={filterPriority}
              setFilterStatus={setFilterStatus}
              setFilterPriority={setFilterPriority}
              onNewTask={openCreateTask}
            />

            <div className="main" role="main" aria-label="Task dashboard">
              <div className="main-header">
                <div className="header-left">
                  <h1 className="page-title">Mission Control</h1>
                  <div className="main-subtitle">
                    Track your timeline. Prioritize. Execute.{" "}
                    <span className="muted">({filteredTasks.length} shown)</span>
                  </div>
                </div>

                <div className="header-right">
                  <div className="search">
                    <input
                      className="input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search tasks…"
                      aria-label="Search tasks"
                    />
                  </div>
                  <button className="btn btn-primary" onClick={openCreateTask}>
                    + Add task
                  </button>
                </div>
              </div>

              {tasksError ? <div className="error-box">{tasksError}</div> : null}
              {tasksLoading ? <div className="notice">Loading tasks…</div> : null}

              <TaskTable
                tasks={filteredTasks}
                onEdit={openEditTask}
                onDelete={requestDeleteTask}
                onToggleComplete={handleToggleComplete}
              />
            </div>
          </div>
        </div>
      )}

      {taskModalOpen ? (
        <Modal
          title={taskModalMode === "edit" ? "Edit Task" : "Add Task"}
          onClose={() => {
            setTaskModalOpen(false);
            setActiveTask(null);
          }}
        >
          <TaskForm
            mode={taskModalMode}
            initialTask={activeTask}
            onCancel={() => {
              setTaskModalOpen(false);
              setActiveTask(null);
            }}
            onSave={handleSaveTask}
          />
        </Modal>
      ) : null}

      {confirmDeleteTask ? (
        <Modal title="Delete task?" onClose={() => setConfirmDeleteTask(null)}>
          <div className="muted">
            This will permanently remove: <strong>{confirmDeleteTask.title ?? "Untitled"}</strong>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setConfirmDeleteTask(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleConfirmDelete}>
              Delete
            </button>
          </div>
        </Modal>
      ) : null}

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => dispatchToast({ type: "REMOVE", id })}
      />

      {alarmNotification ? (
        <AlarmNotification
          notification={alarmNotification}
          onDismiss={handleDismissAlarm}
          onViewTask={handleViewAlarmTask}
        />
      ) : null}

      {notificationSettingsOpen ? (
        <Modal
          title="Notification Settings"
          onClose={() => setNotificationSettingsOpen(false)}
        >
          <NotificationSettings
            settings={notificationSettings}
            onSave={handleSaveNotificationSettings}
            onClose={() => setNotificationSettingsOpen(false)}
            onTestAlarm={handleTestAlarm}
          />
        </Modal>
      ) : null}
    </div>
  );
}

function AuthScreen({ route, onAuth, onToggleMode }) {
  const mode = route === ROUTES.SIGNUP ? "signup" : "login";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);

  const subtitle =
    mode === "signup"
      ? "Create your account to start scheduling missions."
      : "Sign in to continue your mission timeline.";

  const submitLabel = mode === "signup" ? "Create account" : "Sign in";

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onAuth({ mode, email, password, name });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap" role="main" aria-label="Authentication">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{mode === "signup" ? "Create Account" : "Sign In"}</h1>
          <p>{subtitle}</p>
        </div>

        <form className="form" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Retro Commander"
                autoComplete="name"
              />
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              autoComplete="email"
              inputMode="email"
            />
            <div className="hint">Use a real email format; we validate it client-side.</div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            <div className="hint">Minimum 8 characters.</div>
          </div>

          <div className="inline">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Working…" : submitLabel}
            </button>

            <button className="helper-link" type="button" onClick={onToggleMode}>
              {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>

          <div className="notice">
            Backend note: if your backend routes differ, update <code>src/api/contracts.js</code> to match.
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
