import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  GameHeaderRail,
  HiLoBettingPanel as JokerHiLoBettingPanel,
  MinesBettingPanel as JokerMinesBettingPanel,
  Navigation,
} from "@joker/design-system";

const jokerIcon = new URL("../assets/iconJoker.svg", import.meta.url).href;
const jokerDimmedLogo = new URL("../assets/jokerDimmed.svg", import.meta.url).href;
const settingsIcon = new URL("../assets/settings-icon.svg", import.meta.url).href;
const starIcon = new URL("../assets/star_icon.svg", import.meta.url).href;
const graphIcon = new URL("../assets/graph-icon.svg", import.meta.url).href;
const infoIcon = new URL("../assets/info.svg", import.meta.url).href;
const goldIcon = new URL("../assets/gold.png", import.meta.url).href;
const dynamiteIcon = new URL("../assets/dynamite.png", import.meta.url).href;
const shieldIcon = new URL("../assets/sheild.png", import.meta.url).href;
const downArrowIcon = new URL("../assets/hilo-down.svg", import.meta.url).href;
const upArrowIcon = new URL("../assets/hilo-up.svg", import.meta.url).href;
const clubsIcon = new URL("../assets/clubs-wrapper.svg", import.meta.url).href;
const diamondsIcon = new URL("../assets/diamonds-wrapper.svg", import.meta.url).href;
const heartsIcon = new URL("../assets/hearts-wrapper.svg", import.meta.url).href;
const spadesIcon = new URL("../assets/spades-wrapper.svg", import.meta.url).href;
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
const tileStateAssets = {
  default: { label: "Joker", src: jokerIcon },
  joker: { label: "Joker", src: jokerIcon },
  gold: { label: "Gold nugget", src: goldIcon },
  dynamite: { label: "Dynamite", src: dynamiteIcon },
};
const hiloRanks = [
  { rank: "A", value: 1 },
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 },
  { rank: "6", value: 6 },
  { rank: "7", value: 7 },
  { rank: "8", value: 8 },
  { rank: "9", value: 9 },
  { rank: "10", value: 10 },
  { rank: "J", value: 11 },
  { rank: "Q", value: 12 },
  { rank: "K", value: 13 },
];
const hiloSuits = [
  { suit: "hearts", icon: heartsIcon, tone: "red" },
  { suit: "diamonds", icon: diamondsIcon, tone: "red" },
  { suit: "clubs", icon: clubsIcon, tone: "black" },
  { suit: "spades", icon: spadesIcon, tone: "black" },
];
const defaultHiloCard = {
  icon: spadesIcon,
  id: "spades-10-preview",
  rank: "10",
  suit: "spades",
  tone: "black",
  value: 10,
};
const minesNavigationPreset = {
  defaultValue: "mines",
  game: { label: "Mines", icon: "mines" },
  openMenuLabel: "Originals",
  selectedValue: "mines",
};
const hiloNavigationPreset = {
  defaultValue: "hilo",
  game: { label: "Hilo", icon: "hi-lo" },
  openMenuLabel: "Originals",
  selectedValue: "hilo",
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
  const earlyShieldIndexes = tileIndexes.slice(0, 4);
  const availableEarlyShieldIndexes = earlyShieldIndexes.filter(
    (index) => !dynamiteIndexes.has(index)
  );
  const jokerIndexPool =
    availableEarlyShieldIndexes.length > 0
      ? availableEarlyShieldIndexes
      : shuffledIndexes.filter((index) => !dynamiteIndexes.has(index));
  const jokerIndex =
    jokerIndexPool[Math.floor(Math.random() * jokerIndexPool.length)];

  return tileIndexes.map((index) => {
    let content = "gold";

    if (dynamiteIndexes.has(index)) content = "dynamite";
    if (index === jokerIndex) content = "joker";

    return {
      blockedByShield: false,
      content,
      id: index + 1,
    };
  });
}

function getTileContent(tile) {
  return tile?.content || "gold";
}

function countSafeReveals(board, revealedTiles) {
  return revealedTiles.filter((tile) => getTileContent(board[tile - 1]) !== "dynamite")
    .length;
}

function blockTileWithShield(board, tileId) {
  return board.map((tile) =>
    tile.id === tileId ? { ...tile, blockedByShield: true } : tile
  );
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

function createHiloDeck() {
  return hiloSuits.flatMap((suit) =>
    hiloRanks.map((rank) => ({
      ...rank,
      ...suit,
      id: `${suit.suit}-${rank.rank}`,
    }))
  );
}

function shuffleCards(cards) {
  const shuffledCards = [...cards];

  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledCards[index], shuffledCards[swapIndex]] = [
      shuffledCards[swapIndex],
      shuffledCards[index],
    ];
  }

  return shuffledCards;
}

function formatHiloPercent(value) {
  return `${value.toFixed(2)}%`;
}

function calculateHiloOdds(currentCard, deck) {
  if (!currentCard || deck.length === 0) {
    return {
      higherPercent: 0,
      higherProbability: 0,
      lowerPercent: 0,
      lowerProbability: 0,
    };
  }

  const lowerCount = deck.filter((card) => card.value <= currentCard.value).length;
  const higherCount = deck.filter((card) => card.value >= currentCard.value).length;
  const lowerProbability = lowerCount / deck.length;
  const higherProbability = higherCount / deck.length;

  return {
    higherPercent: higherProbability * 100,
    higherProbability,
    lowerPercent: lowerProbability * 100,
    lowerProbability,
  };
}

function calculateHiloPayout(probability) {
  if (probability <= 0) return 1;

  return Math.max(1.01, (1 / probability) * 0.96);
}

function calculateProjectedHiloMultiplier(currentMultiplier, probability) {
  return currentMultiplier * calculateHiloPayout(probability);
}

function createHiloHistoryEntry(card, chip, chipTone = "multiplier") {
  return {
    ...card,
    chip,
    chipTone,
    next: null,
  };
}

function createHiloRound() {
  const deck = shuffleCards(createHiloDeck());
  const [currentCard, ...remainingDeck] = deck;

  return {
    currentCard,
    deck: remainingDeck,
    history: [createHiloHistoryEntry(currentCard, "Start", "start")],
  };
}

function resolveHiloPrediction(choice, currentCard, nextCard) {
  if (choice === "higher") {
    return nextCard.value >= currentCard.value;
  }

  return nextCard.value <= currentCard.value;
}

function updateHiloHistory(history, direction, nextEntry) {
  return [
    ...history.slice(0, -1),
    { ...history[history.length - 1], next: direction },
    nextEntry,
  ];
}

export function App() {
  const [pathname, setPathname] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname
  );

  useEffect(() => {
    const handleLocationChange = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", handleLocationChange);

    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  function navigateToGame(nextValue) {
    const nextPath = nextValue === "hilo" ? "/hilo" : nextValue === "mines" ? "/" : null;

    if (!nextPath || window.location.pathname === nextPath) {
      return;
    }

    window.history.pushState({}, "", nextPath);
    setPathname(nextPath);
  }

  if (pathname === "/hilo") {
    return <HiloPage onGameChange={navigateToGame} />;
  }

  return <MinesPage onGameChange={navigateToGame} />;
}

function MinesPage({ onGameChange }) {
  const [bettingMode, setBettingMode] = useState("manual");
  const [betAmount, setBetAmount] = useState("");
  const [balance, setBalance] = useState(150000);
  const [board, setBoard] = useState([]);
  const [message, setMessage] = useState("");
  const [mines, setMines] = useState("1");
  const [revealedTiles, setRevealedTiles] = useState([]);
  const [freshRevealedTiles, setFreshRevealedTiles] = useState([]);
  const [roundStatus, setRoundStatus] = useState("idle");
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [cashoutResult, setCashoutResult] = useState(null);
  const [playArea, setPlayArea] = useState(null);
  const cashoutResetTimeout = useRef(null);

  const activeMineCount = clampTileAmount(mines);
  const safeRevealedCount = countSafeReveals(board, revealedTiles);
  const gameInPlay = roundStatus === "active";
  const multiplier = calculateMultiplier(activeMineCount, safeRevealedCount);
  const nextMultiplier = calculateMultiplier(activeMineCount, safeRevealedCount + 1);
  const numericBetAmount = Number(betAmount) || 0;
  const hasBetAmount = numericBetAmount > 0;
  const currentProfit =
    roundStatus === "active" && safeRevealedCount > 0
      ? numericBetAmount * multiplier
      : 0;
  const nextProfit = numericBetAmount * nextMultiplier;

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

  useEffect(() => {
    const updatePlayArea = () => {
      setPlayArea(document.querySelector(".joker-game-shell-play-area"));
    };

    updatePlayArea();
    const frameId = window.requestAnimationFrame(updatePlayArea);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    return () => {
      if (cashoutResetTimeout.current) {
        window.clearTimeout(cashoutResetTimeout.current);
      }
    };
  }, []);

  function handleTileClick(tile) {
    if (roundStatus !== "active" || revealedTiles.includes(tile)) {
      return;
    }

    const tileContent = getTileContent(board[tile - 1]);

    setRevealedTiles((currentTiles) =>
      currentTiles.includes(tile) ? currentTiles : [...currentTiles, tile]
    );
    setFreshRevealedTiles((currentTiles) =>
      currentTiles.includes(tile) ? currentTiles : [...currentTiles, tile]
    );

    if (tileContent === "joker") {
      setShieldActive(true);
      setMessage("Joker Shield Activated");
    }

    if (tileContent === "dynamite" && shieldActive) {
      setBoard((currentBoard) => blockTileWithShield(currentBoard, tile));
      setShieldActive(false);
      setShieldUsed(true);
      setMessage("Shield Saved You");
    }

    if (tileContent === "dynamite" && !shieldActive) {
      setRoundStatus("lost");
      setShieldActive(false);
      setMessage("");
    }

    window.setTimeout(() => {
      setFreshRevealedTiles((currentTiles) =>
        currentTiles.filter((currentTile) => currentTile !== tile)
      );
    }, 1500);
  }

  function handleBetAction() {
    if (roundStatus === "cashedOut") {
      return;
    }

    if (gameInPlay) {
      setBalance((currentBalance) => currentBalance + currentProfit);
      setCashoutResult({
        multiplier,
        profit: currentProfit,
      });
      setRoundStatus("cashedOut");
      setFreshRevealedTiles([]);
      setShieldActive(false);
      setShieldUsed(false);
      setMessage("");

      if (cashoutResetTimeout.current) {
        window.clearTimeout(cashoutResetTimeout.current);
      }

      cashoutResetTimeout.current = window.setTimeout(() => {
        setRoundStatus("idle");
        setBoard([]);
        setRevealedTiles([]);
        setFreshRevealedTiles([]);
        setCashoutResult(null);
        cashoutResetTimeout.current = null;
      }, 1800);
      return;
    }

    if (numericBetAmount <= 0 || numericBetAmount > balance) {
      setMessage("Enter a valid bet amount");
      return;
    }

    const nextBoard = createRoundBoard(activeMineCount);

    if (cashoutResetTimeout.current) {
      window.clearTimeout(cashoutResetTimeout.current);
      cashoutResetTimeout.current = null;
    }

    setBalance((currentBalance) => currentBalance - numericBetAmount);
    setBoard(nextBoard);
    setRoundStatus("active");
    setRevealedTiles([]);
    setFreshRevealedTiles([]);
    setShieldActive(false);
    setShieldUsed(false);
    setCashoutResult(null);
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
            overflow: hidden;
            background: var(--joker-black-800);
          }

          .joker-game-shell .joker-game-header-info {
            display: inline-grid;
            place-items: center;
            background: url("${infoIcon}") center / contain no-repeat;
          }

          .joker-game-shell .joker-game-header-info svg {
            opacity: 0;
          }

          .joker-game-shell .joker-game-shell-play-area {
            grid-template-rows: minmax(0, 1fr) auto;
            grid-template-columns: minmax(0, 3fr) minmax(0, 7fr);
          }

          .joker-game-shell .joker-game-shell-betting,
          .joker-game-shell .joker-game-shell-empty-stage {
            min-height: 0;
          }

          .joker-game-shell--mines .joker-game-shell-betting {
            overflow-y: hidden;
          }

          .joker-mines-board-area {
            position: relative;
            display: grid;
            height: 100%;
            min-height: 0;
            place-items: center;
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

          .joker-mines-frame-footer {
            display: grid;
            grid-column: 1 / -1;
            grid-template-columns: auto minmax(0, 1fr) auto;
            align-items: center;
            min-height: calc(var(--spacing-64) - var(--spacing-8));
            border-top: var(--border-width-default) solid var(--joker-black-300);
            background: var(--joker-black-600);
            padding: 0 var(--spacing-24);
          }

          .joker-mines-footer-actions {
            display: flex;
            align-items: center;
            gap: var(--spacing-8);
            min-width: 0;
          }

          .joker-mines-footer-button {
            display: inline-grid;
            width: var(--spacing-32);
            height: var(--spacing-32);
            place-items: center;
            border: 0;
            border-radius: var(--radius-sm);
            background: transparent;
            color: color-mix(in srgb, var(--joker-white-50) 68%, var(--joker-black-50));
            cursor: pointer;
            padding: 0;
            transition:
              color var(--motion-fast) var(--ease-standard),
              transform var(--motion-fast) var(--ease-standard);
          }

          .joker-mines-footer-button:hover {
            color: var(--joker-white-50);
            transform: translateY(calc(var(--border-width-default) * -1));
          }

          .joker-mines-footer-icon {
            display: block;
            width: var(--spacing-20, calc(var(--spacing-16) + var(--spacing-4)));
            height: var(--spacing-20, calc(var(--spacing-16) + var(--spacing-4)));
            object-fit: contain;
            pointer-events: none;
          }

          .joker-mines-footer-logo {
            display: block;
            grid-column: 3;
            justify-self: end;
            width: clamp(calc(var(--spacing-64) + var(--spacing-8)), 7vw, calc(var(--spacing-64) + var(--spacing-40)));
            max-height: var(--spacing-24);
            opacity: 0.38;
            filter: grayscale(1);
            pointer-events: none;
            user-select: none;
          }

          .joker-mines-footer-spacer {
            grid-column: 2;
            grid-row: 1;
            min-width: 0;
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
            cursor: default;
            padding: 0;
            transition:
              transform var(--motion-fast) var(--ease-standard);
          }

          .joker-mines-grid.is-bet-ready .joker-mines-tile:not(.joker-mines-tile--revealed) {
            cursor: pointer;
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

          .joker-mines-tile-icon--joker {
            width: clamp(calc(var(--spacing-40) + var(--spacing-8)), 44%, calc(var(--spacing-64) + var(--spacing-16)));
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

          .joker-mines-grid.is-bet-ready .joker-mines-tile:not(.joker-mines-tile--revealed):hover {
            transform: translateY(calc(var(--border-width-default) * -1));
          }

          .joker-mines-grid.is-bet-ready .joker-mines-tile:not(.joker-mines-tile--revealed):hover .joker-mines-tile-surface {
            border-color: color-mix(in srgb, var(--joker-gold-400) 38%, var(--joker-black-300));
            background: color-mix(in srgb, var(--joker-black-700) 88%, var(--joker-gold-1000));
            box-shadow: none;
          }

          .joker-mines-grid.is-bet-ready .joker-mines-tile--dynamite:not(.joker-mines-tile--revealed):hover .joker-mines-tile-surface,
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

          .joker-mines-tile--joker.joker-mines-tile--revealed .joker-mines-tile-surface,
          .joker-mines-tile--joker.joker-mines-tile--revealed:hover .joker-mines-tile-surface {
            border-color: color-mix(in srgb, var(--joker-gold-400) 76%, var(--joker-black-300));
            background: var(--joker-black-700);
            box-shadow:
              0 0 0 var(--border-width-default) color-mix(in srgb, var(--joker-gold-400) 14%, transparent),
              inset 0 0 var(--spacing-24) color-mix(in srgb, var(--joker-gold-400) 8%, transparent);
            filter: drop-shadow(0 0 var(--spacing-12) color-mix(in srgb, var(--joker-gold-400) 24%, transparent));
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

          .joker-mines-tile--shield-blocked {
            z-index: 18;
          }

          .joker-mines-tile--shield-blocked .joker-mines-tile-surface {
            box-shadow:
              0 0 0 var(--border-width-default) rgb(255 70 70 / 0.2),
              0 0 var(--spacing-24) rgb(255 70 70 / 0.25),
              0 0 var(--spacing-32) color-mix(in srgb, var(--joker-gold-400) 18%, transparent),
              inset 0 0 calc(var(--spacing-16) + var(--spacing-4)) rgb(255 70 70 / 0.08);
          }

          .joker-mines-shield-badge {
            position: absolute;
            right: var(--spacing-8);
            bottom: var(--spacing-8);
            z-index: 6;
            display: grid;
            width: clamp(var(--spacing-32), 26%, calc(var(--spacing-40) + var(--spacing-8)));
            aspect-ratio: 1;
            place-items: center;
            border: var(--border-width-default) solid color-mix(in srgb, var(--joker-gold-400) 72%, var(--joker-black-200));
            border-radius: var(--radius-pill);
            background: color-mix(in srgb, var(--joker-black-900) 72%, var(--joker-gold-1000));
            box-shadow:
              0 0 var(--spacing-16) color-mix(in srgb, var(--joker-gold-400) 34%, transparent),
              inset 0 0 var(--spacing-12) color-mix(in srgb, var(--joker-gold-400) 18%, transparent);
            pointer-events: none;
          }

          .joker-mines-shield-badge img {
            display: block;
            width: 132%;
            height: 132%;
            object-fit: contain;
            filter: drop-shadow(0 var(--spacing-4) var(--spacing-8) rgb(0 0 0 / 0.36));
          }

          .joker-mines-tile--shield-blocked.joker-mines-tile--fresh-reveal .joker-mines-shield-badge {
            right: 50%;
            bottom: 50%;
            width: clamp(var(--spacing-64), 58%, calc(var(--spacing-64) + var(--spacing-48)));
            border-color: transparent;
            background: transparent;
            box-shadow: none;
            opacity: 0;
            transform: translate(50%, 50%) scale(0.72);
            animation: joker-mines-shield-block 980ms var(--ease-standard) both;
          }

          .joker-mines-grid.is-round-lost .joker-mines-tile:not(.joker-mines-tile--revealed) {
            opacity: 0.34;
            filter: saturate(0.48);
            pointer-events: none;
            transform: none;
          }

          .joker-mines-grid.is-cashed-out {
            opacity: 0.42;
            filter: saturate(0.72);
            pointer-events: none;
          }

          .joker-mines-grid.is-round-lost .joker-mines-tile:not(.joker-mines-tile--revealed) .joker-mines-tile-surface {
            border-color: var(--joker-black-300);
            filter: none;
          }

          .joker-mines-cashout-card {
            position: absolute;
            left: 50%;
            top: 50%;
            z-index: 40;
            display: grid;
            width: min(500px, calc(100% - var(--spacing-48)));
            gap: var(--spacing-16);
            border: calc(var(--border-width-default) + var(--border-width-default)) solid var(--joker-gold-400);
            border-radius: calc(var(--radius-sm) + var(--radius-sm) + var(--spacing-4));
            background:
              radial-gradient(circle at center, color-mix(in srgb, var(--joker-gold-400) 14%, transparent), transparent 68%),
              color-mix(in srgb, var(--joker-black-700) 78%, var(--joker-gold-1000));
            box-shadow:
              0 0 0 var(--border-width-default) color-mix(in srgb, var(--joker-gold-400) 24%, transparent),
              0 0 var(--spacing-40) color-mix(in srgb, var(--joker-gold-400) 24%, transparent),
              inset 0 0 var(--spacing-24) color-mix(in srgb, var(--joker-gold-400) 10%, transparent);
            padding: var(--spacing-24);
            pointer-events: none;
            transform: translate(-50%, -50%) scale(0.96);
            animation: joker-mines-cashout-pop 420ms var(--ease-standard) both;
          }

          .joker-mines-cashout-multiplier {
            display: grid;
            min-height: calc(var(--spacing-64) + var(--spacing-8));
            place-items: center;
            border: calc(var(--border-width-default) + var(--border-width-default)) solid color-mix(in srgb, var(--joker-gold-400) 68%, var(--joker-black-200));
            border-radius: var(--radius-sm);
            background: color-mix(in srgb, var(--joker-black-700) 72%, var(--joker-gold-1000));
            color: var(--joker-white-50);
            font-family: var(--font-display);
            font-size: clamp(40px, 5vw, 64px);
            font-weight: 500;
            line-height: 1;
            padding-top: var(--spacing-4);
          }

          .joker-mines-cashout-copy {
            color: var(--joker-white-50);
            font-family: var(--font-body);
            font-size: clamp(18px, 2vw, 28px);
            font-weight: 600;
            line-height: 1.2;
            text-align: center;
          }

          .joker-mines-tile--gold.joker-mines-tile--fresh-reveal .joker-mines-tile-surface::after,
          .joker-mines-tile--joker.joker-mines-tile--fresh-reveal .joker-mines-tile-surface::after {
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

          .joker-mines-tile--fresh-reveal .joker-mines-tile-icon--joker {
            animation: joker-mines-joker-reveal 760ms var(--ease-standard) both;
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

          @keyframes joker-mines-cashout-pop {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.92);
              filter: drop-shadow(0 0 0 transparent);
            }

            64% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.02);
              filter: drop-shadow(0 0 var(--spacing-24) color-mix(in srgb, var(--joker-green-400) 34%, transparent));
            }

            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
              filter: drop-shadow(0 0 var(--spacing-16) color-mix(in srgb, var(--joker-green-400) 24%, transparent));
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

          @keyframes joker-mines-joker-reveal {
            0% {
              opacity: 0;
              transform: scale(0.58) rotate(-4deg);
              filter: drop-shadow(0 0 0 transparent);
            }

            44% {
              opacity: 1;
              transform: scale(1.12) rotate(2deg);
              filter: drop-shadow(0 0 var(--spacing-16) color-mix(in srgb, var(--joker-gold-400) 44%, transparent));
            }

            72% {
              opacity: 1;
              transform: scale(0.96) rotate(0deg);
              filter: drop-shadow(0 0 var(--spacing-12) color-mix(in srgb, var(--joker-gold-400) 30%, transparent));
            }

            100% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
              filter: drop-shadow(0 var(--spacing-4) var(--spacing-8) rgb(0 0 0 / 0.34));
            }
          }

          @keyframes joker-mines-shield-block {
            0% {
              opacity: 0;
              transform: translate(50%, 50%) scale(0.72);
              filter: drop-shadow(0 0 0 transparent);
            }

            34% {
              opacity: 1;
              transform: translate(50%, 50%) scale(1.1);
              filter: drop-shadow(0 0 var(--spacing-24) color-mix(in srgb, var(--joker-gold-400) 54%, transparent));
            }

            72% {
              opacity: 0.92;
              transform: translate(50%, 50%) scale(0.96);
              filter: drop-shadow(0 0 var(--spacing-16) color-mix(in srgb, var(--joker-gold-400) 34%, transparent));
            }

            100% {
              opacity: 1;
              transform: translate(50%, 50%) scale(1);
              filter: drop-shadow(0 var(--spacing-4) var(--spacing-12) rgb(0 0 0 / 0.42));
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
      <div className="joker-game-shell joker-game-shell--mines">
        <Navigation
          balance={formatBalance(balance)}
          className="joker-game-shell-navigation"
          defaultValue={minesNavigationPreset.defaultValue}
          onValueChange={onGameChange}
          value={minesNavigationPreset.selectedValue}
        >
          <main className="joker-game-shell-stage" aria-label="Game stage">
            <GameHeaderRail game={minesNavigationPreset.game} />
            <div className="joker-game-shell-play-area">
              <aside className="joker-game-shell-betting">
                <PackagedMinesBettingPanel
                  betAmount={betAmount}
                  bettingMode={bettingMode}
                  currentProfit={currentProfit}
                  gameInPlay={gameInPlay}
                  mines={mines}
                  multiplier={multiplier}
                  nextMultiplier={nextMultiplier}
                  nextProfit={nextProfit}
                  onBetAmountChange={setBetAmount}
                  onMinesChange={setMines}
                  onModeChange={setBettingMode}
                  onPlaceBet={handleBetAction}
                />
              </aside>
              <div className="joker-game-shell-empty-stage" aria-label="Game canvas">
                <MinesGrid
                  board={board}
                  cashoutResult={cashoutResult}
                  freshRevealedTiles={freshRevealedTiles}
                  hasBetAmount={hasBetAmount}
                  multiplier={multiplier}
                  onTileClick={handleTileClick}
                  revealedTiles={revealedTiles}
                  roundStatus={roundStatus}
                />
              </div>
            </div>
          </main>
        </Navigation>
      </div>
      {playArea && createPortal(<GameShellFooter />, playArea)}
    </>
  );
}

function HiloPage({ onGameChange }) {
  const [betAmount, setBetAmount] = useState("");
  const [balance, setBalance] = useState(150000);
  const [currentCard, setCurrentCard] = useState(defaultHiloCard);
  const [deck, setDeck] = useState([]);
  const [history, setHistory] = useState([
    createHiloHistoryEntry(defaultHiloCard, "Start", "start"),
  ]);
  const [message, setMessage] = useState("");
  const [multiplier, setMultiplier] = useState(1);
  const [playArea, setPlayArea] = useState(null);
  const [roundStatus, setRoundStatus] = useState("pre-game");
  const [skipAvailable, setSkipAvailable] = useState(true);

  const numericBetAmount = Number(betAmount) || 0;
  const hasBetAmount = numericBetAmount > 0;
  const gameInPlay = roundStatus === "active";
  const odds = calculateHiloOdds(currentCard, deck);
  const lowerMultiplier = calculateProjectedHiloMultiplier(
    multiplier,
    odds.lowerProbability
  );
  const higherMultiplier = calculateProjectedHiloMultiplier(
    multiplier,
    odds.higherProbability
  );
  const currentProfit = multiplier > 1 ? numericBetAmount * multiplier : 0;

  useEffect(() => {
    const openHiloMenu = () => {
      const hiloMenu = [...document.querySelectorAll(".joker-product-rail-game-menu")].find(
        (menu) =>
          menu
            .querySelector(".joker-product-rail-menu-label")
            ?.textContent?.trim() === hiloNavigationPreset.openMenuLabel
      );
      const trigger = hiloMenu?.querySelector(".joker-product-rail-menu-trigger");

      if (hiloMenu && trigger && !hiloMenu.classList.contains("is-open")) {
        trigger.click();
      }
    };

    openHiloMenu();
    const frameId = window.requestAnimationFrame(openHiloMenu);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const updatePlayArea = () => {
      setPlayArea(document.querySelector(".joker-game-shell-play-area"));
    };

    updatePlayArea();
    const frameId = window.requestAnimationFrame(updatePlayArea);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function handleBetAction() {
    handleCashout();
  }

  function handlePlaceBet() {
    if (gameInPlay) return;

    if (!hasBetAmount || numericBetAmount > balance) {
      return;
    }

    const nextRound = createHiloRound();

    setBalance((currentBalance) => currentBalance - numericBetAmount);
    setCurrentCard(nextRound.currentCard);
    setDeck(nextRound.deck);
    setHistory(nextRound.history);
    setMessage("");
    setMultiplier(1);
    setRoundStatus("active");
    setSkipAvailable(true);
  }

  function handleCashout() {
    if (!gameInPlay) {
      handlePlaceBet();
      return;
    }

    if (currentProfit <= 0) {
      return;
    }

    setBalance((currentBalance) => currentBalance + currentProfit);
    setMessage(`Cashed out ${formatCurrency(currentProfit)}`);
    setRoundStatus("cash-out");
  }

  function handlePrediction(choice) {
    if (!gameInPlay || deck.length === 0) {
      return;
    }

    const [nextCard, ...remainingDeck] = deck;
    const direction = choice === "higher" ? "up" : "down";
    const correct = resolveHiloPrediction(choice, currentCard, nextCard);

    if (!correct) {
      setCurrentCard(nextCard);
      setDeck(remainingDeck);
      setHistory((currentHistory) =>
        updateHiloHistory(
          currentHistory,
          direction,
          createHiloHistoryEntry(nextCard, "0.00x", "end")
        )
      );
      setMessage("Prediction missed");
      setMultiplier(0);
      setRoundStatus("loss");
      return;
    }

    const probability =
      choice === "higher" ? odds.higherProbability : odds.lowerProbability;
    const nextMultiplier = calculateProjectedHiloMultiplier(multiplier, probability);

    setCurrentCard(nextCard);
    setDeck(remainingDeck);
    setHistory((currentHistory) =>
      updateHiloHistory(
        currentHistory,
        direction,
        createHiloHistoryEntry(nextCard, `${nextMultiplier.toFixed(2)}x`)
      )
    );
    setMessage("Prediction correct");
    setMultiplier(nextMultiplier);

    if (remainingDeck.length === 0) {
      setBalance((currentBalance) => currentBalance + numericBetAmount * nextMultiplier);
      setRoundStatus("win");
      setMessage("Deck cleared");
    }
  }

  function handleSkipCard() {
    if (!gameInPlay || !skipAvailable || deck.length === 0) {
      return;
    }

    const [nextCard, ...remainingDeck] = deck;

    setCurrentCard(nextCard);
    setDeck(remainingDeck);
    setHistory((currentHistory) =>
      updateHiloHistory(
        currentHistory,
        "skip",
        createHiloHistoryEntry(nextCard, "Skip", "skip")
      )
    );
    setMessage("Card skipped");
    setSkipAvailable(false);

    if (remainingDeck.length === 0) {
      setBalance((currentBalance) => currentBalance + currentProfit);
      setRoundStatus("win");
      setMessage("Deck cleared");
    }
  }

  return (
    <>
      <style>
        {`
          .joker-game-shell .joker-game-header-info {
            display: inline-grid;
            place-items: center;
            background: url("${infoIcon}") center / contain no-repeat;
          }

          .joker-game-shell .joker-game-header-info svg {
            opacity: 0;
          }

          .joker-game-shell .joker-game-shell-play-area {
            grid-template-rows: minmax(0, 1fr) auto;
            grid-template-columns: minmax(0, 3fr) minmax(0, 7fr);
          }

          .joker-game-shell .joker-game-shell-betting,
          .joker-game-shell .joker-game-shell-empty-stage {
            min-height: 0;
          }

          .joker-hilo-betting-panel.is-hilo-pre-game .joker-hilo-betting-actions {
            cursor: not-allowed;
          }

          .joker-hilo-betting-panel.is-hilo-pre-game .joker-button--hi-lo {
            pointer-events: none;
            cursor: not-allowed;
            opacity: 0.56;
          }

          .joker-hilo-stage {
            display: grid;
            width: 100%;
            height: 100%;
            min-height: 0;
            grid-template-rows: 132px minmax(0, 1fr);
            overflow: hidden;
            background:
              radial-gradient(circle at 50% 48%, color-mix(in srgb, var(--joker-gold-400) 3%, transparent), transparent 42%),
              color-mix(in srgb, var(--color-bg-sidebar) 92%, var(--joker-gold-1000));
          }

          .joker-hilo-history-row {
            display: grid;
            min-width: 0;
            align-items: center;
            overflow: hidden;
            border-bottom: var(--border-width-default) solid var(--joker-black-300);
            background:
              linear-gradient(180deg, color-mix(in srgb, var(--joker-black-700) 38%, transparent), transparent),
              color-mix(in srgb, var(--color-bg-sidebar) 96%, var(--joker-gold-1000));
            padding: 0 var(--spacing-24);
          }

          .joker-hilo-history-track {
            display: flex;
            min-width: 0;
            align-items: center;
            padding-top: var(--spacing-24);
          }

          .joker-hilo-history-item {
            position: relative;
            display: grid;
            flex: 0 0 auto;
            place-items: center;
            margin-right: var(--spacing-12);
          }

          .joker-hilo-history-item:last-child {
            margin-right: 0;
          }

          .joker-hilo-mini-card {
            position: relative;
            z-index: 1;
            display: inline-flex;
            width: 82px;
            height: 52px;
            flex: 0 0 auto;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-4);
            border: 0;
            border-radius: var(--radius-xs, var(--radius-sm));
            background: var(--joker-white-50);
            box-shadow:
              0 var(--spacing-4) var(--spacing-12) rgb(0 0 0 / 0.18),
              inset 0 0 0 var(--border-width-default) color-mix(in srgb, var(--joker-black-900) 10%, transparent);
          }

          .joker-hilo-history-chip {
            position: absolute;
            top: calc(var(--spacing-12) * -1);
            left: 50%;
            z-index: 4;
            display: inline-grid;
            width: 56px;
            height: 24px;
            place-items: center;
            border: 2px solid var(--joker-black-800);
            border-radius: 999px;
            background: var(--joker-green-600);
            color: var(--joker-white-50);
            font-family: var(--font-body);
            font-size: 12px;
            font-weight: 600;
            line-height: 1;
            transform: translateX(-50%);
            white-space: nowrap;
            box-shadow: 0 var(--spacing-4) var(--spacing-8) rgb(0 0 0 / 0.32);
          }

          .joker-hilo-history-chip--skip {
            background: #28958e;
          }

          .joker-hilo-history-chip--end {
            background: var(--joker-red-600);
          }

          .joker-hilo-history-arrow {
            position: absolute;
            top: 50%;
            left: calc(100% + (var(--spacing-12) * 0.5));
            z-index: 8;
            display: grid;
            width: var(--spacing-32);
            height: var(--spacing-24);
            place-items: center;
            border: 2px solid var(--joker-black-800);
            border-radius: 999px;
            background: var(--joker-black-200);
            transform: translate(-50%, -50%);
            box-shadow: 0 var(--spacing-4) var(--spacing-8) rgb(0 0 0 / 0.34);
          }

          .joker-hilo-history-arrow-icon {
            display: block;
            width: 13px;
            height: 13px;
            object-fit: contain;
          }

          .joker-hilo-history-arrow--skip .joker-hilo-history-arrow-icon {
            rotate: 90deg;
          }

          .joker-hilo-mini-card-icon {
            display: block;
            width: 20px;
            height: 20px;
            background: currentColor;
            mask: var(--suit-icon) center / contain no-repeat;
            -webkit-mask: var(--suit-icon) center / contain no-repeat;
          }

          .joker-hilo-mini-card-rank {
            display: inline-block;
            font-family: "Teko", var(--font-display);
            font-size: 30px;
            font-weight: 500;
            line-height: 1;
            transform: translateY(0.06em);
          }

          .joker-hilo-mini-card--red .joker-hilo-mini-card-rank {
            color: #df3d3f;
          }

          .joker-hilo-mini-card--black .joker-hilo-mini-card-rank {
            color: var(--joker-black-900);
          }

          .joker-hilo-mini-card--red {
            color: #df3d3f;
          }

          .joker-hilo-mini-card--black {
            color: var(--joker-black-900);
          }

          .joker-hilo-history-item.is-latest {
            animation: joker-hilo-history-enter var(--motion-slow) var(--ease-out) both;
          }

          .joker-hilo-main-area {
            display: grid;
            height: 100%;
            min-height: 0;
            grid-template-rows: auto auto;
            align-content: center;
            gap: calc(var(--spacing-32) + var(--spacing-8));
            padding: var(--spacing-24);
          }

          .joker-hilo-game-frame {
            position: relative;
            isolation: isolate;
            display: grid;
            width: 100%;
            height: 415px;
            min-height: 0;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            justify-items: center;
            gap: var(--spacing-32);
            border: 0;
            border-radius: 9999px;
            background:
              radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--joker-gold-400) 3%, transparent), transparent 36%),
              linear-gradient(180deg, var(--color-bg-surface), var(--color-bg-code));
            box-shadow:
              inset 0 0 var(--spacing-64) rgb(0 0 0 / 0.28);
            padding: 0 clamp(var(--spacing-64), 10vw, 180px);
          }

          .joker-hilo-game-frame::before {
            position: absolute;
            inset: 0;
            z-index: 0;
            border: 2px dashed var(--color-border-default);
            border-radius: inherit;
            background: transparent;
            content: "";
            pointer-events: none;
          }

          .joker-hilo-main-card-wrap {
            position: relative;
            display: grid;
            place-items: center;
            padding-bottom: var(--spacing-24);
          }

          .joker-hilo-main-card-stack {
            position: absolute;
            left: 50%;
            bottom: 0;
            z-index: 1;
            display: block;
            width: 184px;
            height: 32px;
            justify-items: stretch;
            transform: translateX(-50%);
          }

          .joker-hilo-main-card-stack-line {
            display: block;
            position: absolute;
            right: 0;
            bottom: calc(var(--stack-index, 0) * 6px);
            left: 0;
            height: 18px;
            border: 2px solid color-mix(in srgb, var(--joker-black-50) 70%, var(--joker-white-50));
            border-top: 0;
            border-radius: 0 0 var(--radius-sm) var(--radius-sm);
            background: var(--joker-white-50);
            box-shadow: 0 1px 0 color-mix(in srgb, var(--joker-black-50) 72%, var(--joker-white-50));
          }

          .joker-hilo-main-card {
            position: relative;
            z-index: 2;
            display: grid;
            width: 184px;
            height: 260px;
            place-items: center;
            overflow: visible;
            border: 2px solid color-mix(in srgb, var(--joker-black-50) 72%, var(--joker-white-50));
            border-radius: var(--radius-sm);
            background: var(--joker-white-50);
            box-shadow:
              0 var(--spacing-20) calc(var(--spacing-64) + var(--spacing-16)) rgb(0 0 0 / 0.44),
              0 0 0 var(--border-width-default) rgb(255 255 255 / 0.18);
            animation: joker-hilo-card-draw var(--motion-slow) var(--ease-out) both;
          }

          .joker-hilo-main-card-face {
            display: grid;
            justify-items: center;
            gap: var(--spacing-20);
            color: var(--joker-red-400);
          }

          .joker-hilo-main-card--black .joker-hilo-main-card-face {
            color: var(--joker-black-900);
          }

          .joker-hilo-main-card--red .joker-hilo-main-card-face {
            color: var(--joker-red-400);
          }

          .joker-hilo-main-card-rank {
            font-family: "Teko", var(--font-display);
            font-size: 84px;
            font-weight: 500;
            line-height: 0.86;
            transform: translateY(0.06em);
          }

          .joker-hilo-main-card-suit {
            display: block;
            width: 66px;
            height: 66px;
            background: currentColor;
            mask: var(--suit-icon) center / contain no-repeat;
            -webkit-mask: var(--suit-icon) center / contain no-repeat;
          }

          .joker-hilo-main-card-skip {
            position: absolute;
            top: calc(var(--spacing-16) * -1);
            right: calc(var(--spacing-24) * -1);
            z-index: 4;
            display: inline-flex;
            width: 72px;
            height: 42px;
            align-items: center;
            justify-content: center;
            border: var(--border-width-default) solid var(--joker-gold-400);
            border-radius: 999px;
            background: var(--joker-gold-1000);
            color: var(--joker-white-50);
            box-shadow: 0 var(--spacing-8) var(--spacing-16) rgb(0 0 0 / 0.42);
            cursor: pointer;
            appearance: none;
            transition:
              background var(--motion-fast) var(--ease-standard),
              border-color var(--motion-fast) var(--ease-standard),
              transform var(--motion-fast) var(--ease-standard);
          }

          .joker-hilo-main-card-skip:hover {
            border-color: var(--joker-gold-300);
            background: var(--joker-gold-900);
            transform: translateY(calc(var(--spacing-2, 2px) * -1));
          }

          .joker-hilo-main-card-skip-chevrons {
            display: inline-flex;
            align-items: center;
          }

          .joker-hilo-main-card-skip-chevron {
            width: 18px;
            height: 18px;
            color: var(--joker-white-50);
          }

          .joker-hilo-main-card-skip-chevron + .joker-hilo-main-card-skip-chevron {
            margin-left: -10px;
          }

          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }

          .joker-hilo-prediction-group {
            display: grid;
            align-content: end;
            justify-items: center;
            gap: var(--spacing-8);
            transform: translateY(calc(var(--spacing-24) + var(--spacing-8)));
          }

          .joker-hilo-prediction-card {
            position: relative;
            display: grid;
            width: 154px;
            height: 220px;
            grid-template-rows: minmax(0, 1fr) 40px;
            justify-items: center;
            border: var(--border-width-default) solid var(--joker-black-200);
            border-radius: var(--radius-sm);
            background: var(--button-hi-lo-bg, var(--joker-black-400));
            box-shadow:
              0 var(--spacing-8) var(--spacing-24) rgb(0 0 0 / 0.24);
            padding: var(--spacing-24) var(--spacing-8) var(--spacing-8);
            opacity: 0.86;
            cursor: pointer;
            transition:
              border-color var(--motion-fast) var(--ease-standard),
              opacity var(--motion-fast) var(--ease-standard),
              transform var(--motion-fast) var(--ease-standard);
          }

          .joker-hilo-prediction-card:disabled {
            cursor: default;
            opacity: 0.62;
          }

          .joker-hilo-prediction-card:not(:disabled):hover {
            border-color: var(--joker-black-200);
            opacity: 1;
            transform: translateY(calc(var(--spacing-4) * -1));
          }

          .joker-hilo-prediction-main {
            display: grid;
            align-content: start;
            justify-items: center;
            gap: var(--spacing-16);
          }

          .joker-hilo-prediction-icon {
            display: block;
            width: 32px;
            height: 32px;
            object-fit: contain;
            opacity: 0.88;
          }

          .joker-hilo-prediction-copy {
            display: grid;
            grid-template-rows: 24px var(--border-width-default) 24px;
            align-items: center;
            justify-items: center;
            gap: var(--spacing-4);
            color: var(--joker-white-50);
            font-family: var(--font-body);
            font-size: var(--text-body-14);
            font-weight: var(--text-body-weight);
            line-height: var(--text-body-line-height);
            text-transform: none;
          }

          .joker-hilo-prediction-label {
            display: block;
            height: 24px;
            line-height: var(--text-body-line-height);
            transform: none;
          }

          .joker-hilo-prediction-divider {
            width: 64px;
            height: var(--border-width-default);
            background: var(--joker-black-200);
          }

          .joker-hilo-prediction-multiplier {
            display: inline-flex;
            width: 100%;
            height: 40px;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-4);
            border: var(--border-width-default) solid var(--joker-black-400);
            border-radius: var(--radius-xs, var(--radius-sm));
            background: var(--joker-black-600);
            color: var(--joker-white-50);
            font-family: "Teko", var(--font-display);
            line-height: 1;
          }

          .joker-hilo-prediction-x {
            font-size: 20px;
            font-weight: 500;
            transform: translateY(0.08em);
          }

          .joker-hilo-prediction-number {
            font-size: 20px;
            font-weight: 500;
            transform: translateY(0.08em);
          }

          .joker-hilo-prediction-support {
            width: 154px;
            color: color-mix(in srgb, var(--joker-black-50) 66%, var(--joker-black-100));
            font-family: var(--font-body);
            font-size: 12px;
            font-weight: var(--text-body-weight);
            line-height: var(--text-body-line-height);
            text-align: center;
          }

          .joker-hilo-stage-choice-row {
            display: grid;
            width: 100%;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: var(--spacing-12);
            padding: var(--spacing-12);
            margin-top: 0;
            border: var(--border-width-default) solid var(--joker-black-300);
            border-radius: var(--radius-md, 8px);
            background: var(--joker-black-700);
          }

          .joker-hilo-status {
            justify-self: center;
            color: var(--joker-black-50);
            font-family: var(--font-body);
            font-size: var(--text-body-14);
            font-weight: var(--text-body-weight);
            line-height: var(--text-body-line-height);
          }

          .joker-hilo-status--cash-out,
          .joker-hilo-status--win {
            color: var(--joker-green-400);
          }

          .joker-hilo-status--loss {
            color: var(--joker-red-400);
          }

          @keyframes joker-hilo-card-draw {
            0% {
              opacity: 0;
              transform: translateY(var(--spacing-16)) scale(0.985);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes joker-hilo-history-enter {
            0% {
              opacity: 0;
              transform: translateY(var(--spacing-24)) scale(1.08);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .joker-mines-frame-footer {
            display: grid;
            grid-column: 1 / -1;
            grid-template-columns: auto minmax(0, 1fr) auto;
            align-items: center;
            min-height: calc(var(--spacing-64) - var(--spacing-8));
            border-top: var(--border-width-default) solid var(--joker-black-300);
            background: var(--joker-black-500);
            padding: 0 var(--spacing-24);
          }

          .joker-mines-footer-actions {
            display: flex;
            align-items: center;
            gap: var(--spacing-8);
            min-width: 0;
          }

          .joker-mines-footer-button {
            display: inline-grid;
            width: var(--spacing-32);
            height: var(--spacing-32);
            place-items: center;
            border: 0;
            border-radius: var(--radius-sm);
            background: transparent;
            color: color-mix(in srgb, var(--joker-white-50) 68%, var(--joker-black-50));
            cursor: pointer;
            padding: 0;
          }

          .joker-mines-footer-icon {
            display: block;
            width: var(--spacing-20, calc(var(--spacing-16) + var(--spacing-4)));
            height: var(--spacing-20, calc(var(--spacing-16) + var(--spacing-4)));
            object-fit: contain;
            pointer-events: none;
          }

          .joker-mines-footer-logo {
            display: block;
            grid-column: 3;
            justify-self: end;
            width: clamp(calc(var(--spacing-64) + var(--spacing-8)), 7vw, calc(var(--spacing-64) + var(--spacing-40)));
            max-height: var(--spacing-24);
            opacity: 0.38;
            filter: grayscale(1);
            pointer-events: none;
            user-select: none;
          }

          .joker-mines-footer-spacer {
            grid-column: 2;
            grid-row: 1;
            min-width: 0;
          }
        `}
      </style>
      <div className="joker-game-shell joker-game-shell--hilo">
        <Navigation
          balance={formatBalance(balance)}
          className="joker-game-shell-navigation"
          defaultValue={hiloNavigationPreset.defaultValue}
          onValueChange={onGameChange}
          value={hiloNavigationPreset.selectedValue}
        >
          <main className="joker-game-shell-stage" aria-label="Game stage">
            <GameHeaderRail game={hiloNavigationPreset.game} />
            <div className="joker-game-shell-play-area">
              <aside className="joker-game-shell-betting">
                <PackagedHiloBettingPanel
                  betAmount={betAmount}
                  currentProfit={currentProfit}
                  gameInPlay={gameInPlay}
                  higherOdds={formatHiloPercent(odds.higherPercent)}
                  lowerOdds={formatHiloPercent(odds.lowerPercent)}
                  onBetAmountChange={setBetAmount}
                  onPlaceBet={handleBetAction}
                  onHigherSame={() => handlePrediction("higher")}
                  onLowerSame={() => handlePrediction("lower")}
                  onSkipCard={handleSkipCard}
                  roundStatus={roundStatus}
                  skipAvailable={skipAvailable}
                />
              </aside>
              <div className="joker-game-shell-empty-stage" aria-label="Game canvas">
                <HiloStage
                  currentCard={currentCard}
                  choicesDisabled={!gameInPlay}
                  higherMultiplier={higherMultiplier}
                  higherPercent={odds.higherPercent}
                  history={history}
                  lowerMultiplier={lowerMultiplier}
                  lowerPercent={odds.lowerPercent}
                  message={message}
                  onHigherSame={() => handlePrediction("higher")}
                  onLowerSame={() => handlePrediction("lower")}
                  onSkipCard={handleSkipCard}
                  roundStatus={roundStatus}
                  skipAvailable={skipAvailable}
                />
              </div>
            </div>
          </main>
        </Navigation>
      </div>
      {playArea && createPortal(<GameShellFooter />, playArea)}
    </>
  );
}

function HiloStage({
  choicesDisabled,
  currentCard,
  higherMultiplier,
  higherPercent,
  history,
  lowerMultiplier,
  lowerPercent,
  message,
  onHigherSame,
  onLowerSame,
  onSkipCard,
  roundStatus,
  skipAvailable,
}) {
  return (
    <section className="joker-hilo-stage" aria-label="Hilo game board">
      <div className="joker-hilo-history-row" aria-label="Previous cards">
        <div className="joker-hilo-history-track">
          {history.map((card, index) => (
            <div
              className={`joker-hilo-history-item ${index === history.length - 1 ? "is-latest" : ""}`.trim()}
              key={`${card.id}-${index}`}
            >
              <HiloMiniCard card={card} />
              {card.next && <HiloHistoryArrow direction={card.next} />}
            </div>
          ))}
        </div>
      </div>
      <div className="joker-hilo-main-area">
        <div className="joker-hilo-game-frame" aria-label="Hilo game area">
          <HiloPredictionCard
            direction="down"
            disabled={roundStatus !== "active"}
            onClick={onLowerSame}
            primaryLabel="Lower"
            secondaryLabel="Same"
            multiplier={lowerMultiplier.toFixed(2)}
            support={
              <>
                Ace being the
                <br />
                Lowest
              </>
            }
          />
          <HiloMainCard
            card={currentCard}
            key={currentCard.id}
            onSkipCard={onSkipCard}
            skipAvailable={skipAvailable && roundStatus === "active"}
          />
          <HiloPredictionCard
            direction="up"
            disabled={roundStatus !== "active"}
            onClick={onHigherSame}
            primaryLabel="Higher"
            secondaryLabel="Same"
            multiplier={higherMultiplier.toFixed(2)}
            support={
              <>
                King being the
                <br />
                Highest
              </>
            }
          />
        </div>
        <div className="joker-hilo-stage-choice-row" aria-label="Hilo choices">
          <HiloChoiceButton
            disabled={choicesDisabled}
            direction="down"
            label="Lower / Same"
            onClick={onLowerSame}
            percentage={formatHiloPercent(lowerPercent)}
          />
          <HiloChoiceButton
            disabled={choicesDisabled}
            direction="up"
            label="Higher / Same"
            onClick={onHigherSame}
            percentage={formatHiloPercent(higherPercent)}
          />
        </div>
        {message && (
          <div className={`joker-hilo-status joker-hilo-status--${roundStatus}`} role="status" aria-live="polite">
            {message}
          </div>
        )}
      </div>
    </section>
  );
}

function HiloMainCard({ card, onSkipCard, skipAvailable }) {
  return (
    <div className="joker-hilo-main-card-wrap">
      <div className="joker-hilo-main-card-stack" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <span className="joker-hilo-main-card-stack-line" key={index} style={{ "--stack-index": index }} />
        ))}
      </div>
      <div className={`joker-hilo-main-card joker-hilo-main-card--${card.tone}`} aria-label={`${card.rank} of ${card.suit}`}>
        <div className="joker-hilo-main-card-face">
          <span className="joker-hilo-main-card-rank">{card.rank}</span>
          <SuitIcon className="joker-hilo-main-card-suit" icon={card.icon} />
        </div>
      </div>
      {skipAvailable && (
        <button className="joker-hilo-main-card-skip" onClick={onSkipCard} type="button">
          <span className="joker-hilo-main-card-skip-chevrons" aria-hidden="true">
            <ChevronRightIcon className="joker-hilo-main-card-skip-chevron" />
            <ChevronRightIcon className="joker-hilo-main-card-skip-chevron" />
          </span>
          <span className="sr-only">Skip card</span>
        </button>
      )}
    </div>
  );
}

function HiloPredictionCard({
  disabled,
  direction,
  onClick,
  primaryLabel,
  secondaryLabel,
  multiplier,
  support,
}) {
  const icon = direction === "down" ? downArrowIcon : upArrowIcon;

  return (
    <div className="joker-hilo-prediction-group">
      <button
        className="joker-hilo-prediction-card"
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        <div className="joker-hilo-prediction-main">
          <img className="joker-hilo-prediction-icon" src={icon} alt="" aria-hidden="true" />
          <div className="joker-hilo-prediction-copy">
            <span className="joker-hilo-prediction-label">{primaryLabel}</span>
            <span className="joker-hilo-prediction-divider" aria-hidden="true" />
            <span className="joker-hilo-prediction-label">{secondaryLabel}</span>
          </div>
        </div>
        <div className="joker-hilo-prediction-multiplier" aria-label={`${multiplier} times`}>
          <span className="joker-hilo-prediction-x">x</span>
          <span className="joker-hilo-prediction-number">{multiplier}</span>
        </div>
      </button>
      <span className="joker-hilo-prediction-support">{support}</span>
    </div>
  );
}

function HiloChoiceButton({ disabled, direction, label, onClick, percentage }) {
  return (
    <Button disabled={disabled} variant="hi-lo" fullWidth type="button" onClick={onClick}>
      <span className="joker-hi-lo-label">{label}</span>
      <span className="joker-hi-lo-odds">
        <span className={`joker-hi-lo-chevron${direction === "up" ? " is-up" : ""}`} aria-hidden="true">
          <HiloChoiceChevronIcon direction={direction} />
        </span>
        <span>{percentage}</span>
      </span>
    </Button>
  );
}

function HiloChoiceChevronIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d={direction === "up" ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="m9 6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function HiloMiniCard({ card }) {
  return (
    <>
      <span className={`joker-hilo-history-chip joker-hilo-history-chip--${card.chipTone}`}>
        {card.chip}
      </span>
      <div className={`joker-hilo-mini-card joker-hilo-mini-card--${card.tone}`} aria-label={`${card.rank} of ${card.suit}`}>
        <SuitIcon className="joker-hilo-mini-card-icon" icon={card.icon} />
        <span className="joker-hilo-mini-card-rank">{card.rank}</span>
      </div>
    </>
  );
}

function SuitIcon({ className, icon }) {
  return (
    <span
      className={className}
      style={{ "--suit-icon": `url("${icon}")` }}
      aria-hidden="true"
    />
  );
}

function HiloHistoryArrow({ direction }) {
  const source = direction === "down" ? downArrowIcon : upArrowIcon;

  return (
    <span className={`joker-hilo-history-arrow joker-hilo-history-arrow--${direction}`} aria-hidden="true">
      <img className="joker-hilo-history-arrow-icon" src={source} alt="" />
    </span>
  );
}

function MinesGrid({
  board,
  cashoutResult,
  freshRevealedTiles,
  hasBetAmount,
  multiplier,
  onTileClick,
  revealedTiles,
  roundStatus,
}) {
  return (
    <section className="joker-mines-stage" aria-label="Mines game board">
      <div className="joker-mines-board-area">
        <div
          className={`joker-mines-grid ${hasBetAmount ? "is-bet-ready" : ""} ${roundStatus === "lost" ? "is-round-lost" : ""} ${cashoutResult ? "is-cashed-out" : ""}`.trim()}
        >
          {mineTiles.map((tile, index) => {
            const revealed = revealedTiles.includes(tile);
            const freshReveal = freshRevealedTiles.includes(tile);
            const tileData = board[index];
            const tileContent = getTileContent(tileData);
            const blockedByShield = Boolean(tileData?.blockedByShield);
            const displayState = revealed ? tileContent : "default";
            const asset = tileStateAssets[displayState];

            return (
              <button
                key={tile}
                className={`joker-mines-tile joker-mines-tile--${displayState} ${revealed ? "joker-mines-tile--revealed" : ""} ${freshReveal ? "joker-mines-tile--fresh-reveal" : ""} ${blockedByShield ? "joker-mines-tile--shield-blocked" : ""}`.trim()}
                type="button"
                aria-label={`Tile ${tile}: ${asset.label}`}
                aria-pressed={revealed}
                data-selected={revealed || undefined}
                onClick={() => onTileClick(tile)}
              >
                <span className="joker-mines-tile-surface">
                  <img
                    className={`joker-mines-tile-icon joker-mines-tile-icon--${displayState}`}
                    src={asset.src}
                    alt=""
                  />
                  {freshReveal &&
                    (displayState === "gold" || displayState === "joker") &&
                    Array.from({ length: 6 }, (_, particleIndex) => (
                      <span
                        className="joker-mines-particle"
                        key={particleIndex}
                        aria-hidden="true"
                      />
                    ))}
                  {freshReveal &&
                    displayState === "dynamite" &&
                    Array.from({ length: 5 }, (_, smokeIndex) => (
                      <span
                        className="joker-mines-smoke"
                        key={smokeIndex}
                        aria-hidden="true"
                      />
                    ))}
                  {blockedByShield && (
                    <span className="joker-mines-shield-badge" aria-hidden="true">
                      <img src={shieldIcon} alt="" />
                    </span>
                  )}
                </span>
                {freshReveal && displayState === "gold" && (
                  <span className="joker-mines-tile-multiplier">
                    {multiplier.toFixed(2)}x
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {cashoutResult && (
          <div className="joker-mines-cashout-card" role="status" aria-live="polite">
            <span className="joker-mines-cashout-multiplier">
              {cashoutResult.multiplier.toFixed(2)}x
            </span>
            <span className="joker-mines-cashout-copy">
              Cashout {formatCurrency(cashoutResult.profit)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function GameShellFooter() {
  return (
    <footer className="joker-mines-frame-footer" aria-label="Game tools">
      <div className="joker-mines-footer-actions">
        <button className="joker-mines-footer-button" type="button" aria-label="Settings">
          <img className="joker-mines-footer-icon" src={settingsIcon} alt="" aria-hidden="true" />
        </button>
        <button className="joker-mines-footer-button" type="button" aria-label="Favourite">
          <img className="joker-mines-footer-icon" src={starIcon} alt="" aria-hidden="true" />
        </button>
        <button className="joker-mines-footer-button" type="button" aria-label="Statistics">
          <img className="joker-mines-footer-icon" src={graphIcon} alt="" aria-hidden="true" />
        </button>
      </div>
      <img className="joker-mines-footer-logo" src={jokerDimmedLogo} alt="" aria-hidden="true" />
      <span className="joker-mines-footer-spacer" aria-hidden="true" />
    </footer>
  );
}

function PackagedMinesBettingPanel({
  betAmount,
  bettingMode,
  currentProfit,
  gameInPlay,
  mines,
  multiplier,
  nextMultiplier,
  nextProfit,
  onBetAmountChange,
  onMinesChange,
  onModeChange,
  onPlaceBet,
}) {
  const [numberOfBets, setNumberOfBets] = useState("");

  function handleBetAmountChange(event) {
    onBetAmountChange(event.currentTarget.value.replace(/[^\d.]/g, ""));
  }

  function handleMinesAmountChange(nextValue) {
    onMinesChange(String(clampTileAmount(nextValue)));
  }

  function handleNumberOfBetsChange(event) {
    setNumberOfBets(event.currentTarget.value.replace(/\D/g, ""));
  }

  return (
    <JokerMinesBettingPanel
      mode={bettingMode}
      onModeChange={onModeChange}
      onPlaceBet={onPlaceBet}
      onCashout={onPlaceBet}
      inGame={gameInPlay}
      cashoutLabel={`Cashout ${formatCurrency(currentProfit)}`}
      inGameCardProps={{
        currentProfit: formatCurrency(currentProfit),
        nextValue: formatCurrency(nextProfit),
        currentMultiplier: `${multiplier.toFixed(2)}x`,
        nextMultiplier: `${nextMultiplier.toFixed(2)}x`,
      }}
      betAmount={betAmount}
      onBetAmountChange={handleBetAmountChange}
      minesAmountOptions={gameOptions}
      minesAmount={mines}
      onMinesAmountChange={handleMinesAmountChange}
      numberOfBets={numberOfBets}
      onNumberOfBetsChange={handleNumberOfBetsChange}
    />
  );
}

function PackagedHiloBettingPanel({
  betAmount,
  currentProfit,
  gameInPlay,
  higherOdds,
  lowerOdds,
  onBetAmountChange,
  onHigherSame,
  onLowerSame,
  onPlaceBet,
  onSkipCard,
  roundStatus,
  skipAvailable,
}) {
  function handleBetAmountChange(event) {
    onBetAmountChange(event.currentTarget.value.replace(/[^\d.]/g, ""));
  }

  return (
    <JokerHiLoBettingPanel
      betAmount={betAmount}
      className={gameInPlay ? "" : "is-hilo-pre-game"}
      onBetAmountChange={handleBetAmountChange}
      onPlaceBet={onPlaceBet}
      onCashout={onPlaceBet}
      onLowerSame={gameInPlay ? onLowerSame : undefined}
      onHigherSame={gameInPlay ? onHigherSame : undefined}
      onSkipCard={gameInPlay && skipAvailable ? onSkipCard : undefined}
      inGame={gameInPlay}
      cashoutLabel={`Cashout ${formatCurrency(currentProfit)}`}
      lowerOdds={lowerOdds}
      higherOdds={higherOdds}
      skipLabel={skipAvailable ? "Skip Card" : "Skip Used"}
    />
  );
}
