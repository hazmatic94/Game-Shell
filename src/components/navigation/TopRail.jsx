import { ActionGroup } from "../actions/ActionGroup.jsx";
import { WalletControl } from "../wallet/WalletControl.jsx";
import { JokerLogo } from "./JokerLogo.jsx";

export function TopRail({ balance = "150,000" }) {
  return (
    <header className="joker-top-rail-demo">
      <div className="joker-top-rail-lane joker-top-rail-lane--left"><JokerLogo /></div>
      <div className="joker-top-rail-lane joker-top-rail-lane--center"><WalletControl balance={balance} /></div>
      <div className="joker-top-rail-lane joker-top-rail-lane--right"><ActionGroup /></div>
    </header>
  );
}
