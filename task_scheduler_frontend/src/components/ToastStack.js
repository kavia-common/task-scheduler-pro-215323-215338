import React, { useEffect } from "react";

/**
 * Toast stack (bottom-right).
 * Auto-dismiss based on ttlMs.
 */
// PUBLIC_INTERFACE
export default function ToastStack({ toasts, onDismiss }) {
  useEffect(() => {
    const timers = toasts.map((t) => {
      const ttl = Number(t.ttlMs ?? 0);
      if (!ttl) return null;
      return window.setTimeout(() => onDismiss(t.id), ttl);
    });

    return () => {
      timers.forEach((id) => {
        if (id) window.clearTimeout(id);
      });
    };
  }, [toasts, onDismiss]);

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || "info"}`} role="status">
          <div>
            <div className="title">{t.title}</div>
            {t.message ? <div className="message">{t.message}</div> : null}
          </div>
          <button className="close" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
