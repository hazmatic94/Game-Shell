export function IconButton({ children, label, className = "", ...props }) {
  return (
    <button className={`joker-action-item ${className}`.trim()} type="button" aria-label={label} {...props}>
      {children}
    </button>
  );
}
