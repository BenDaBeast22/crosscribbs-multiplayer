import { createBrowserRouter } from "react-router-dom";

// Import your pages/components
import Home from "./routes/home";
import Menu from "./routes/menu";
import TestSocket from "./routes/test-socket";
import Game from "./routes/game";
import MultiplayerSetup from "./routes/multiplayer-setup";
import HostGame from "./routes/host-game";
import JoinGame from "./routes/join-game";
import Lobby from "./routes/lobby";
import NotFound from "./routes/not-found";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> }, // Home page
  { path: "/menu", element: <Menu /> },
  { path: "/test-socket", element: <TestSocket /> },
  { path: "/game", element: <Game /> }, // Local game
  { path: "/game/:lobbyId", element: <Game /> }, // Multiplayer game
  { path: "/multiplayer-setup", element: <MultiplayerSetup /> },
  { path: "/host-game", element: <HostGame /> },
  { path: "/join-game", element: <JoinGame /> },
  { path: "/lobby/:lobbyId", element: <Lobby /> }, // wildcard for lobby sub-routes
  { path: "*", element: <NotFound /> }, // catch-all 404
]);
