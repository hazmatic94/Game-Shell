import { Search } from "lucide-react";

export function RailSearch({ placeholder = "Search" }) {
  return (
    <label className="joker-rail-search-item">
      <Search aria-hidden="true" />
      <input type="search" placeholder={placeholder} />
    </label>
  );
}
