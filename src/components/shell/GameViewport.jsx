export function GameViewport({ children }) {
  return (
    <main className="joker-game-shell-stage" aria-label="Game stage">
      {children || <div className="joker-game-shell-empty-stage" aria-label="Game canvas" />}
    </main>
  );
}
