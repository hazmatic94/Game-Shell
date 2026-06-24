export function Badge({ children, tone = "default", className = "" }) {
  return <span className={`status-pill status-pill--${tone} ${className}`.trim()}>{children}</span>;
}
