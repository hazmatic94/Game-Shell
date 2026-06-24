import { Button } from "../ui/Button.jsx";
import { BetAmountInput } from "./BetAmountInput.jsx";
import { BetModeToggle } from "./BetModeToggle.jsx";
import { CashoutInput } from "./CashoutInput.jsx";
import { ProfitInput } from "./ProfitInput.jsx";

export function BetPanel({ mode = "manual", onModeChange, onPlaceBet }) {
  return (
    <aside className="joker-betting-panel">
      <BetModeToggle value={mode} onChange={onModeChange} />
      <div className="joker-betting-divider" />
      <div className="joker-betting-fields">
        <BetAmountInput placeholder="0" />
        <CashoutInput placeholder="2.00x" />
        <ProfitInput value="0.00" />
      </div>
      <Button className="joker-bet-submit" onClick={onPlaceBet}>Place Bet</Button>
    </aside>
  );
}
