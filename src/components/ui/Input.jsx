export function Input({ label, prefix, suffix, message, className = "", ...props }) {
  return (
    <label className={`joker-input-field ${className}`.trim()}>
      {label && <span className="joker-input-label">{label}</span>}
      <span className="joker-input-control">
        {prefix && <span className="joker-input-icon">{prefix}</span>}
        <input {...props} />
        {suffix && <span className="joker-input-icon trailing">{suffix}</span>}
      </span>
      {message && <span className="joker-input-message">{message}</span>}
    </label>
  );
}
