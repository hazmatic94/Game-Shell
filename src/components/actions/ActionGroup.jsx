import { ChatButton } from "./ChatButton.jsx";
import { GiftButton } from "./GiftButton.jsx";
import { NotificationButton } from "./NotificationButton.jsx";
import { UserAvatar } from "./UserAvatar.jsx";

export function ActionGroup() {
  return (
    <div className="joker-action-group-set">
      <GiftButton />
      <NotificationButton />
      <ChatButton />
      <UserAvatar />
    </div>
  );
}
