import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { navigationIconAssets } from "../../data/navigationData.js";

export function GameMenuDropdown({ label = "Originals", items = [], value, onValueChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value || items.find((item) => item.selected)?.value || items[0]?.value);
  const selectedValue = value || internalValue;
  const selectedItem = items.find((item) => item.value === selectedValue) || items[0];

  const chooseItem = (item) => {
    setInternalValue(item.value);
    onValueChange?.(item.value);
  };

  return (
    <div className={`joker-game-menu ${isOpen ? "is-open" : ""}`.trim()} data-game-menu>
      <button
        className="joker-game-menu-trigger"
        type="button"
        aria-expanded={isOpen}
        data-game-menu-toggle
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="joker-game-menu-label">
          <MenuIcon item={selectedItem} className="joker-game-menu-trigger-icon" />
          <span>{label}</span>
        </span>
        <span className="joker-game-menu-chevron" aria-hidden="true"><ChevronDown /></span>
      </button>
      <div className="joker-game-menu-list" role="menu">
        {items.map((item) => (
          <button
            key={item.value || item.label}
            className={`joker-game-menu-option ${selectedValue === item.value ? "is-selected" : ""}`.trim()}
            type="button"
            role="menuitemradio"
            aria-checked={selectedValue === item.value}
            data-game-menu-option
            onClick={() => chooseItem(item)}
          >
            <MenuIcon item={item} className="joker-game-menu-option-icon" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MenuIcon({ item, className }) {
  const src = item ? navigationIconAssets[item.icon] : null;

  if (!src) return null;

  return (
    <span className={className} aria-hidden="true">
      <img className="nav-custom-icon" src={src} alt="" />
    </span>
  );
}
