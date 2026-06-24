# Game Shell

A clean, reusable casino application shell extracted from the Joker-DS codebase. It gives game teams a ready-made desktop and mobile shell with navigation, wallet controls, action buttons, a betting panel, and a central viewport for game content.

## Folder Structure

```text
src/
  components/
    shell/        DesktopGameShell, MobileGameShell, GameShell, GameViewport
    navigation/   top rail, side rail, mobile menu, game menu
    wallet/       balance and wallet controls
    actions/      profile, gift, message, notification controls
    betting/      bet mode, amount, cashout, profit, submit panel
    ui/           reusable base controls
  styles/
    tokens.css
    globals.css
    shell.css
    components.css
  data/
    navigationData.js
assets/
```

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The app switches between the desktop shell and mobile shell based on viewport width.

## Injecting A Game

`GameShell` is the main wrapper. Anything passed as children is rendered inside `GameViewport`, which is the injection point for future games.

```jsx
import { GameShell } from "./components/shell/GameShell.jsx";

export function App() {
  return (
    <GameShell>
      <div>Game Content Goes Here</div>
    </GameShell>
  );
}
```

For direct composition, you can also import `GameViewport`, `DesktopGameShell`, or `MobileGameShell` from `src/components/shell`.
