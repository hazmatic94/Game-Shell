export function Button({ children, variant = "primary", size = "medium", loading = false, className = "", ...props }) {
  const classes = ["joker-cta-preview", variant, size, loading && "is-loading", className].filter(Boolean).join(" ");

  return (
    <button className={classes} type="button" aria-busy={loading || undefined} {...props}>
      <span>{children}</span>
    </button>
  );
}
