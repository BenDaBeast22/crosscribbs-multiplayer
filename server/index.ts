import express from "express";

import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import GameController from "./gameController.js";
import { getGame, lobbies, games, deleteGame } from "./classes/gameHelpers.js";
const disconnectedPlayers: Record<string, NodeJS.Timeout> = {};

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // {  origin: ["http://localhost:5173", "https://cross-cribbs.up.railway.app"], credentials: true,}
app.use(express.json());
// app.use(express.static(path.join(__dirname, "..", "public")));
// app.use(express.static(__dirname));

// Serve Vite frontend build
// const frontendPath = path.join(__dirname, "..", "client");
// app.use(express.static(frontendPath));
// console.log("frontendPath = ", frontendPath);

// // Handle frontend routes (React Router)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(frontendPath, "index.html"));
// });

// HTTP + Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://cross-cribbs.up.railway.app",
      "https://crosscribbs-multiplayer.onrender.com",
    ],
    methods: ["GET", "POST"],
  },
});

let lobbyCounter = 1;

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Create Lobby
  socket.on("createLobby", (username, numPlayers, playerId, callback) => {
    console.log("test create lobby");
    const lobbyId = String(lobbyCounter++);
    lobbies[lobbyId] = {
      players: [{ id: socket.id, name: username, playerId: playerId }],
      host: playerId,
      numPlayers,
      id: lobbyId,
    };
    socket.join(lobbyId);
    socket.data.lobbyId = lobbyId;
    callback({ lobbyId });
    console.log(`lobby created: lobby id: ${lobbyId}`);
    io.to(lobbyId).emit("lobbyUpdate", lobbies[lobbyId]);
  });

  // Join Lobby
  socket.on("joinLobby", (lobbyId, username, playerId, callback) => {
    console.log("join lobby id: ", lobbyId);
    console.log("all lobbies = ", lobbies);
    const lobby = lobbies[lobbyId];

    if (!lobby) return callback({ error: "Lobby not found" });
    if (lobby.players.length >= lobby.numPlayers) return callback({ error: "Lobby full" });

    if (lobby.players.find((player) => player.playerId === playerId))
      return callback({ error: "Player already in lobby" });

    // for (const player of lobby.players) {
    // }

    lobby.players.push({ id: socket.id, name: username, playerId: playerId });
    socket.join(lobbyId);
    socket.data.lobbyId = lobbyId;
    callback({ lobbyId });
    io.to(lobbyId).emit("lobbyUpdate", lobby);
  });

  socket.on("getLobbyInfo", ({ lobbyId }, callback) => {
    const lobby = lobbies[lobbyId];
    if (!lobby) return callback({ error: "Lobby not found" });
    callback({ lobby });
  });

  socket.on("rejoinLobby", ({ lobbyId, playerId }) => {
    if (disconnectedPlayers[playerId]) {
      clearTimeout(disconnectedPlayers[playerId]);
      delete disconnectedPlayers[playerId];
    }

    const lobby = lobbies[lobbyId];
    if (!lobby) return;

    const player = lobby.players.find((p) => p.id === playerId);
    if (player) {
      player.id = socket.id; // update socket
      socket.join(lobbyId);
      socket.data.lobbyId = lobbyId;
    }
  });

  socket.on("startGame", ({ lobbyId, numPlayers }) => {
    if (lobbyId) {
      // Multiplayer game tied to a lobby
      const lobby = lobbies[lobbyId] ?? null;
      games[lobbyId] = new GameController(numPlayers, lobby);
      const newGame = getGame(socket.id, lobbyId);
      if (!newGame) return;
      io.to(lobbyId).emit("gameStateUpdate", games[lobbyId].getGameState());
      console.log(`Multiplayer game started in lobby ${lobbyId}`);
    } else {
      // Local game (hosted just on this client)
      const localLobbyId = socket.id; // unique socket id i.e "42SXdaf123"
      games[localLobbyId] = new GameController(numPlayers);
      socket.emit("gameStateUpdate", games[localLobbyId].getGameState());
      console.log(`Local game started for ${socket.id}`);
    }
  });

  // Handle "startGame" event
  socket.on("resetGame", ({ lobbyId }) => {
    const game = getGame(socket.id, lobbyId);
    if (!game) return;

    game.resetGame();
    io.emit("gameStateUpdate", game.getGameState()); // broadcast to all clients
  });

  // Handle "selectCard" event
  // socket.on("selectCard", ({ lobbyId, player, card }) => {
  //   const game = getGame(socket.id, lobbyId);
  //   if (!game) return;

  //   const success = game.selectCard(player, card);
  //   if (success) io.emit("gameStateUpdate", game.getGameState());
  // });

  // Handle "playCard" event
  socket.on("playCard", ({ lobbyId, playerId, pos }) => {
    const game = getGame(socket.id, lobbyId);
    if (!game) return;

    const success = game.applyMove(pos, playerId);

    if (success) {
      if (lobbyId) {
        // multiplayer
        io.to(lobbyId).emit("gameStateUpdate", game.getGameState());
      } else {
        // local
        socket.emit("gameStateUpdate", game.getGameState());
      }
    } else {
      socket.emit("invalidMove");
    }
  });

  // Example: next round
  socket.on("nextRound", (data = {}) => {
    const { lobbyId } = data;
    const game = getGame(socket.id, lobbyId);
    if (!game) return;

    game.nextRound();

    if (lobbyId) {
      // multiplayer
      io.emit("gameStateUpdate", game.getGameState());
    } else {
      // local
      socket.emit("gameStateUpdate", game.getGameState());
    }
  });

  socket.on("selectDealer", ({ lobbyId, winningPlayer }) => {
    const game = getGame(socket.id, lobbyId);
    if (!game) return;

    game.selectDealer(winningPlayer);
    io.emit("gameStateUpdate", game.getGameState());
  });

  socket.on("discardToCrib", ({ lobbyId, numPlayers, player, card, playerId }) => {
    const game = getGame(socket.id, lobbyId);
    if (!game) return;
    const success = game.discardToCrib(numPlayers, player, card, playerId);
    if (success) {
      io.emit("gameStateUpdate", game.getGameState());
    }
  });

  socket.on("rejoinGame", ({ lobbyId, playerId }) => {
    const game = getGame(socket.id, lobbyId);
    if (game) {
      // Update the player's socket mapping
      // Re-join the socket to the correct room for future broadcasts
      socket.join(lobbyId);
      // Send the latest state to the re-joining player
      socket.emit("gameStateUpdate", game.getGameState());
    } else {
      // Handle case where the lobby doesn't exist
      socket.emit("error", { message: "Lobby not found." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // find the lobby the socket was in
    const lobbyId = socket.data.lobbyId;
    const lobby = lobbies[lobbyId];
    console.log("lobby disconnect = ", lobby);
    if (!lobby) return;

    // find the player
    const playerIndex = lobby.players.findIndex((p) => p.id === socket.id);
    if (playerIndex === -1) return;

    const player = lobby.players[playerIndex];
    console.log("dc player = ", player);

    // start a 30-second timer
    disconnectedPlayers[player.id] = setTimeout(() => {
      lobby.players.splice(playerIndex, 1); // remove player from lobby
      // reasign host
      if (lobby.host === player.id && lobby.players.length > 0) {
        lobby.host = lobby.players[0].playerId; // first player becomes host
      }
      io.to(lobby.id).emit("lobbyUpdate", lobby);
      console.log("player disconnect lobby");
    }, 5000); // 30 seconds
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Game testing interface available at: http://localhost:${PORT}/test-game`);
});
