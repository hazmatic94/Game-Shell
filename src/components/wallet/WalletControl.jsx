import { BalanceDisplay } from "./BalanceDisplay.jsx";
import { WalletButton } from "./WalletButton.jsx";

export function WalletControl({ balance = "150,000", onWalletClick }) {
  return (
    <div className="joker-wallet-control" aria-label="Wallet balance">
      <BalanceDisplay balance={balance} />
      <WalletButton onClick={onWalletClick}>Wallet</WalletButton>
    </div>
  );
}
