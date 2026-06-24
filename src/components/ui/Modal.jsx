export function Modal({ title, children, actions, open = true }) {
  if (!open) return null;

  return (
    <div className="modal-preview" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-preview-panel">
        {title && <h3>{title}</h3>}
        {children}
        {actions && <div className="modal-preview-actions">{actions}</div>}
      </div>
    </div>
  );
}
