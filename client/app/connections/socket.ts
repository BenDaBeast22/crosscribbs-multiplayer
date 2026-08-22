// client/socket.ts
import { io } from "socket.io-client";

// export const socket = io();
const socketUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
export const socket = io(socketUrl);

// optional: log connection once
socket.on("connect", () => console.log("Socket connected:", socket.id));
