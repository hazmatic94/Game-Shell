export function BetModeToggle({ value = "manual", onChange }) {
  return (
    <div className="joker-bet-mode-switch" role="group" aria-label="Bet mode">
      {["manual", "auto"].map((mode) => (
        <button
          key={mode}
          className={`joker-cta-preview secondary joker-bet-mode ${value === mode ? "is-selected" : ""}`.trim()}
          type="button"
          onClick={() => onChange?.(mode)}
        >
          <span>{mode === "manual" ? "Manual" : "Auto"}</span>
        </button>
      ))}
    </div>
  );
}
