import { BetPanel } from "../betting/BetPanel.jsx";
import { SideRail } from "../navigation/SideRail.jsx";
import { TopRail } from "../navigation/TopRail.jsx";
import { GameViewport } from "./GameViewport.jsx";

export function DesktopGameShell({ children }) {
  return (
    <div className="joker-game-shell">
      <TopRail />
      <div className="joker-game-shell-body">
        <SideRail />
        <GameViewport>{children}</GameViewport>
        <aside className="joker-game-shell-betting"><BetPanel /></aside>
      </div>
    </div>
  );
}
