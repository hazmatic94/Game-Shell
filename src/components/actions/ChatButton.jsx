import { MessageSquare } from "lucide-react";
import { IconButton } from "../ui/IconButton.jsx";

export function ChatButton(props) {
  return <IconButton label="Messages" {...props}><MessageSquare aria-hidden="true" /></IconButton>;
}
