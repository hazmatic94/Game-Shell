import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "@joker/design-system/styles/tokens.css";
import "@joker/design-system/styles/button.css";
import "@joker/design-system/styles/inputs.css";
import "@joker/design-system/styles/shell.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
