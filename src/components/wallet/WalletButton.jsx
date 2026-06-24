import { Wallet } from "lucide-react";

export function WalletButton({ children = "Wallet", ...props }) {
  return (
    <button className="joker-wallet-action" type="button" aria-label={children} {...props}>
      <Wallet aria-hidden="true" />
    </button>
  );
}
