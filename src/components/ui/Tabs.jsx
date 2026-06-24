export function Tabs({ tabs = [], activeValue, onChange }) {
  return (
    <div className="tabs-preview" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`joker-cta-preview ghost ${tab.value === activeValue ? "is-selected" : ""}`.trim()}
          type="button"
          role="tab"
          aria-selected={tab.value === activeValue}
          onClick={() => onChange?.(tab.value)}
        >
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
