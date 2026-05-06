import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GameRoom from "./games.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GameRoom />
  </StrictMode>
);
