const userAvatar = new URL("../../../assets/user.png", import.meta.url).href;

export function UserAvatar({ src = userAvatar, label = "User" }) {
  return (
    <button className="joker-avatar-item" type="button" aria-label={label}>
      <img src={src} alt="" />
      <span className="joker-avatar-status" aria-hidden="true" />
    </button>
  );
}
