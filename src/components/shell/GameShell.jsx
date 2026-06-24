// Reusable Joker game shell.
// Game teams inject their own game UI into the viewport by passing children.
// Keep navigation, wallet, actions, betting, and responsive shell chrome here
// so individual games only own the playable canvas/scene and game-specific UI.
import { DesktopGameShell } from "./DesktopGameShell.jsx";
import { MobileGameShell } from "./MobileGameShell.jsx";

export function GameShell({ children }) {
  return (
    <>
      <DesktopGameShell>{children}</DesktopGameShell>
      <MobileGameShell>{children}</MobileGameShell>
    </>
  );
}
