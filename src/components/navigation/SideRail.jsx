import { gameMenuItems, shellRailSections } from "../../data/navigationData.js";
import { GameMenuDropdown } from "./GameMenuDropdown.jsx";
import { RailNavItem } from "./RailNavItem.jsx";
import { RailSearch } from "./RailSearch.jsx";

export function SideRail({ sections = shellRailSections }) {
  return (
    <aside className="joker-product-rail" aria-label="Game navigation">
      <div className="joker-product-rail-search"><RailSearch /></div>
      <div className="joker-product-rail-scroll">
        <section className="joker-product-rail-section">
          {sections.home.map((item) => <RailNavItem key={item.label} item={item} />)}
        </section>
        <section className="joker-product-rail-section">
          <GameMenuDropdown label="Originals" items={gameMenuItems} />
          {sections.games.slice(1).map((item) => <RailNavItem key={item.label} item={item} />)}
        </section>
      </div>
      <footer className="joker-product-rail-footer">
        {sections.support.map((item) => <RailNavItem key={item.label} item={item} />)}
      </footer>
    </aside>
  );
}
