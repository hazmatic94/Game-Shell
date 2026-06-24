const jokerCoin = new URL("../../../assets/jokerCoin.svg", import.meta.url).href;

export function BalanceDisplay({ balance = "150,000" }) {
  return (
    <span className="joker-wallet-balance">
      <span className="joker-wallet-coin" aria-hidden="true"><img src={jokerCoin} alt="" /></span>
      <span>{balance}</span>
    </span>
  );
}
