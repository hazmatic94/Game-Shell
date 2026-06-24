import { Bell } from "lucide-react";
import { IconButton } from "../ui/IconButton.jsx";

export function NotificationButton(props) {
  return <IconButton label="Notifications" {...props}><Bell aria-hidden="true" /></IconButton>;
}
