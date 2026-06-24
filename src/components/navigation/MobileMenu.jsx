import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ActionGroup } from "../actions/ActionGroup.jsx";
import { WalletControl } from "../wallet/WalletControl.jsx";
import { JokerLogo } from "./JokerLogo.jsx";
import { SideRail } from "./SideRail.jsx";

export function MobileMenu({ open = false }) {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <nav className={`joker-mobile-nav ${isOpen ? "is-open" : ""}`.trim()} data-mobile-nav>
      <div className="joker-mobile-nav-bar">
        <JokerLogo />
        <button
          className="joker-mobile-nav-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          data-mobile-nav-toggle
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="joker-mobile-nav-toggle-icon joker-mobile-nav-toggle-icon--menu" aria-hidden="true"><Menu /></span>
          <span className="joker-mobile-nav-toggle-icon joker-mobile-nav-toggle-icon--close" aria-hidden="true"><X /></span>
        </button>
      </div>
      <div className="joker-mobile-nav-panel">
        <div className="joker-mobile-nav-panel-inner">
          <section className="joker-mobile-nav-section joker-mobile-nav-actions">
            <WalletControl />
            <ActionGroup />
          </section>
          <div className="joker-mobile-nav-scroll"><SideRail /></div>
        </div>
      </div>
    </nav>
  );
}
