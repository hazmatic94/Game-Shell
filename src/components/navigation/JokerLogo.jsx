const jokerLogo = new URL("../../../assets/jokerLogo.svg", import.meta.url).href;

export function JokerLogo({ href = "#" }) {
  return (
    <a className="joker-logo-component" href={href} aria-label="Joker">
      <img src={jokerLogo} alt="Joker" />
    </a>
  );
}
