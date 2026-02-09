import React, { useEffect } from "react";

/**
 * Simple accessible modal.
 * Uses backdrop click to close; supports Esc key.
 */
// PUBLIC_INTERFACE
export default function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        // Close only when clicking backdrop, not inner modal content
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-small btn-ghost" onClick={onClose} aria-label="Close modal">
            Close
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
