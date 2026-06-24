import { BetPanel } from "../betting/BetPanel.jsx";
import { MobileMenu } from "../navigation/MobileMenu.jsx";
import { GameViewport } from "./GameViewport.jsx";

export function MobileGameShell({ children }) {
  return (
    <div className="joker-mobile-game-shell">
      <MobileMenu />
      <div className="joker-mobile-game-content">
        <GameViewport>{children}</GameViewport>
        <div className="joker-mobile-game-betting"><BetPanel /></div>
      </div>
    </div>
  );
}
