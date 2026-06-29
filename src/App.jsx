import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BetAmountInput, GameShell, Input, Select } from "@joker/design-system";

const jokerCoin = new URL("../assets/jokerCoin.svg", import.meta.url).href;
const jokerIcon = new URL("../assets/iconJoker.svg", import.meta.url).href;
const goldIcon = new URL("../assets/gold.png", import.meta.url).href;
const dynamiteIcon = new URL("../assets/dynamite.png", import.meta.url).href;
const gridTileCount = 24;
const minTileAmount = 1;
const maxTileAmount = gridTileCount;

const gameOptions = [
  ...Array.from({ length: maxTileAmount }, (_, index) => {
    const value = String(index + 1);
    return { value, label: value };
  }),
];
const mineTiles = Array.from({ length: 25 }, (_, index) => index + 1);
const tileStatePreview = ["default", "gold", "dynamite"];
const tileStateAssets = {
  default: { label: "Joker", src: jokerIcon },
  joker: { label: "Joker", src: jokerIcon },
  gold: { label: "Gold nugget", src: goldIcon },
  dynamite: { label: "Dynamite", src: dynamiteIcon },
};
const minesNavigationPreset = {
  defaultValue: "mines",
  game: { label: "Mines", icon: "mines" },
  openMenuLabel: "Originals",
  selectedValue: "mines",
};

function clampTileAmount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return minTileAmount;
  }

  return Math.min(Math.max(numericValue, minTileAmount), maxTileAmount);
}

function calculateMultiplier(mines, revealedCount) {
  if (revealedCount === 0) return 1;

  return 1 + mines * 0.25 + revealedCount * 0.16;
}

function createRoundBoard(minesCount) {
  const tileIndexes = mineTiles.map((tile) => tile - 1);
  const shuffledIndexes = [...tileIndexes];

  for (let index = shuffledIndexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledIndexes[index], shuffledIndexes[swapIndex]] = [
      shuffledIndexes[swapIndex],
      shuffledIndexes[index],
    ];
  }

  const dynamiteIndexes = new Set(shuffledIndexes.slice(0, minesCount));
  const jokerIndex = shuffledIndexes.find((index) => !dynamiteIndexes.has(index));

  return tileIndexes.map((index) => {
    if (dynamiteIndexes.has(index)) return "dynamite";
    if (index === jokerIndex) return "joker";

    return "gold";
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatBalance(value) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function App() {
  const [bettingMode, setBettingMode] = useState("manual");
  const [betAmount, setBetAmount] = useState("");
  const [balance, setBalance] = useState(150000);
  const [board, setBoard] = useState([]);
  const [message, setMessage] = useState("");
  const [mines, setMines] = useState("1");
  const [revealedTiles, setRevealedTiles] = useState([]);
  const [freshRevealedTiles, setFreshRevealedTiles] = useState([]);
  const [roundStatus, setRoundStatus] = useState("idle");

  const activeMineCount = clampTileAmount(mines);
  const revealedCount = revealedTiles.length;
  const gameInPlay = roundStatus === "active";
  const multiplier = calculateMultiplier(activeMineCount, revealedCount);
  const nextMultiplier = calculateMultiplier(activeMineCount, revealedCount + 1);
  const numericBetAmount = Number(betAmount) || 0;
  const currentProfit = revealedCount > 0 ? numericBetAmount * multiplier : 0;
  const nextProfit = numericBetAmount * nextMultiplier;

  useEffect(() => {
    const submitButton = document.querySelector(".joker-bet-submit");

    if (submitButton) {
      submitButton.textContent = gameInPlay
        ? `Cashout ${formatCurrency(currentProfit)}`
        : bettingMode === "auto"
          ? "Auto Bet"
          : "Place Bet";
      submitButton.classList.toggle("is-cashout", gameInPlay);
    }
  }, [bettingMode, currentProfit, gameInPlay]);

  useEffect(() => {
    const openMinesMenu = () => {
      const minesMenu = [...document.querySelectorAll(".joker-product-rail-game-menu")].find(
        (menu) =>
          menu
            .querySelector(".joker-product-rail-menu-label")
            ?.textContent?.trim() === minesNavigationPreset.openMenuLabel
      );
      const trigger = minesMenu?.querySelector(".joker-product-rail-menu-trigger");

      if (minesMenu && trigger && !minesMenu.classList.contains("is-open")) {
        trigger.click();
      }
    };

    openMinesMenu();
    const frameId = window.requestAnimationFrame(openMinesMenu);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function handleTileClick(tile) {
    if (roundStatus !== "active" || revealedTiles.includes(tile)) {
      return;
    }

    const tileContent = board[tile - 1];

    setRevealedTiles((currentTiles) =>
      currentTiles.includes(tile) ? currentTiles : [...currentTiles, tile]
    );
    setFreshRevealedTiles((currentTiles) =>
      currentTiles.includes(tile) ? currentTiles : [...currentTiles, tile]
    );

    if (tileContent === "dynamite") {
      setRoundStatus("lost");
      setMessage("");
    }

    window.setTimeout(() => {
      setFreshRevealedTiles((currentTiles) =>
        currentTiles.filter((currentTile) => currentTile !== tile)
      );
    }, 1500);
  }

  function handleBetAction() {
    if (gameInPlay) {
      setBalance((currentBalance) => currentBalance + currentProfit);
      setRoundStatus("idle");
      setBoard([]);
      setRevealedTiles([]);
      setFreshRevealedTiles([]);
      setMessage("");
      return;
    }

    if (numericBetAmount <= 0 || numericBetAmount > balance) {
      setMessage("Enter a valid bet amount");
      return;
    }

    const nextBoard = createRoundBoard(activeMineCount);

    setBalance((currentBalance) => currentBalance - numericBetAmount);
    setBoard(nextBoard);
    setRoundStatus("active");
    setRevealedTiles([]);
    setFreshRevealedTiles([]);
    setMessage("");
  }

  return (
    <>
      <style>
        {`
          .joker-mines-stage {
            display: grid;
            width: 100%;
            height: 100%;
            min-height: 0;
            place-items: center;
            overflow: hidden;
            background:
              radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--joker-gold-400) 4%, transparent), transparent 34%),
              var(--joker-black-700);
            padding: clamp(var(--spacing-24), 5vmin, var(--spacing-64));
          }

          .joker-mines-grid {
            display: grid;
            width: min(760px, 82vmin, calc(100% - var(--spacing-32)));
            aspect-ratio: 1;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: var(--spacing-12);
            overflow: visible;
          }

          .joker-mines-tile {
            appearance: none;
            position: relative;
            display: grid;
            min-width: 0;
            aspect-ratio: 1;
            place-items: center;
            overflow: visible;
            border: 0;
            border-radius: calc(var(--radius-sm) + var(--radius-sm));
            background: transparent;
            box-shadow: none;
            cursor: pointer;
            padding: 0;
            transition:
              transform var(--motion-fast) var(--ease-standard);
          }

          .joker-mines-tile-surface {
            position: absolute;
            inset: 0;
            z-index: 0;
            display: grid;
            place-items: center;
            overflow: hidden;
            border: var(--border-width-default) solid var(--joker-black-200);
            border-radius: inherit;
            background: var(--joker-black-700);
            box-shadow: none;
            transition:
              background-color var(--motion-fast) var(--ease-standard),
              border-color var(--motion-fast) var(--ease-standard),
              box-shadow var(--motion-fast) var(--ease-standard),
              transform var(--motion-fast) var(--ease-standard);
          }

          .joker-mines-tile-icon {
            position: relative;
            z-index: 1;
            display: block;
            width: clamp(var(--spacing-24), 36%, var(--spacing-64));
            height: auto;
            opacity: 0.9;
            pointer-events: none;
            user-select: none;
          }

          .joker-mines-tile--default:not(.joker-mines-tile--revealed) .joker-mines-tile-surface::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 0;
            border-radius: inherit;
            background: linear-gradient(
              135deg,
              rgb(0 0 0 / 0.04) 0%,
              rgb(255 255 255 / 0.12) 49%,
              rgb(0 0 0 / 0.04) 100%
            );
            opacity: 0.2;
            pointer-events: none;
          }

          .joker-mines-tile-icon--gold {
            width: clamp(calc(var(--spacing-64) - var(--spacing-8)), 68%, calc(var(--spacing-64) + var(--spacing-40)));
            opacity: 1;
          }

          .joker-mines-tile-icon--dynamite {
            width: clamp(var(--spacing-64), 76%, calc(var(--spacing-64) + var(--spacing-64)));
            opacity: 1;
          }

          .joker-mines-tile--dynamite {
            z-index: 1;
          }

          .joker-mines-tile--dynamite .joker-mines-tile-surface {
            border-color: rgb(255 70 70 / 0.75);
            background:
              radial-gradient(circle at center, rgb(255 60 60 / 0.12), transparent 70%),
              var(--joker-black-700);
            box-shadow:
              0 0 0 var(--border-width-default) rgb(255 70 70 / 0.2),
              0 0 var(--spacing-24) rgb(255 70 70 / 0.25),
              inset 0 0 calc(var(--spacing-16) + var(--spacing-4)) rgb(255 70 70 / 0.08);
          }

          .joker-mines-tile--dynamite .joker-mines-tile-icon {
            filter:
              drop-shadow(calc(var(--spacing-8) * -1) calc(var(--spacing-8) * -1) var(--spacing-12) rgb(255 150 56 / 0.34))
              drop-shadow(0 var(--spacing-4) var(--spacing-8) rgb(0 0 0 / 0.4));
          }

          .joker-mines-tile:hover {
            transform: translateY(calc(var(--border-width-default) * -1));
          }

          .joker-mines-tile:hover .joker-mines-tile-surface {
            border-color: color-mix(in srgb, var(--joker-gold-400) 38%, var(--joker-black-300));
            background: color-mix(in srgb, var(--joker-black-700) 88%, var(--joker-gold-1000));
            box-shadow: none;
          }

          .joker-mines-tile--dynamite:hover .joker-mines-tile-surface,
          .joker-mines-tile--dynamite.joker-mines-tile--fresh-reveal .joker-mines-tile-surface {
            border-color: rgb(255 70 70 / 0.75);
            background:
              radial-gradient(circle at center, rgb(255 60 60 / 0.12), transparent 70%),
              var(--joker-black-700);
          }

          .joker-mines-tile--revealed {
            z-index: 10;
            cursor: default;
          }

          .joker-mines-tile--revealed .joker-mines-tile-surface {
            border-color: color-mix(in srgb, var(--joker-gold-400) 72%, var(--joker-black-400));
            background: var(--joker-black-700);
            filter: drop-shadow(0 0 var(--spacing-12) color-mix(in srgb, var(--joker-gold-400) 24%, transparent));
            transform: translateY(var(--border-width-default));
          }

          .joker-mines-tile--revealed:hover {
            transform: none;
          }

          .joker-mines-tile--revealed:hover .joker-mines-tile-surface {
            border-color: color-mix(in srgb, var(--joker-gold-400) 72%, var(--joker-black-400));
            background: var(--joker-black-700);
            filter: drop-shadow(0 0 var(--spacing-12) color-mix(in srgb, var(--joker-gold-400) 24%, transparent));
          }

          .joker-mines-tile--fresh-reveal .joker-mines-tile-surface {
            border-color: var(--joker-gold-400);
            filter: drop-shadow(0 0 var(--spacing-16) color-mix(in srgb, var(--joker-gold-400) 34%, transparent));
            transition: none;
          }

          .joker-mines-tile--fresh-reveal {
            animation: joker-mines-tile-press 420ms var(--ease-standard) both;
          }

          .joker-mines-tile--dynamite.joker-mines-tile--revealed .joker-mines-tile-surface,
          .joker-mines-tile--dynamite.joker-mines-tile--revealed:hover .joker-mines-tile-surface,
          .joker-mines-tile--dynamite.joker-mines-tile--revealed:active .joker-mines-tile-surface {
            border-color: rgb(255 70 70 / 0.75);
            background:
              radial-gradient(circle at center, rgb(255 60 60 / 0.12), transparent 70%),
              var(--joker-black-700);
            box-shadow:
              0 0 0 var(--border-width-default) rgb(255 70 70 / 0.2),
              0 0 var(--spacing-24) rgb(255 70 70 / 0.25),
              inset 0 0 calc(var(--spacing-16) + var(--spacing-4)) rgb(255 70 70 / 0.08);
            filter: none;
          }

          .joker-mines-tile--dynamite.joker-mines-tile--revealed .joker-mines-tile-icon {
            filter:
              drop-shadow(calc(var(--spacing-8) * -1) calc(var(--spacing-8) * -1) var(--spacing-12) rgb(255 150 56 / 0.34))
              drop-shadow(0 var(--spacing-4) var(--spacing-8) rgb(0 0 0 / 0.4));
          }

          .joker-mines-tile--dynamite.joker-mines-tile--fresh-reveal {
            animation: joker-mines-dynamite-impact 300ms var(--ease-standard) both;
          }

          .joker-mines-tile--dynamite.joker-mines-tile--fresh-reveal .joker-mines-tile-surface {
            animation: joker-mines-dynamite-surface 420ms var(--ease-standard) both;
          }

          .joker-mines-tile--dynamite.joker-mines-tile--fresh-reveal .joker-mines-tile-icon--dynamite {
            animation: joker-mines-dynamite-reveal 250ms var(--ease-standard) both;
          }

          .joker-mines-grid.is-round-lost .joker-mines-tile:not(.joker-mines-tile--revealed) {
            opacity: 0.34;
            filter: saturate(0.48);
            pointer-events: none;
            transform: none;
          }

          .joker-mines-grid.is-round-lost .joker-mines-tile:not(.joker-mines-tile--revealed) .joker-mines-tile-surface {
            border-color: var(--joker-black-300);
            filter: none;
          }

          .joker-mines-tile--gold.joker-mines-tile--fresh-reveal .joker-mines-tile-surface::after {
            content: "";
            position: absolute;
            inset: 18%;
            z-index: 0;
            border-radius: var(--radius-pill);
            background: radial-gradient(
              circle,
              color-mix(in srgb, var(--joker-gold-400) 34%, transparent) 0%,
              color-mix(in srgb, var(--joker-gold-400) 16%, transparent) 42%,
              transparent 72%
            );
            opacity: 0;
            pointer-events: none;
            animation: joker-mines-gold-flash 720ms var(--ease-standard) both;
          }

          .joker-mines-tile--revealed .joker-mines-tile-icon {
            filter: drop-shadow(0 var(--spacing-4) var(--spacing-8) rgb(0 0 0 / 0.34));
          }

          .joker-mines-tile--fresh-reveal .joker-mines-tile-icon--gold {
            animation: joker-mines-nugget-reveal 760ms var(--ease-standard) both;
          }

          .joker-mines-particle {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 2;
            width: calc(var(--spacing-4) + var(--border-width-default));
            height: calc(var(--spacing-4) + var(--border-width-default));
            border-radius: var(--radius-pill);
            background: var(--joker-gold-400);
            opacity: 0;
            filter: drop-shadow(0 0 var(--spacing-8) color-mix(in srgb, var(--joker-gold-400) 58%, transparent));
            pointer-events: none;
            transform: translate(-50%, -50%) scale(0.36);
            animation: joker-mines-particle-burst 680ms var(--ease-standard) both;
          }

          .joker-mines-particle:nth-of-type(1) {
            --particle-x: calc(var(--spacing-32) * -1);
            --particle-y: calc(var(--spacing-24) * -1);
          }

          .joker-mines-particle:nth-of-type(2) {
            --particle-x: var(--spacing-32);
            --particle-y: calc(var(--spacing-24) * -1);
          }

          .joker-mines-particle:nth-of-type(3) {
            --particle-x: calc(var(--spacing-40) * -1);
            --particle-y: var(--spacing-8);
          }

          .joker-mines-particle:nth-of-type(4) {
            --particle-x: var(--spacing-40);
            --particle-y: var(--spacing-8);
          }

          .joker-mines-particle:nth-of-type(5) {
            --particle-x: calc(var(--spacing-24) * -1);
            --particle-y: var(--spacing-32);
          }

          .joker-mines-particle:nth-of-type(6) {
            --particle-x: var(--spacing-24);
            --particle-y: var(--spacing-32);
          }

          .joker-mines-smoke {
            position: absolute;
            top: 43%;
            left: 56%;
            z-index: 2;
            width: var(--spacing-12);
            height: var(--spacing-12);
            border-radius: var(--radius-pill);
            background: rgb(255 255 255 / 0.28);
            opacity: 0;
            filter: blur(var(--spacing-4));
            pointer-events: none;
            transform: translate(-50%, -50%) scale(0.46);
            animation: joker-mines-smoke-rise 980ms var(--ease-standard) both;
          }

          .joker-mines-smoke:nth-of-type(1) {
            --smoke-x: calc(var(--spacing-12) * -1);
            --smoke-y: calc(var(--spacing-40) * -1);
            animation-delay: 20ms;
          }

          .joker-mines-smoke:nth-of-type(2) {
            --smoke-x: var(--spacing-4);
            --smoke-y: calc(var(--spacing-48) * -1);
            animation-delay: 80ms;
          }

          .joker-mines-smoke:nth-of-type(3) {
            --smoke-x: var(--spacing-16);
            --smoke-y: calc(var(--spacing-40) * -1);
            animation-delay: 140ms;
          }

          .joker-mines-smoke:nth-of-type(4) {
            --smoke-x: calc(var(--spacing-8) * -1);
            --smoke-y: calc(var(--spacing-56) * -1);
            animation-delay: 200ms;
          }

          .joker-mines-smoke:nth-of-type(5) {
            --smoke-x: var(--spacing-24);
            --smoke-y: calc(var(--spacing-48) * -1);
            animation-delay: 260ms;
          }

          .joker-mines-tile-multiplier {
            position: absolute;
            z-index: 20;
            bottom: 0;
            left: 50%;
            min-width: calc(var(--spacing-64) + var(--spacing-8));
            border: calc(var(--border-width-default) + var(--border-width-default)) solid var(--joker-green-400);
            border-radius: var(--radius-pill);
            background: color-mix(in srgb, var(--joker-green-900) 78%, var(--joker-black-800));
            box-shadow: 0 0 0 var(--border-width-default) color-mix(in srgb, var(--joker-green-400) 18%, transparent);
            color: var(--joker-green-400);
            font-family: var(--font-display);
            font-size: 20px;
            font-weight: 500;
            line-height: 1;
            padding: calc(var(--spacing-8) - var(--border-width-default)) var(--spacing-12) calc(var(--spacing-8) - var(--border-width-default) - var(--border-width-default));
            transform: translate(-50%, 50%);
            pointer-events: none;
          }

          .joker-mines-tile:active {
            transform: translateY(var(--border-width-default));
            box-shadow: none;
          }

          .joker-mines-tile--revealed:active .joker-mines-tile-surface {
            filter: drop-shadow(0 0 var(--spacing-12) color-mix(in srgb, var(--joker-gold-400) 24%, transparent));
          }

          @keyframes joker-mines-tile-press {
            0% {
              transform: translateY(0) scale(1);
            }

            34% {
              transform: translateY(var(--spacing-4)) scale(0.97);
            }

            100% {
              transform: translateY(0) scale(1);
            }
          }

          @keyframes joker-mines-gold-flash {
            0% {
              opacity: 0;
              transform: scale(0.44);
              filter: blur(0);
            }

            32% {
              opacity: 1;
              transform: scale(1);
              filter: blur(var(--spacing-8));
            }

            100% {
              opacity: 0;
              transform: scale(1.28);
              filter: blur(var(--spacing-16));
            }
          }

          @keyframes joker-mines-nugget-reveal {
            0% {
              opacity: 0;
              transform: scale(0.55) translateY(var(--spacing-12));
              filter: drop-shadow(0 0 0 transparent);
            }

            46% {
              opacity: 1;
              transform: scale(1.12) translateY(calc(var(--spacing-4) * -1));
              filter: drop-shadow(0 0 var(--spacing-16) color-mix(in srgb, var(--joker-gold-400) 42%, transparent));
            }

            72% {
              opacity: 1;
              transform: scale(0.96) translateY(var(--border-width-default));
              filter: drop-shadow(0 0 var(--spacing-12) color-mix(in srgb, var(--joker-gold-400) 30%, transparent));
            }

            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
              filter: drop-shadow(0 var(--spacing-4) var(--spacing-8) rgb(0 0 0 / 0.34));
            }
          }

          @keyframes joker-mines-particle-burst {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.36);
              filter: drop-shadow(0 0 0 transparent);
            }

            18% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
              filter: drop-shadow(0 0 var(--spacing-8) color-mix(in srgb, var(--joker-gold-400) 58%, transparent));
            }

            100% {
              opacity: 0;
              transform: translate(calc(-50% + var(--particle-x)), calc(-50% + var(--particle-y))) scale(0.48);
              filter: drop-shadow(0 0 var(--spacing-4) color-mix(in srgb, var(--joker-gold-400) 10%, transparent));
            }
          }

          @keyframes joker-mines-dynamite-surface {
            0% {
              border-color: var(--joker-black-300);
              background:
                radial-gradient(circle at center, rgb(90 0 0 / 0.34), transparent 70%),
                var(--joker-black-700);
              box-shadow: none;
            }

            24% {
              border-color: rgb(255 70 70 / 0.95);
              background:
                radial-gradient(circle at center, rgb(255 60 60 / 0.2), transparent 70%),
                var(--joker-black-700);
              box-shadow:
                0 0 0 var(--border-width-default) rgb(255 70 70 / 0.2),
                0 0 var(--spacing-24) rgb(255 70 70 / 0.25),
                inset 0 0 calc(var(--spacing-16) + var(--spacing-4)) rgb(255 70 70 / 0.08);
            }

            100% {
              border-color: rgb(255 70 70 / 0.75);
              background:
                radial-gradient(circle at center, rgb(255 60 60 / 0.12), transparent 70%),
                var(--joker-black-700);
              box-shadow:
                0 0 0 var(--border-width-default) rgb(255 70 70 / 0.2),
                0 0 var(--spacing-24) rgb(255 70 70 / 0.25),
                inset 0 0 calc(var(--spacing-16) + var(--spacing-4)) rgb(255 70 70 / 0.08);
            }
          }

          @keyframes joker-mines-dynamite-reveal {
            0% {
              opacity: 0;
              transform: scale(0.7);
            }

            62% {
              opacity: 1;
              transform: scale(1.1);
            }

            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes joker-mines-dynamite-impact {
            0% {
              transform: translateX(0);
            }

            18% {
              transform: translateX(calc(var(--spacing-4) * -1 - var(--border-width-default) - var(--border-width-default)));
            }

            36% {
              transform: translateX(calc(var(--spacing-4) + var(--border-width-default) + var(--border-width-default)));
            }

            58% {
              transform: translateX(calc((var(--spacing-4) + var(--border-width-default)) * -1));
            }

            78% {
              transform: translateX(calc(var(--spacing-4) + var(--border-width-default)));
            }

            100% {
              transform: translateX(0);
            }
          }

          @keyframes joker-mines-smoke-rise {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.46);
            }

            18% {
              opacity: 0.46;
              transform: translate(-50%, -50%) scale(0.72);
            }

            100% {
              opacity: 0;
              transform: translate(calc(-50% + var(--smoke-x)), calc(-50% + var(--smoke-y))) scale(1.28);
            }
          }
        `}
      </style>
      <GameShell
        balance={formatBalance(balance)}
        defaultValue={minesNavigationPreset.defaultValue}
        game={minesNavigationPreset.game}
        value={minesNavigationPreset.selectedValue}
        bettingPanelProps={{
          mode: bettingMode,
          onModeChange: setBettingMode,
          onPlaceBet: handleBetAction,
        }}
      >
        <MinesGrid
          board={board}
          freshRevealedTiles={freshRevealedTiles}
          multiplier={multiplier}
          onTileClick={handleTileClick}
          revealedTiles={revealedTiles}
          roundStatus={roundStatus}
        />
      </GameShell>
      <BettingPanelFields
        betAmount={betAmount}
        bettingMode={bettingMode}
        currentProfit={currentProfit}
        gameInPlay={gameInPlay}
        mines={mines}
        multiplier={multiplier}
        nextMultiplier={nextMultiplier}
        nextProfit={nextProfit}
        message={message}
        onBetAmountChange={setBetAmount}
        onMinesChange={setMines}
      />
    </>
  );
}

function MinesGrid({
  board,
  freshRevealedTiles,
  multiplier,
  onTileClick,
  revealedTiles,
  roundStatus,
}) {
  return (
    <section className="joker-mines-stage" aria-label="Mines game board">
      <div className={`joker-mines-grid ${roundStatus === "lost" ? "is-round-lost" : ""}`.trim()}>
        {mineTiles.map((tile, index) => {
          const revealed = revealedTiles.includes(tile);
          const freshReveal = freshRevealedTiles.includes(tile);
          const hiddenPreview = roundStatus === "idle" ? tileStatePreview[index] : null;
          const state = revealed ? board[index] || "gold" : hiddenPreview || "default";
          const asset = tileStateAssets[state];

          return (
            <button
              key={tile}
              className={`joker-mines-tile joker-mines-tile--${state} ${revealed ? "joker-mines-tile--revealed" : ""} ${freshReveal ? "joker-mines-tile--fresh-reveal" : ""}`.trim()}
              type="button"
              aria-label={`Tile ${tile}: ${asset.label}`}
              aria-pressed={revealed}
              data-selected={revealed || undefined}
              onClick={() => onTileClick(tile)}
            >
              <span className="joker-mines-tile-surface">
                <img
                  className={`joker-mines-tile-icon joker-mines-tile-icon--${state}`}
                  src={asset.src}
                  alt=""
                />
                {freshReveal &&
                  state === "gold" &&
                  Array.from({ length: 6 }, (_, particleIndex) => (
                    <span
                      className="joker-mines-particle"
                      key={particleIndex}
                      aria-hidden="true"
                    />
                  ))}
                {freshReveal &&
                  state === "dynamite" &&
                  Array.from({ length: 5 }, (_, smokeIndex) => (
                    <span
                      className="joker-mines-smoke"
                      key={smokeIndex}
                      aria-hidden="true"
                    />
                  ))}
              </span>
              {freshReveal && state === "gold" && (
                <span className="joker-mines-tile-multiplier">
                  {multiplier.toFixed(2)}x
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BettingPanelFields({
  betAmount,
  bettingMode,
  currentProfit,
  gameInPlay,
  message,
  mines,
  multiplier,
  nextMultiplier,
  nextProfit,
  onBetAmountChange,
  onMinesChange,
}) {
  const [fields, setFields] = useState(null);
  const [numberOfBets, setNumberOfBets] = useState("");

  useEffect(() => {
    const bettingFields = document.querySelector(".joker-betting-fields");
    const bettingPanel = document.querySelector(".joker-betting-panel");
    const builtInBetAmountField = bettingFields?.children[0];
    const cashoutField = bettingFields?.children[1];

    if (builtInBetAmountField instanceof HTMLElement) {
      builtInBetAmountField.style.display = "none";
    }

    if (cashoutField instanceof HTMLElement) {
      cashoutField.style.display = "none";
    }

    if (bettingPanel instanceof HTMLElement) {
      bettingPanel.classList.toggle("is-game-active", gameInPlay);
    }

    setFields(bettingFields);
  }, [gameInPlay]);

  if (!fields) return null;

  const goldNuggets = String(gridTileCount - Number(mines));

  function handleMinesChange(nextValue) {
    const nextMines = clampTileAmount(nextValue);

    onMinesChange(String(nextMines));
  }

  function handleBetAmountChange(event) {
    onBetAmountChange(event.target.value.replace(/[^\d.]/g, ""));
  }

  function handleNumberOfBetsChange(event) {
    setNumberOfBets(event.target.value.replace(/\D/g, ""));
  }

  return createPortal(
    <>
      <style>
        {`
          .joker-gold-nuggets-field.joker-input-field.disabled {
            opacity: 1;
            pointer-events: none;
          }

          .joker-gold-nuggets-field .joker-input-label {
            color: var(--joker-black-50);
            -webkit-text-fill-color: var(--joker-black-50);
          }

          .joker-gold-nuggets-field .joker-input-control,
          .joker-gold-nuggets-field .joker-input-control input {
            color: var(--joker-white-50);
            -webkit-text-fill-color: var(--joker-white-50);
          }

          .joker-game-shell .joker-betting-panel .joker-bet-submit {
            font-family: var(--font-display);
            font-size: 24px;
            font-weight: 500;
            line-height: 1;
          }

          .joker-game-shell .joker-game-shell-betting {
            overflow-y: hidden;
          }

          .joker-game-shell .joker-betting-panel {
            height: 100%;
            min-height: 0;
            grid-template-rows: auto auto auto auto minmax(0, 1fr) auto auto;
          }

          .joker-game-shell .joker-betting-spacer {
            min-height: 0;
          }

          .joker-betting-panel.is-game-active .joker-bet-mode-switch,
          .joker-betting-panel.is-game-active .joker-betting-divider:first-of-type {
            filter: blur(calc(var(--border-width-default) + var(--border-width-default)));
            opacity: 0.38;
            pointer-events: none;
            user-select: none;
          }

          .joker-betting-panel.is-game-active .joker-betting-fields > :not(:has(.joker-active-profit-card)) {
            filter: blur(calc(var(--border-width-default) + var(--border-width-default)));
            opacity: 0.38;
            pointer-events: none;
            user-select: none;
          }

          .joker-betting-panel.is-game-active .joker-bet-submit {
            border-color: var(--joker-gold-400);
            background:
              linear-gradient(180deg, var(--button-primary-highlight), transparent 48%),
              var(--joker-gold-400);
            color: var(--joker-black-900);
            box-shadow: var(--button-primary-shadow);
          }

          .joker-active-profit-card {
            display: grid;
            gap: var(--spacing-12);
            border: var(--border-width-default) solid var(--joker-black-200);
            border-radius: calc(var(--radius-sm) + var(--radius-sm));
            background: color-mix(in srgb, var(--joker-black-700) 92%, var(--joker-gold-1000));
            overflow: hidden;
          }

          .joker-active-profit-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            gap: var(--spacing-12);
            padding: var(--spacing-16) var(--spacing-24) 0;
          }

          .joker-active-profit-side {
            display: grid;
            gap: var(--spacing-4);
            min-width: 0;
          }

          .joker-active-profit-side:last-child {
            text-align: right;
          }

          .joker-active-profit-label {
            color: var(--joker-black-50);
            font-size: var(--text-body-12);
            line-height: var(--text-body-line-height);
          }

          .joker-active-profit-label.is-current {
            color: var(--joker-white-50);
          }

          .joker-active-profit-value {
            color: var(--joker-white-50);
            font-size: var(--text-body-14);
            font-weight: 600;
            line-height: var(--text-body-line-height);
          }

          .joker-active-profit-value.is-current,
          .joker-active-profit-multiplier.is-current {
            color: var(--joker-green-400);
          }

          .joker-active-profit-arrow {
            display: grid;
            width: var(--spacing-40);
            height: var(--spacing-40);
            place-items: center;
            border: var(--border-width-default) solid var(--joker-black-300);
            border-radius: var(--radius-pill);
            color: var(--joker-white-50);
          }

          .joker-active-profit-arrow svg {
            width: var(--spacing-16);
            height: var(--spacing-16);
            stroke-width: var(--icon-stroke-bold);
          }

          .joker-active-profit-divider {
            display: block;
            border-top: var(--border-width-default) dashed var(--joker-black-300);
          }

          .joker-active-profit-multipliers {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            gap: var(--spacing-16);
            padding: 0 var(--spacing-24) var(--spacing-16);
          }

          .joker-active-profit-multiplier {
            color: var(--joker-white-50);
            font-family: var(--font-display);
            font-size: 32px;
            font-weight: 500;
            line-height: 1;
            text-align: center;
          }

          .joker-active-profit-split {
            width: var(--border-width-default);
            height: var(--spacing-32);
            background: var(--joker-black-300);
          }
        `}
      </style>
      <div style={{ display: "grid", order: 0 }}>
        <BetAmountInput
          label="Bet amount"
          message={message}
          placeholder="0"
          prefix={<img src={jokerCoin} alt="" />}
          value={betAmount}
          onChange={handleBetAmountChange}
          fullWidth
        />
      </div>
      <div style={{ display: "grid", order: 1 }}>
        <Select
          label="Mines"
          placeholder="1"
          value={mines}
          onChange={handleMinesChange}
          options={gameOptions}
          fullWidth
        />
      </div>
      <div style={{ display: "grid", order: 2 }}>
        <Input
          label="Gold nuggets"
          placeholder="0"
          inputMode="numeric"
          pattern="[0-9]*"
          value={goldNuggets}
          disabled
          className="joker-gold-nuggets-field"
          fullWidth
        />
      </div>
      {bettingMode === "auto" && (
        <div style={{ display: "grid", order: 3 }}>
          <Input
            label="Number of bets"
            placeholder="0"
            inputMode="numeric"
            pattern="[0-9]*"
            value={numberOfBets}
            onChange={handleNumberOfBetsChange}
            fullWidth
          />
        </div>
      )}
      {gameInPlay && (
        <div style={{ display: "grid", order: 4 }}>
          <div className="joker-active-profit-card">
            <div className="joker-active-profit-row">
              <div className="joker-active-profit-side">
                <span className="joker-active-profit-label is-current">
                  Current profit
                </span>
                <span className="joker-active-profit-value is-current">
                  {formatCurrency(currentProfit)}
                </span>
              </div>
              <span className="joker-active-profit-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="m9 5 7 7-7 7"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="joker-active-profit-side">
                <span className="joker-active-profit-label">Next</span>
                <span className="joker-active-profit-value">
                  {formatCurrency(nextProfit)}
                </span>
              </div>
            </div>
            <span className="joker-active-profit-divider" />
            <div className="joker-active-profit-multipliers">
              <span className="joker-active-profit-multiplier is-current">
                {multiplier.toFixed(2)}x
              </span>
              <span className="joker-active-profit-split" aria-hidden="true" />
              <span className="joker-active-profit-multiplier">
                {nextMultiplier.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      )}
    </>,
    fields
  );
}
