import { Gift } from "lucide-react";
import { IconButton } from "../ui/IconButton.jsx";

export function GiftButton(props) {
  return <IconButton label="Gifts" {...props}><Gift aria-hidden="true" /></IconButton>;
}
