import { navigationIconAssets } from "../../data/navigationData.js";

export function RailNavItem({ item, icon, selected = false, className = "" }) {
  return (
    <a
      className={`joker-product-rail-item ${selected ? "is-selected" : ""} ${className}`.trim()}
      href={item.href || "#"}
      aria-current={selected ? "page" : undefined}
      data-product-rail-item
    >
      {icon || <NavigationIcon name={item.icon} label={item.label} />}
      <span>{item.label}</span>
    </a>
  );
}

function NavigationIcon({ name }) {
  const src = navigationIconAssets[name];

  if (!src) return null;

  return (
    <span className="joker-product-rail-game-icon" aria-hidden="true">
      <img className="nav-custom-icon" src={src} alt="" />
    </span>
  );
}
